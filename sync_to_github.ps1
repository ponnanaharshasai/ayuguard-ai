# AyuGuard AI - GitHub Sync Script (Flat Version)

$git = "C:\Program Files\Git\cmd\git.exe"
$repo = "https://github.com/ponnanaharshasai/AI_Medicin.git"

Write-Host "🚀 Syncing AyuGuard AI to GitHub..." -ForegroundColor Cyan

# 1. Init
& $git init

# 2. Remote
& $git remote remove origin 2>$null
& $git remote add origin $repo
Write-Host "🔗 Linked to $repo" -ForegroundColor Gray

# 3. Commit
Write-Host "📦 Staging and Committing..." -ForegroundColor Gray
& $git add .
& $git commit -m "Finalize AyuGuard AI: Premium Homepage and Fresh Start"

# 4. Push
Write-Host "📤 Pushing to GitHub (main branch)..." -ForegroundColor Cyan
Write-Host "⚠️ Please LOOK AT YOUR SCREEN for a GitHub Login window!" -ForegroundColor Yellow
& $git branch -M main
& $git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 SUCCESS! Your code is now live on GitHub." -ForegroundColor Green
} else {
    Write-Host "❌ PUSH FAILED. Check your GitHub login or internet." -ForegroundColor Red
}
