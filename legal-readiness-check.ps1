#requires -Version 5.1
[CmdletBinding()]
param(
  [string]$ProjectRoot,
  [string]$ReportPath,
  [switch]$Json
)
# Local source inspection only. A successful exit is not release/legal approval.
$ErrorActionPreference='Stop'
if(-not $ProjectRoot){$ProjectRoot=$PSScriptRoot}
$projectDirectory=[IO.Path]::GetFullPath($ProjectRoot)
$failures=[System.Collections.Generic.List[string]]::new()
$checks=[System.Collections.Generic.List[object]]::new()
$cachedFiles=[System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)

function Add-SourceCheck([string]$name,[string]$path,[bool]$passed,[string]$detail) {
  $checks.Add([pscustomobject]@{name=$name;path=$path;passed=$passed;detail=$detail})
  if(-not $passed){$failures.Add($detail)}
}
function Read-Source([string]$path) {
  $target=Join-Path $projectDirectory $path
  if(-not(Test-Path -LiteralPath $target -PathType Leaf)){return $null}
  try{return [IO.File]::ReadAllText($target)}catch{return $null}
}
function Require-Text([string]$name,[string]$path,[string]$pattern,[string]$message) {
  $content=Read-Source $path
  $passed=$null -ne $content -and $content -match $pattern
  $detail=if($passed){'Required source text found; runtime/deployment not tested.'}elseif($null -eq $content){"Missing or unreadable source file: $path"}else{$message}
  Add-SourceCheck $name $path $passed $detail
}
function Resolve-EvidencePath([string[]]$candidates) {
  foreach($candidate in $candidates){if(Test-Path -LiteralPath (Join-Path $projectDirectory $candidate) -PathType Leaf){return $candidate}}
  return $candidates[0]
}
Add-SourceCheck 'project-directory' '.' (Test-Path -LiteralPath $projectDirectory -PathType Container) "Source directory: $projectDirectory"
Require-Text 'legal-controls-loaded' 'index.html' 'legal-compliance\.js' 'Legal controls are not referenced by index.html.'
Require-Text 'privacy-link' 'index.html' 'privacy\.html' 'Privacy Policy is not linked from index.html.'
Require-Text 'terms-link' 'index.html' 'terms\.html' 'Terms are not linked from index.html.'
Require-Text 'client-account-roles' 'cloud-auth.js' 'learner_13_plus.*adult_guardian.*educator' 'Eligible direct-account roles are missing from the cloud client source.'
Require-Text 'client-under-13-rejection' 'legal-compliance.js' "role\s*===\s*'under_13'[\s\S]*?ok\s*:\s*false" 'UI under-13 rejection source is missing.'
Require-Text 'policy-versions' 'legal-compliance.js' 'TERMS_VERSION[\s\S]*PRIVACY_VERSION' 'Versioned policy identifiers are missing.'
Require-Text 'independent-practice-notice' 'multilingual-preview.js' 'Independent practice pathway' 'Course-framework notice is missing.'
# Older exports flatten these files. Neither layout establishes deployment.
$consentPath=Resolve-EvidencePath @('supabase/migrations/202608150001_legal_privacy_controls.sql','202608150001_legal_privacy_controls.sql')
Require-Text 'consent-table-source' $consentPath 'create\s+table\s+if\s+not\s+exists\s+public\.legal_consents' 'Legal-consent table source is missing.'
Require-Text 'privacy-request-table-source' $consentPath 'create\s+table\s+if\s+not\s+exists\s+public\.privacy_requests' 'Privacy-request table source is missing.'
Require-Text 'consent-rls-source' $consentPath 'alter\s+table\s+public\.legal_consents\s+enable\s+row\s+level\s+security' 'Legal-consent RLS declaration is missing.'
Require-Text 'privacy-request-rls-source' $consentPath 'alter\s+table\s+public\.privacy_requests\s+enable\s+row\s+level\s+security' 'Privacy-request RLS declaration is missing.'
$deletePath=Resolve-EvidencePath @('supabase/functions/account-delete/index.ts','index.ts')
Require-Text 'deletion-authentication-source' $deletePath 'await\s+requireUser\(request\)' 'Account-deletion source does not authenticate the request.'
Require-Text 'deletion-confirmation-source' $deletePath 'body\?\.confirm\s*!==\s*"DELETE"' 'Account-deletion source lacks explicit DELETE confirmation.'
Require-Text 'deletion-caller-id-source' $deletePath 'deleteUser\(user\.id\s*,\s*false\)' 'Account-deletion source does not target the authenticated caller.'
foreach($document in @('privacy.html','terms.html','THIRD-PARTY-NOTICES.txt','ASSET-PROVENANCE.md','EDUCATIONAL-CLAIMS-REGISTER.md','TRADEMARK-PRELIMINARY-SEARCH.md','LEGAL-READINESS-DEPLOYMENT.md','ADMIN-UPDATE-GUARDIAN-SETUP.md','OWNER-MASTER-CONTROLS-SETUP.md','manifest.webmanifest')){
  Add-SourceCheck 'document-present' $document (Test-Path -LiteralPath (Join-Path $projectDirectory $document) -PathType Leaf) "Required document: $document"
}
$manifest=Read-Source 'manifest.webmanifest'
if($null -ne $manifest){
  try{$null=ConvertFrom-Json -InputObject $manifest;Add-SourceCheck 'manifest-json' 'manifest.webmanifest' $true 'Manifest parses; orientation is a product setting, not legal clearance.'}
  catch{Add-SourceCheck 'manifest-json' 'manifest.webmanifest' $false 'Manifest is not valid JSON.'}
}
$serviceWorker=Read-Source 'sw.js'
if($null -eq $serviceWorker){
  Add-SourceCheck 'service-worker-source' 'sw.js' $false 'Missing or unreadable source file: sw.js'
}else{
  foreach($listName in @('CRITICAL_SHELL','APP_SHELL')){
    $listMatch=[regex]::Match($serviceWorker,"\b(?:const|let|var)\s+$listName\s*=\s*\[(?<items>[\s\S]*?)\]\s*;")
    if(-not $listMatch.Success){Add-SourceCheck 'cache-list-readable' "sw.js:$listName" $false "Service-worker $listName literal list could not be read.";continue}
    $items=[regex]::Replace($listMatch.Groups['items'].Value,'/\*[\s\S]*?\*/|(?m)^\s*//[^\r\n]*','')
    $referencePattern='([''"])(?<reference>[^''"]+)\1'
    $references=[regex]::Matches($items,$referencePattern)
    $unparsed=[regex]::Replace([regex]::Replace($items,$referencePattern,''),'[\s,]','')
    Add-SourceCheck 'cache-list-literals' "sw.js:$listName" ($references.Count -gt 0 -and -not $unparsed) "Service-worker $listName must contain inspectable string literals."
    foreach($match in $references){
      $reference=$match.Groups['reference'].Value
      if(-not $reference.StartsWith('./')){Add-SourceCheck 'cache-reference-local' "sw.js:$listName" $false "Unsupported cache reference: $reference";continue}
      $relativePath=[Uri]::UnescapeDataString(($reference -split '[?#]',2)[0].Substring(2))
      if(-not $relativePath){$relativePath='index.html'}
      $target=[IO.Path]::GetFullPath((Join-Path $projectDirectory $relativePath))
      $rootPrefix=$projectDirectory.TrimEnd([IO.Path]::DirectorySeparatorChar,[IO.Path]::AltDirectorySeparatorChar)+[IO.Path]::DirectorySeparatorChar
      if(-not $target.StartsWith($rootPrefix,[StringComparison]::OrdinalIgnoreCase)){Add-SourceCheck 'cache-reference-contained' "sw.js:$listName" $false "Cache reference leaves source directory: $reference";continue}
      if($cachedFiles.Add($relativePath)){Add-SourceCheck 'cached-file-present' $relativePath (Test-Path -LiteralPath $target -PathType Leaf) "Cached application file: $relativePath"}
    }
  }
}
$report=[ordered]@{
  schemaVersion=2
  checkedAt=[DateTime]::UtcNow.ToString('o')
  scope='local-source-only'
  projectRoot=$projectDirectory
  sourceChecksPassed=($failures.Count -eq 0)
  sourceCheckCount=$checks.Count
  cachedApplicationFiles=$cachedFiles.Count
  releaseClearanceEstablished=$false
  releasePrerequisitesEvaluated=$false
  failures=@($failures.ToArray())
  checks=@($checks.ToArray())
  notChecked=@(
    'Live authentication, server-side eligibility and parental-consent compliance',
    'Deployed database permissions, export completeness, deletion and retention',
    'Operator legal identity and contact verification',
    'Licenses, reference-input rights and final packaged-asset provenance',
    'Trademark availability, educational substantiation or native editorial accuracy',
    'Google Play declarations, purchases, signing acceptance and export-law applicability'
  )
}
$serialized=$report|ConvertTo-Json -Depth 8
if($ReportPath){
  $reportFile=[IO.Path]::GetFullPath($ReportPath)
  $null=[IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($reportFile))
  [IO.File]::WriteAllText($reportFile,$serialized,[Text.UTF8Encoding]::new($false))
}
if($Json){Write-Output $serialized}else{
  Write-Output "Local source checks passed: $($report.sourceChecksPassed) ($($checks.Count) checks; $($cachedFiles.Count) cached files)."
  foreach($failure in $failures){[Console]::Error.WriteLine($failure)}
  Write-Output 'Release clearance is not established by this script. Evaluate the current asset register, operator details, deployed behavior, audience and platform requirements separately.'
}
if($failures.Count){exit 1}
exit 0
