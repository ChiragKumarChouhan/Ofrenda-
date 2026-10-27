Write-Host "Starting Ofrenda..." -ForegroundColor Yellow
if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) { Write-Host "Ollama is not installed or not on PATH." -ForegroundColor Red; exit 1 }
ollama list | Out-Null
Write-Host "Make sure gemma3:1b exists. If not: ollama pull gemma3:1b" -ForegroundColor DarkYellow
npm install
Set-Location client
npm install
Set-Location ..
npm run dev
