# Setup MCP for COGERH ASGRC Project
# Este script configura os servidores MCP para integração com Warp

Write-Host "🔧 Configurando MCPs para o projeto COGERH ASGRC..." -ForegroundColor Cyan

# Verificar se existe arquivo .env
$envFile = ".\.env"
if (!(Test-Path $envFile)) {
    Write-Host "❌ Arquivo .env não encontrado. Copie .env.example para .env e configure suas credenciais." -ForegroundColor Red
    Write-Host "Execute: Copy-Item .env.example .env" -ForegroundColor Yellow
    exit 1
}

# Ler variáveis do arquivo .env
Write-Host "📖 Lendo configurações do arquivo .env..." -ForegroundColor Green
$envVars = @{}
Get-Content $envFile | Where-Object { $_ -match '^\s*[^#].+' } | ForEach-Object {
    $key, $value = $_ -split '=', 2
    if ($key -and $value) {
        $envVars[$key.Trim()] = $value.Trim()
    }
}

# Verificar se as variáveis necessárias estão configuradas
$requiredVars = @("VITE_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY")
$missingVars = @()

foreach ($var in $requiredVars) {
    if (!$envVars[$var] -or $envVars[$var] -eq "your_supabase_url_here" -or $envVars[$var] -eq "your_supabase_service_role_key_here") {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "❌ As seguintes variáveis não estão configuradas no .env:" -ForegroundColor Red
    $missingVars | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    Write-Host "Configure essas variáveis antes de continuar." -ForegroundColor Red
    exit 1
}

# Criar configuração do MCP
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
$configDir = Split-Path $configPath -Parent

# Criar diretório se não existir
if (!(Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    Write-Host "📁 Criado diretório de configuração: $configDir" -ForegroundColor Green
}

# Configuração MCP personalizada para o projeto
$mcpConfig = @{
    mcpServers = @{
        "cogerh-supabase" = @{
            command = "npx"
            args = @("@supabase/mcp-server-supabase")
            env = @{
                SUPABASE_URL = $envVars["VITE_SUPABASE_URL"]
                SUPABASE_SERVICE_ROLE_KEY = $envVars["SUPABASE_SERVICE_ROLE_KEY"]
            }
        }
        "cogerh-playwright" = @{
            command = "npx"
            args = @("@modelcontextprotocol/server-playwright")
        }
        "cogerh-filesystem" = @{
            command = "npx"
            args = @("@modelcontextprotocol/server-filesystem", "D:\Israel\Projetos Clientes\Projetos TRAE\cogerh ASGRC")
        }
    }
}

# Salvar configuração
$mcpConfig | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8
Write-Host "✅ Configuração MCP salva em: $configPath" -ForegroundColor Green

# Verificar se os pacotes MCP estão instalados
Write-Host "🔍 Verificando pacotes MCP instalados..." -ForegroundColor Cyan

$requiredPackages = @(
    "@supabase/mcp-server-supabase",
    "@modelcontextprotocol/server-playwright", 
    "@modelcontextprotocol/server-filesystem"
)

$missingPackages = @()
foreach ($package in $requiredPackages) {
    $installed = npm list -g $package 2>$null
    if ($LASTEXITCODE -ne 0) {
        $missingPackages += $package
    }
}

if ($missingPackages.Count -gt 0) {
    Write-Host "📦 Instalando pacotes MCP faltantes..." -ForegroundColor Yellow
    foreach ($package in $missingPackages) {
        Write-Host "  Instalando $package..." -ForegroundColor Gray
        npm install -g $package
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ $package instalado com sucesso" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Erro ao instalar $package" -ForegroundColor Red
        }
    }
} else {
    Write-Host "✅ Todos os pacotes MCP necessários estão instalados" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Configuração MCP concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Reinicie o Claude Desktop (se estiver rodando)" -ForegroundColor White
Write-Host "2. Abra o Warp e verifique se os MCPs estão disponíveis" -ForegroundColor White
Write-Host "3. Os seguintes servidores MCP foram configurados:" -ForegroundColor White
Write-Host "   - cogerh-supabase: Acesso ao banco de dados Supabase" -ForegroundColor Gray
Write-Host "   - cogerh-playwright: Testes automatizados" -ForegroundColor Gray
Write-Host "   - cogerh-filesystem: Acesso aos arquivos do projeto" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Dica: Use comandos como 'list tables' ou 'read file src/App.tsx' no Warp" -ForegroundColor Yellow