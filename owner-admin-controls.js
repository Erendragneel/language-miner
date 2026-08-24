// Language Miner v6.4.179 - protected owner controls and granular administrator privileges.
(()=>{
'use strict';
const PERMISSIONS=Object.freeze([
  {id:'economy',icon:'🪙',name:'Economy',description:'Set Nuggets and grant gems.'},
  {id:'health',icon:'❤️',name:'Hearts & Health',description:'Restore hearts, increase max hearts, and use infinite hearts.'},
  {id:'progression',icon:'📚',name:'Course Progression',description:'Jump stages, master kana, and unlock learning content.'},
  {id:'cosmetics',icon:'⛏️',name:'Cosmetics & Supplies',description:'Unlock pickaxes and grant practice supplies.'},
  {id:'profile_resets',icon:'💾',name:'Save & Profile Resets',description:'Export, import, or reset the signed-in admin profile.'},
  {id:'player_management',icon:'👥',name:'Player Management',description:'Search players and reset selected cloud progress.'},
  {id:'release_management',icon:'🛡️',name:'Game Updates',description:'Deploy reviewed releases, flags, and rollbacks.'},
  {id:'privacy_management',icon:'🔐',name:'Privacy Requests',description:'Review and resolve player privacy requests.'}
]);
let currentRole='',currentPermissions=blankPermissions(),section=null,searchRows=[],adminRows=[],eventRows=[],resolving=false,editingUserId='';
const previewAdmins=new Map([['preview-cloud-mina',allPermissions()]]);
const previewAccounts=[
  {user_id:'preview-admin',display_name:'Preview Admin',email:'preview-admin@local.test',admin_role:'owner',admin_permissions:allPermissions()},
  {user_id:'preview-cloud-mina',display_name:'Mina Preview',email:'mina.preview@example.test',admin_role:'admin'},
  {user_id:'preview-player-kai',display_name:'Kai Preview',email:'kai.preview@example.test',admin_role:null},
  {user_id:'preview-player-luna',display_name:'Luna Preview',email:'luna.preview@example.test',admin_role:null}
];

function blankPermissions(){return Object.fromEntries(PERMISSIONS.map(item=>[item.id,false]));}
function allPermissions(){return Object.fromEntries(PERMISSIONS.map(item=>[item.id,true]));}
function normalizePermissions(value,all=false){const source=value&&typeof value==='object'&&!Array.isArray(value)?value:{};return Object.fromEntries(PERMISSIONS.map(item=>[item.id,all||source[item.id]===true]));}
function permissionCount(value){const normalized=normalizePermissions(value);return PERMISSIONS.filter(item=>normalized[item.id]).length;}
function esc(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
function previewRole(){if(window.LANGUAGE_MINER_PREVIEW!==true||window.japaneseMinerIsDeveloperSession?.()!==true)return '';const role=String(window.LANGUAGE_MINER_PREVIEW_ADMIN_ROLE||'owner');return role==='admin'?'admin':'owner';}
function previewOwner(){return previewRole()==='owner';}
function previewIdentity(){const role=previewRole();if(!role)return {role:'',permissions:blankPermissions()};const supplied=window.LANGUAGE_MINER_PREVIEW_ADMIN_PERMISSIONS;return {role,permissions:normalizePermissions(supplied,role==='owner'||!supplied)};}
function message(text,error=false){const node=document.getElementById('lmOwnerAdminMessage');if(node){node.textContent=String(text||'');node.classList.toggle('error',error);}}
function roleLabel(role){return role==='owner'?'MASTER OWNER':role==='admin'?'ADMIN':'PLAYER';}
function allows(permission){return currentRole==='owner'||(currentRole==='admin'&&currentPermissions[permission]===true);}
function applyPermissionVisibility(){document.querySelectorAll('#developerOverlay [data-admin-permission]').forEach(node=>{const allowed=allows(node.dataset.adminPermission);node.hidden=!allowed;node.setAttribute('aria-hidden',String(!allowed));});if(!allows('release_management'))document.getElementById('lmAdminUpdateCenter')?.remove();}
function publishIdentity(){window.dispatchEvent(new CustomEvent('lm-admin-permissions-changed',{detail:{role:currentRole,permissions:{...currentPermissions}}}));}
function roleUi(identity){
  const role=String(identity?.role||'');currentRole=role;currentPermissions=normalizePermissions(identity?.permissions,role==='owner');document.documentElement.dataset.lmAdminRole=role||'none';
  const badge=document.querySelector('#developerOverlay .developer-status .badge'),title=document.getElementById('developerTitle'),copy=document.querySelector('#developerOverlay .developer-head .menu-header-copy p');
  if(badge){badge.textContent=role==='owner'?'OWNER':'ADMIN';badge.classList.toggle('owner',role==='owner');}
  if(title)title.textContent=role==='owner'?'👑 Owner Master Control Center':'👑 Administrator Control Center';
  if(copy)copy.textContent=role==='owner'?'Master controls, administrator assignments, and protected game operations.':`${permissionCount(currentPermissions)} of ${PERMISSIONS.length} administrator privileges assigned by the owner.`;
  if(role!=='owner'){document.getElementById('lmOwnerMasterControls')?.remove();section=null;}
  if(!role&&!window.LANGUAGE_MINER_PREVIEW){const button=document.getElementById('developerBtn');if(button)button.hidden=true;const overlay=document.getElementById('developerOverlay');overlay?.classList.remove('open');overlay?.setAttribute('aria-hidden','true');}
  applyPermissionVisibility();publishIdentity();
}
async function resolveRole(){
  if(resolving)return currentRole;resolving=true;
  try{
    if(previewRole()){const identity=previewIdentity();roleUi(identity);if(identity.role==='owner')ensureSection();return identity.role;}
    if(window.japaneseMinerIsDeveloperSession?.()!==true){roleUi({role:'',permissions:{}});return '';}
    const cloud=window.languageMinerCloudAuth,identity=cloud?.adminIdentity?await cloud.adminIdentity():{role:await cloud?.adminRole?.(),permissions:allPermissions()};roleUi(identity);if(identity?.role==='owner')ensureSection();return identity?.role||'';
  }catch{roleUi({role:'',permissions:{}});return '';}
  finally{resolving=false;}
}

function normalizedPreviewAccounts(query=''){
  const term=String(query||'').trim().toLowerCase();return previewAccounts.map(row=>{const role=row.user_id==='preview-admin'?'owner':previewAdmins.has(row.user_id)?'admin':null;return {...row,admin_role:role,admin_permissions:role==='owner'?allPermissions():normalizePermissions(previewAdmins.get(row.user_id))};}).filter(row=>!term||`${row.display_name} ${row.email}`.toLowerCase().includes(term));
}
function resultCard(row){
  const role=String(row.admin_role||''),protectedOwner=role==='owner',count=protectedOwner?PERMISSIONS.length:permissionCount(row.admin_permissions),summary=role?`${count} of ${PERMISSIONS.length} privileges`:'No administrator access';
  const actions=protectedOwner?'<span class="lm-owner-protected">Protected owner · all privileges</span>':role==='admin'?`<div class="lm-owner-card-actions"><button type="button" data-owner-admin-action="edit" data-owner-user="${esc(row.user_id)}">Edit Privileges</button><button type="button" class="danger" data-owner-admin-action="revoke" data-owner-user="${esc(row.user_id)}">Revoke Admin</button></div>`:`<button type="button" data-owner-admin-action="grant" data-owner-user="${esc(row.user_id)}">Configure &amp; Grant Admin</button>`;
  return `<article class="lm-owner-account ${role||'player'}"><div><strong>${esc(row.display_name||'Player')}</strong><span>${esc(row.email||'No email')}</span><small>${esc(summary)}</small></div><span class="lm-owner-role ${role||'player'}">${roleLabel(role)}</span>${actions}</article>`;
}
function renderAccounts(){const node=document.getElementById('lmOwnerAccountResults');if(node)node.innerHTML=searchRows.length?searchRows.map(resultCard).join(''):'<div class="lm-owner-empty">No matching player accounts.</div>';}
function renderAdmins(){const node=document.getElementById('lmOwnerAssignedAdmins');if(node)node.innerHTML=adminRows.length?adminRows.map(resultCard).join(''):'<div class="lm-owner-empty">No administrators have been assigned yet.</div>';const count=document.getElementById('lmOwnerAdminCount'),assigned=adminRows.filter(row=>row.admin_role==='admin').length;if(count)count.textContent=`${assigned} assigned admin${assigned===1?'':'s'}`;}
function renderEvents(){const node=document.getElementById('lmOwnerAdminEvents');if(!node)return;const labels={grant_admin:'Admin granted',revoke_admin:'Admin revoked',update_permissions:'Privileges updated'};node.innerHTML=eventRows.length?eventRows.map(row=>`<article><strong>${labels[row.action]||'Admin access changed'}</strong><span>${esc(row.target_email||'Unknown account')}</span><time>${new Date(row.created_at||Date.now()).toLocaleString()}</time></article>`).join(''):'<div class="lm-owner-empty">No administrator access changes recorded yet.</div>';}
async function loadAdmins(){
  if(currentRole!=='owner')return;
  try{if(previewOwner()){adminRows=normalizedPreviewAccounts().filter(row=>row.admin_role);eventRows=[];}else{const cloud=window.languageMinerCloudAuth;if(!cloud?.ownerListAdmins)throw new Error('Deploy the granular-admin-permissions migration before assigning administrators.');[adminRows,eventRows]=await Promise.all([cloud.ownerListAdmins(),cloud.ownerListAdminEvents(40)]);}renderAdmins();renderEvents();message(previewOwner()?'Preview master controls are ready. Changes remain on this preview only.':'Master owner access verified.');}catch(error){message(error?.message||error,true);}
}
async function searchAccounts(){const query=document.getElementById('lmOwnerAccountSearch')?.value?.trim()||'';message('Searching registered player accounts…');try{searchRows=previewOwner()?normalizedPreviewAccounts(query):await window.languageMinerCloudAuth.ownerSearchAccounts(query,40);renderAccounts();message(`${searchRows.length} account${searchRows.length===1?'':'s'} found.`);}catch(error){message(error?.message||error,true);}}
function findAccount(userId){return [...searchRows,...adminRows].find(row=>String(row.user_id)===String(userId));}
function editorPermissions(){return Object.fromEntries(PERMISSIONS.map(item=>[item.id,document.querySelector(`[data-owner-permission="${item.id}"]`)?.checked===true]));}
function updateEditorCount(){const count=permissionCount(editorPermissions()),node=document.getElementById('lmOwnerPermissionCount');if(node)node.textContent=`${count} of ${PERMISSIONS.length} privileges selected`;}
function closeEditor(){editingUserId='';const editor=document.getElementById('lmOwnerPermissionEditor');if(editor)editor.hidden=true;}
function openEditor(userId){
  const target=findAccount(userId);if(!target||target.admin_role==='owner')return;editingUserId=String(userId);const existing=target.admin_role==='admin',permissions=existing?normalizePermissions(target.admin_permissions):blankPermissions(),editor=document.getElementById('lmOwnerPermissionEditor');if(!editor)return;
  document.getElementById('lmOwnerPermissionTitle').textContent=`${existing?'Edit':'Grant'} administrator privileges for ${target.display_name||target.email||'this player'}`;document.getElementById('lmOwnerPermissionSave').textContent=existing?'Save Admin Privileges':'Grant Admin With Selected Privileges';PERMISSIONS.forEach(item=>{const input=editor.querySelector(`[data-owner-permission="${item.id}"]`);if(input)input.checked=permissions[item.id]===true;});editor.hidden=false;updateEditorCount();editor.scrollIntoView({behavior:'smooth',block:'nearest'});
}
async function refreshOwnerRows(){const query=document.getElementById('lmOwnerAccountSearch')?.value||'';if(previewOwner()){searchRows=normalizedPreviewAccounts(query);adminRows=normalizedPreviewAccounts().filter(row=>row.admin_role);}else{searchRows=await window.languageMinerCloudAuth.ownerSearchAccounts(query,40);[adminRows,eventRows]=await Promise.all([window.languageMinerCloudAuth.ownerListAdmins(),window.languageMinerCloudAuth.ownerListAdminEvents(40)]);}renderAccounts();renderAdmins();renderEvents();}
async function savePrivileges(){
  const target=findAccount(editingUserId);if(!target)return;const permissions=editorPermissions(),count=permissionCount(permissions),existing=target.admin_role==='admin';if(!confirm(`${existing?'Save':'Grant administrator access with'} ${count} of ${PERMISSIONS.length} privileges for ${target.display_name||target.email}?`))return;message(existing?'Saving administrator privileges…':'Granting administrator access…');
  try{if(previewOwner()){previewAdmins.set(String(editingUserId),permissions);eventRows.unshift({action:existing?'update_permissions':'grant_admin',target_email:target.email,created_at:new Date().toISOString()});}else await window.languageMinerCloudAuth.ownerSetAdminAccess(editingUserId,true,permissions);closeEditor();await refreshOwnerRows();message(previewOwner()?'Preview privileges updated locally. No live account was changed.':'Administrator privileges saved and enforced successfully.');}catch(error){message(error?.message||error,true);}
}
async function revokeAdmin(userId){const target=findAccount(userId);if(!target||target.admin_role!=='admin')return;if(!confirm(`Revoke every administrator privilege from ${target.display_name||target.email}? Their protected server access will stop immediately.`))return;message('Revoking administrator access…');try{if(previewOwner()){previewAdmins.delete(String(userId));eventRows.unshift({action:'revoke_admin',target_email:target.email,created_at:new Date().toISOString()});}else await window.languageMinerCloudAuth.ownerSetAdminAccess(userId,false,target.admin_permissions||{});closeEditor();await refreshOwnerRows();message(previewOwner()?'Preview administrator revoked locally.':'Administrator access revoked successfully.');}catch(error){message(error?.message||error,true);}}
function bindSection(node){
  node.querySelector('#lmOwnerSearchBtn').addEventListener('click',searchAccounts);node.querySelector('#lmOwnerAccountSearch').addEventListener('keydown',event=>{if(event.key==='Enter')searchAccounts();});node.querySelector('#lmOwnerRefreshAdmins').addEventListener('click',loadAdmins);node.querySelector('#lmOwnerPermissionSave').addEventListener('click',savePrivileges);node.querySelector('#lmOwnerPermissionCancel').addEventListener('click',closeEditor);node.querySelector('#lmOwnerPermissionAll').addEventListener('click',()=>{node.querySelectorAll('[data-owner-permission]').forEach(input=>input.checked=true);updateEditorCount();});node.querySelector('#lmOwnerPermissionNone').addEventListener('click',()=>{node.querySelectorAll('[data-owner-permission]').forEach(input=>input.checked=false);updateEditorCount();});node.querySelectorAll('[data-owner-permission]').forEach(input=>input.addEventListener('change',updateEditorCount));node.addEventListener('click',event=>{const button=event.target.closest?.('[data-owner-admin-action]');if(!button)return;const action=button.dataset.ownerAdminAction;if(action==='revoke')revokeAdmin(button.dataset.ownerUser);else openEditor(button.dataset.ownerUser);});
}
function ensureSection(){
  if(currentRole!=='owner'||section?.isConnected)return;const grid=document.querySelector('#developerOverlay .developer-grid');if(!grid)return;const permissionOptions=PERMISSIONS.map(item=>`<label class="lm-owner-permission-option"><input type="checkbox" data-owner-permission="${item.id}"><span><strong>${item.icon} ${esc(item.name)}</strong><small>${esc(item.description)}</small></span></label>`).join('');section=document.createElement('div');section.id='lmOwnerMasterControls';section.className='developer-group developer-wide lm-owner-master-controls';
  section.innerHTML=`<div class="lm-owner-head"><div><span>EXCLUSIVE OWNER AUTHORITY</span><h3>👑 Owner Master Controls</h3><p>Choose exactly which controls each administrator can use. Administrators cannot grant access, edit privileges, create another owner, or demote you.</p></div><strong>MASTER OWNER</strong></div><div class="lm-owner-summary"><span id="lmOwnerAdminCount">Reading assigned admins…</span><button id="lmOwnerRefreshAdmins" type="button">Refresh Access List</button></div><div class="lm-owner-search"><label>Find a registered account by name or email<input id="lmOwnerAccountSearch" type="search" maxlength="160" autocomplete="off" placeholder="Player name or account email"></label><button id="lmOwnerSearchBtn" type="button" class="primary">Search Accounts</button></div><div id="lmOwnerAccountResults" class="lm-owner-account-list"><div class="lm-owner-empty">Search for a player before granting administrator controls.</div></div><section id="lmOwnerPermissionEditor" class="lm-owner-permission-editor" hidden><div><span>OWNER-SELECTED ACCESS</span><h4 id="lmOwnerPermissionTitle">Configure administrator privileges</h4><p>Unchecked tools are hidden in the game and rejected by protected Supabase operations.</p></div><div class="lm-owner-permission-presets"><button id="lmOwnerPermissionAll" type="button">Select all</button><button id="lmOwnerPermissionNone" type="button">Clear all</button><strong id="lmOwnerPermissionCount">0 of ${PERMISSIONS.length} privileges selected</strong></div><div class="lm-owner-permission-grid">${permissionOptions}</div><div class="developer-actions"><button id="lmOwnerPermissionSave" type="button" class="primary">Save Admin Privileges</button><button id="lmOwnerPermissionCancel" type="button">Cancel</button></div></section><h4>Accounts with administrator access</h4><div id="lmOwnerAssignedAdmins" class="lm-owner-account-list"><div class="lm-owner-empty">Loading administrator access…</div></div><details><summary>Administrator access audit history</summary><div id="lmOwnerAdminEvents" class="lm-owner-events"><div class="lm-owner-empty">Loading audit history…</div></div></details><div id="lmOwnerAdminMessage" class="lm-owner-message" aria-live="polite"></div>`;const updateCenter=document.getElementById('lmAdminUpdateCenter'),saveTesting=[...grid.children].find(child=>child.querySelector?.('#adminSaveJson'));if(updateCenter)grid.insertBefore(section,updateCenter);else if(saveTesting)grid.insertBefore(section,saveTesting);else grid.appendChild(section);bindSection(section);loadAdmins();
}

window.languageMinerAdminAllows=permission=>allows(String(permission||''));
window.LanguageMinerAdminPrivileges=Object.freeze({definitions:PERMISSIONS,role:()=>currentRole,permissions:()=>({...currentPermissions}),allows,refresh:resolveRole});
document.addEventListener('DOMContentLoaded',()=>setTimeout(resolveRole,0));window.addEventListener('jm-profile-loaded',()=>setTimeout(resolveRole,250));window.addEventListener('lm-cloud-session-changed',()=>setTimeout(resolveRole,200));window.addEventListener('jm-profile-logged-out',()=>roleUi({role:'',permissions:{}}));setInterval(()=>{if(window.japaneseMinerIsDeveloperSession?.()===true)resolveRole();},60000);
})();
