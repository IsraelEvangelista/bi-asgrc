# Setup MCP Simples para COGERH ASGRC Project

Write-Host "🔧 Configurando MCPs para integração com Warp..." -ForegroundColor Cyan

# Criar configuração básica do MCP apenas com Supabase (que sabemos que funciona)
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
$configDir = Split-Path $configPath -Parent

# Criar diretório se não existir
if (!(Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    Write-Host "📁 Criado diretório: $configDir" -ForegroundColor Green
}

# Verificar se arquivo .env existe
if (Test-Path ".\.env") {
    Write-Host "✅ Arquivo .env encontrado" -ForegroundColor Green
    
    # Ler configurações do .env
    $envContent = Get-Content ".\.env" | Where-Object { $_ -match '^\s*[^#].+' }
    $supabaseUrl = ($envContent | Where-Object { $_ -match 'VITE_SUPABASE_URL' }) -replace '.*=\s*', ''
    $serviceKey = ($envContent | Where-Object { $_ -match 'SUPABASE_SERVICE_ROLE_KEY' }) -replace '.*=\s*', ''
    
    if ($supabaseUrl -and $supabaseUrl -ne "your_supabase_url_here" -and 
        $serviceKey -and $serviceKey -ne "your_supabase_service_role_key_here") {
        
        # Configuração MCP com credenciais reais
        $mcpConfig = @{
            mcpServers = @{
                "supabase" = @{
                    command = "npx"
                    args = @("@supabase/mcp-server-supabase")
                    env = @{
                        SUPABASE_URL = $supabaseUrl
                        SUPABASE_SERVICE_ROLE_KEY = $serviceKey
                    }
                }
            }
        }
        
        Write-Host "✅ Configurando MCP com suas credenciais do Supabase" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Credenciais do Supabase não configuradas. Configure o arquivo .env primeiro." -ForegroundColor Yellow
        
        # Configuração básica sem credenciais
        $mcpConfig = @{
            mcpServers = @{
                "supabase" = @{
                    command = "npx"
                    args = @("@supabase/mcp-server-supabase")
                    env = @{
                        SUPABASE_URL = "your_supabase_url_here"
                        SUPABASE_SERVICE_ROLE_KEY = "your_service_role_key_here"
                    }
                }
            }
        }
    }
} else {
    Write-Host "⚠️  Arquivo .env não encontrado. Execute: Copy-Item .env.example .env" -ForegroundColor Yellow
    
    # Configuração template
    $mcpConfig = @{
        mcpServers = @{
            "supabase" = @{
                command = "npx"
                args = @("@supabase/mcp-server-supabase")
                env = @{
                    SUPABASE_URL = "your_supabase_url_here"
                    SUPABASE_SERVICE_ROLE_KEY = "your_service_role_key_here"
                }
            }
        }
    }
}

# Salvar configuração
$mcpConfig | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8
Write-Host "✅ Configuração salva em: $configPath" -ForegroundColor Green

# Mostrar conteúdo do arquivo
Write-Host "`n📋 Configuração MCP criada:" -ForegroundColor Cyan
Get-Content $configPath | Write-Host

Write-Host "`n🎉 Setup concluído!" -ForegroundColor Green
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Configure o arquivo .env com suas credenciais (se não fez ainda)" -ForegroundColor White
Write-Host "2. Reinicie o Claude Desktop se estiver rodando" -ForegroundColor White
Write-Host "3. No Warp, os MCPs devem aparecer automaticamente" -ForegroundColor White
Write-Host "4. Teste com comandos como: 'list tables from supabase'" -ForegroundColor White