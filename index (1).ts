import { json, options } from "../_shared/http.ts";
import { requireUser, serviceClient } from "../_shared/supabase.ts";
import { optionalEnv, requiredEnv } from "../_shared/config.ts";

type ReleaseAction = "status" | "deploy" | "rollback" | "flags" | "mark_stable";
type Primitive = string | number | boolean | null;

function cleanText(value: unknown, limit: number): string {
  return String(value ?? "").trim().slice(0, limit);
}

function validVersion(value: unknown): string {
  const version = cleanText(value, 40).replace(/^v/i, "");
  if (!/^\d+\.\d+\.\d+(?:-[a-z0-9][a-z0-9.-]{0,30})?$/i.test(version)) throw new Error("Enter a valid release version such as 6.4.178");
  return version;
}

function validGitRef(value: unknown): string {
  const ref = cleanText(value, 120);
  if (!ref || ref.startsWith("/") || ref.endsWith("/") || ref.includes("..") || ref.endsWith(".lock") || !/^[A-Za-z0-9][A-Za-z0-9._\/-]{0,119}$/.test(ref)) {
    throw new Error("Enter a safe Git branch, tag, or commit reference");
  }
  return ref;
}

function validFlags(value: unknown): Record<string, Primitive> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Feature flags must be a JSON object");
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length > 40) throw new Error("No more than 40 feature flags may be published at once");
  const result: Record<string, Primitive> = {};
  for (const [key, flag] of entries) {
    if (!/^[a-z][a-z0-9_.-]{0,63}$/i.test(key)) throw new Error(`Invalid feature flag name: ${key}`);
    if (flag !== null && !["string", "number", "boolean"].includes(typeof flag)) throw new Error(`Feature flag ${key} must be a string, number, boolean, or null`);
    if (typeof flag === "string" && flag.length > 240) throw new Error(`Feature flag ${key} is too long`);
    if (typeof flag === "number" && !Number.isFinite(flag)) throw new Error(`Feature flag ${key} must be finite`);
    result[key] = flag as Primitive;
  }
  if (JSON.stringify(result).length > 12000) throw new Error("Feature flags exceed the 12 KB safety limit");
  return result;
}

async function dispatchGitHub(ref: string, version: string, action: "deploy" | "rollback"): Promise<void> {
  const token = requiredEnv("GITHUB_DEPLOY_TOKEN");
  const repository = requiredEnv("GITHUB_REPOSITORY");
  const workflow = optionalEnv("GITHUB_WORKFLOW_ID", "deploy-language-miner.yml");
  const workflowRef = validGitRef(optionalEnv("GITHUB_WORKFLOW_REF", "main"));
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) throw new Error("GITHUB_REPOSITORY must use owner/repository format");
  const endpoint = `https://api.github.com/repos/${repository}/actions/workflows/${encodeURIComponent(workflow)}/dispatches`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "Language-Miner-Release-Guardian" },
    body: JSON.stringify({ ref: workflowRef, inputs: { version, action, source_ref: ref } }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`GitHub rejected the reviewed release (${response.status})${detail ? `: ${detail.slice(0, 180)}` : ""}`);
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return options(request);
  if (request.method !== "POST") return json(request, { error: "Method not allowed" }, 405);
  let auditDb: ReturnType<typeof serviceClient> | null = null;
  let auditUserId = "";
  let attemptedAction = "";
  try {
    const user = await requireUser(request);
    const db = serviceClient();
    const { data: admin, error: adminError } = await db.from("app_admins").select("user_id,role,permissions").eq("user_id", user.id).maybeSingle();
    const canRelease = admin?.role === "owner" || (admin?.role === "admin" && admin?.permissions?.release_management === true);
    if (adminError || !admin || !canRelease) return json(request, { error: "The master owner has not assigned the Game Updates privilege to this administrator" }, 403);
    auditDb = db;
    auditUserId = user.id;

    const body = await request.json().catch(() => ({}));
    const action = cleanText(body?.action || "status", 24) as ReleaseAction;
    attemptedAction = action;
    if (!["status", "deploy", "rollback", "flags", "mark_stable"].includes(action)) return json(request, { error: "Unsupported release action" }, 400);
    const channel = "stable";
    const { data: control, error: loadError } = await db.from("app_release_control").select("*").eq("channel", channel).single();
    if (loadError || !control) throw loadError || new Error("Release control is not configured");
    if (action === "status") {
      const { data: events } = await db.from("app_release_events").select("id,channel,action,version,git_ref,details,created_at").eq("channel", channel).order("created_at", { ascending: false }).limit(20);
      return json(request, { ok: true, release: control, events: events || [] });
    }

    if (action === "flags") {
      const flags = validFlags(body?.flags ?? body?.feature_flags);
      const notes = cleanText(body?.notes, 500);
      const { data: updated, error } = await db.from("app_release_control").update({ feature_flags: flags, notes, revision: Number(control.revision || 0) + 1, requested_by: user.id, requested_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("channel", channel).select("*").single();
      if (error) throw error;
      await db.from("app_release_events").insert({ channel, action: "feature_flags", version: control.current_version, git_ref: control.current_ref, requested_by: user.id, details: { flags, notes } });
      return json(request, { ok: true, release: updated });
    }

    if (action === "mark_stable") {
      const { data: updated, error } = await db.from("app_release_control").update({ rollout_status: "active", stable_at: new Date().toISOString(), revision: Number(control.revision || 0) + 1, requested_by: user.id, requested_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("channel", channel).select("*").single();
      if (error) throw error;
      await db.from("app_release_events").insert({ channel, action: "mark_stable", version: control.current_version, git_ref: control.current_ref, requested_by: user.id, details: {} });
      return json(request, { ok: true, release: updated });
    }

    const notes = cleanText(body?.notes, 500);
    const rollback = action === "rollback";
    const version = rollback ? cleanText(control.previous_version, 40) : validVersion(body?.version);
    const ref = rollback ? cleanText(control.previous_ref, 120) : validGitRef(body?.ref);
    if (!version || !ref) throw new Error("No previous reviewed release is available for rollback");
    await dispatchGitHub(ref, version, rollback ? "rollback" : "deploy");
    const update = rollback ? {
      current_version: version, current_ref: ref, previous_version: control.current_version, previous_ref: control.current_ref,
      rollout_status: "rolling_back", notes, revision: Number(control.revision || 0) + 1, requested_by: user.id, requested_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    } : {
      previous_version: control.current_version, previous_ref: control.current_ref, current_version: version, current_ref: ref,
      rollout_status: "deploying", notes, revision: Number(control.revision || 0) + 1, requested_by: user.id, requested_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    const { data: updated, error } = await db.from("app_release_control").update(update).eq("channel", channel).select("*").single();
    if (error) throw error;
    await db.from("app_release_events").insert({ channel, action: rollback ? "rollback" : "deploy", version, git_ref: ref, requested_by: user.id, details: { notes } });
    return json(request, { ok: true, release: updated, dispatched: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Release request failed";
    if (auditDb && auditUserId && attemptedAction && attemptedAction !== "status") {
      try { await auditDb.from("app_release_events").insert({ channel: "stable", action: "failure", requested_by: auditUserId, details: { attempted_action: attemptedAction, error: cleanText(message.replace(/Bearer\s+\S+/gi, "credential"), 300) } }); } catch {}
    }
    const status = /unauthorized|sign in|token|session/i.test(message) ? 401 : /valid|safe|must|required|available|limit/i.test(message) ? 400 : 500;
    return json(request, { error: message.replace(/Bearer\s+\S+/gi, "credential") }, status);
  }
});
