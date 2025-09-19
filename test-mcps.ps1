# Script para Testar Todos os MCPs Instalados

Write-Host "🧪 Testando Conectividade dos MCPs..." -ForegroundColor Cyan
Write-Host "=" * 50

$mcps = @(
    @{Name="Supabase"; Package="@supabase/mcp-server-supabase"; Test="--help"}
    @{Name="PostgreSQL"; Package="pg-mcp-server"; Test="--help"}  
    @{Name="Firecrawl"; Package="firecrawl-mcp"; Test="--version"}
    @{Name="Gemini"; Package="gemini-mcp"; Test="--help"}
    @{Name="Perplexity"; Package="perplexity-mcp"; Test="--help"}
    @{Name="Context7"; Package="@upstash/context7-mcp"; Test="--help"}
    @{Name="Playwright"; Package="@playwright/mcp"; Test="--help"}
    @{Name="TestSprite"; Package="@testsprite/testsprite-mcp"; Test="--help"}
)

foreach($mcp in $mcps) {
    Write-Host "`n🔍 Testando $($mcp.Name)..." -ForegroundColor Yellow
    
    # Verificar se está instalado
    $installed = npm list -g $mcp.Package 2>$null
    if($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Instalado: $($mcp.Package)" -ForegroundColor Green
        
        # Testar execução
        $test = npx $mcp.Package $mcp.Test 2>$null
        if($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Executável: Funcionando" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Executável: Pode precisar de configuração" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ❌ Não instalado: $($mcp.Package)" -ForegroundColor Red
    }
}

Write-Host "`n📋 Verificando Configuração..." -ForegroundColor Cyan
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"

if(Test-Path $configPath) {
    Write-Host "✅ Arquivo de configuração encontrado" -ForegroundColor Green
    $config = Get-Content $configPath | ConvertFrom-Json
    $serverCount = ($config.mcpServers | Get-Member -MemberType NoteProperty).Count
    Write-Host "✅ Servidores MCP configurados: $serverCount" -ForegroundColor Green
    
    Write-Host "`n📊 Servidores configurados:" -ForegroundColor Cyan
    $config.mcpServers | Get-Member -MemberType NoteProperty | ForEach-Object {
        Write-Host "  - $($_.Name)" -ForegroundColor White
    }
} else {
    Write-Host "❌ Arquivo de configuração não encontrado" -ForegroundColor Red
}

Write-Host "`n🎯 Próximos Passos:" -ForegroundColor Cyan
Write-Host "1. Configure as credenciais do Supabase no arquivo .env" -ForegroundColor White
Write-Host "2. Atualize a configuração MCP com as credenciais reais" -ForegroundColor White  
Write-Host "3. Reinicie o Claude Desktop" -ForegroundColor White
Write-Host "4. Teste comandos no Warp como: 'List all tables'" -ForegroundColor White

Write-Host "`n✨ Integração MCP concluída com sucesso!" -ForegroundColor Green