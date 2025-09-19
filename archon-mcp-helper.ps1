# Archon MCP Helper Script

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("check", "start", "stop", "status")]
    [string]$Action = "check"
)

Write-Host "🏛️ Archon MCP Helper" -ForegroundColor Cyan
Write-Host "=" * 40

switch($Action) {
    "check" {
        Write-Host "🔍 Verificando status do Archon MCP..." -ForegroundColor Yellow
        
        # Verificar se a porta 8051 está em uso
        $port = netstat -ano | Select-String "8051.*LISTENING"
        if($port) {
            Write-Host "✅ Porta 8051 está em uso" -ForegroundColor Green
            $processId = ($port -split '\s+')[-1]
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if($process) {
                Write-Host "📊 Processo: $($process.Name) (ID: $processId)" -ForegroundColor Gray
            }
        } else {
            Write-Host "❌ Porta 8051 não está em uso" -ForegroundColor Red
            return
        }
        
        # Testar conexão HTTP
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8051/mcp" -Method POST -ContentType "application/json" -Body '{"jsonrpc":"2.0","method":"initialize","id":1}' -TimeoutSec 3 -ErrorAction Stop
            Write-Host "✅ Archon MCP está respondendo! Status: $($response.StatusCode)" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Porta ativa mas MCP não responde corretamente" -ForegroundColor Yellow
            Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Gray
        }
    }
    
    "status" {
        Write-Host "📊 Status detalhado do Archon MCP..." -ForegroundColor Yellow
        
        # Verificar configuração MCP
        $configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
        if(Test-Path $configPath) {
            $config = Get-Content $configPath | ConvertFrom-Json
            if($config.mcpServers.archon) {
                Write-Host "✅ Configurado em claude_desktop_config.json" -ForegroundColor Green
                Write-Host "   URL: $($config.mcpServers.archon.url)" -ForegroundColor Gray
            } else {
                Write-Host "❌ Não configurado em claude_desktop_config.json" -ForegroundColor Red
            }
        }
        
        # Verificar conexões ativas
        $connections = netstat -ano | Select-String "8051"
        if($connections) {
            Write-Host "🔗 Conexões ativas na porta 8051:" -ForegroundColor Cyan
            $connections | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
        }
    }
    
    "start" {
        Write-Host "🚀 Tentando iniciar Archon MCP..." -ForegroundColor Yellow
        Write-Host "⚠️ Archon MCP deve ser iniciado externamente" -ForegroundColor Yellow
        Write-Host "   Verifique se o servidor Archon está rodando em outro processo" -ForegroundColor Gray
        Write-Host "   Documentação: https://github.com/your-archon-repo" -ForegroundColor Gray
    }
    
    "stop" {
        Write-Host "🛑 Parando Archon MCP..." -ForegroundColor Yellow
        $port = netstat -ano | Select-String "8051.*LISTENING"
        if($port) {
            $processId = ($port -split '\s+')[-1]
            Write-Host "⚠️ Processo $processId está usando a porta 8051" -ForegroundColor Yellow
            Write-Host "   Use o Task Manager ou 'taskkill /PID $processId' se necessário" -ForegroundColor Gray
        } else {
            Write-Host "✅ Nenhum processo na porta 8051" -ForegroundColor Green
        }
    }
}

Write-Host "`n💡 Comandos disponíveis:" -ForegroundColor Cyan
Write-Host "   .\archon-mcp-helper.ps1 check   - Verificar status" -ForegroundColor White
Write-Host "   .\archon-mcp-helper.ps1 status  - Status detalhado" -ForegroundColor White
Write-Host "   .\archon-mcp-helper.ps1 start   - Ajuda para iniciar" -ForegroundColor White
Write-Host "   .\archon-mcp-helper.ps1 stop    - Ajuda para parar" -ForegroundColor White