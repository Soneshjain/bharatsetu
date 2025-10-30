param(
  [int]$Port = 7000
)

$ErrorActionPreference = 'Stop'

Write-Host "Starting scraper service on port $Port"

if (-not (Test-Path .\venv\Scripts\Activate.ps1)) {
  python -m venv venv
}
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

python -m uvicorn scraper_service:app --host 0.0.0.0 --port $Port --reload


