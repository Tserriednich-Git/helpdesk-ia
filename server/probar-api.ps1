# HelpDesk IA - ejemplos para probar la API en PowerShell
# 1) Arranca el servidor:  cd server ; npm run dev
# 2) Ejecuta este archivo:  .\probar-api.ps1
#    O copia cada bloque y pegalo en PowerShell.

$ErrorActionPreference = "Stop"
$base = "http://localhost:3001/api"

Write-Host "=== Salud de la API ===" -ForegroundColor Cyan
Invoke-RestMethod "$base/health"

function Register-OrLogin($name, $email, $password, $role) {
  try {
    return Invoke-RestMethod -Method Post -Uri "$base/auth/register" -ContentType "application/json" -Body (@{
      name     = $name
      email    = $email
      password = $password
      role     = $role
    } | ConvertTo-Json)
  } catch {
    Write-Host "  (Ya existia ${email}, se inicia sesion)" -ForegroundColor Yellow
    return Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType "application/json" -Body (@{
      email    = $email
      password = $password
    } | ConvertTo-Json)
  }
}

# ---------- Registro ----------
Write-Host "`n=== Registrar un usuario (rol usuario) ===" -ForegroundColor Cyan
$ana = Register-OrLogin "Ana Usuario" "ana@example.com" "secret1" "usuario"
$ana | ConvertTo-Json -Depth 5
$tokenAna = $ana.token
$headersAna = @{ Authorization = "Bearer $tokenAna" }

Write-Host "`n=== Registrar un tecnico ===" -ForegroundColor Cyan
$teo = Register-OrLogin "Teo Tecnico" "teo@example.com" "secret1" "tecnico"
$teo | ConvertTo-Json -Depth 5
$tokenTeo = $teo.token
$headersTeo = @{ Authorization = "Bearer $tokenTeo" }

Write-Host "`n=== Iniciar sesion (Ana) ===" -ForegroundColor Cyan
$loginAna = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType "application/json" -Body (@{
  email    = "ana@example.com"
  password = "secret1"
} | ConvertTo-Json)
$loginAna.user | ConvertTo-Json

Write-Host "`n=== Quien soy (token de Ana) ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$base/auth/me" -Headers $headersAna | ConvertTo-Json -Depth 5

# ---------- Tickets ----------
Write-Host "`n=== Ana crea un ticket ===" -ForegroundColor Cyan
$ticket = Invoke-RestMethod -Method Post -Uri "$base/tickets" -Headers $headersAna -ContentType "application/json" -Body (@{
  title       = "No enciende el monitor"
  description = "El monitor se queda en negro al arrancar."
} | ConvertTo-Json)
$ticket | ConvertTo-Json -Depth 5
$ticketId = $ticket.ticket.id

Write-Host "`n=== Ana lista SUS tickets ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$base/tickets" -Headers $headersAna | ConvertTo-Json -Depth 5

Write-Host "`n=== Ana ve UN ticket ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$base/tickets/$ticketId" -Headers $headersAna | ConvertTo-Json -Depth 5

Write-Host "`n=== Otro usuario NO debe ver el ticket de Ana ===" -ForegroundColor Cyan
$luis = Register-OrLogin "Luis Usuario" "luis@example.com" "secret1" "usuario"
$headersLuis = @{ Authorization = "Bearer $($luis.token)" }
try {
  Invoke-RestMethod -Uri "$base/tickets/$ticketId" -Headers $headersLuis
} catch {
  Write-Host "Correcto: Luis no puede ver el ticket de Ana (403)." -ForegroundColor Yellow
}

Write-Host "`n=== El tecnico ve TODOS los tickets ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$base/tickets" -Headers $headersTeo | ConvertTo-Json -Depth 5

Write-Host "`n=== El tecnico cambia el estado a en_proceso ===" -ForegroundColor Cyan
Invoke-RestMethod -Method Patch -Uri "$base/tickets/$ticketId/estado" -Headers $headersTeo -ContentType "application/json" -Body (@{
  status = "en_proceso"
} | ConvertTo-Json) | ConvertTo-Json -Depth 5

Write-Host "`n=== El tecnico marca el ticket como resuelto ===" -ForegroundColor Cyan
Invoke-RestMethod -Method Patch -Uri "$base/tickets/$ticketId/estado" -Headers $headersTeo -ContentType "application/json" -Body (@{
  status = "resuelto"
} | ConvertTo-Json) | ConvertTo-Json -Depth 5

Write-Host "`nListo. Tambien puedes enviar status = 'en proceso' (con espacio); la API lo guarda como en_proceso." -ForegroundColor Green
