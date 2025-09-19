# Guia de Integração MCP com Warp - COGERH ASGRC

## O que são MCPs?

Model Context Protocol (MCP) é um protocolo que permite que LLMs (como o Claude no Warp) se conectem a diferentes fontes de dados e serviços. Isso permite que você:

- **Consulte seu banco de dados** diretamente no Warp
- **Leia arquivos** do seu projeto
- **Execute scripts** e obtenha resultados
- **Acesse APIs** externas

## Status da Configuração ✅

Sua configuração MCP foi criada com sucesso em:
```
C:\Users\isa_e\AppData\Roaming\Claude\claude_desktop_config.json
```

## MCPs Configurados

### 1. Supabase MCP
- **Servidor**: `@supabase/mcp-server-supabase` 
- **Status**: ✅ Instalado
- **Função**: Acesso direto ao seu banco de dados Supabase

## Como Finalizar a Configuração

### Passo 1: Configure suas credenciais
Se ainda não fez, configure o arquivo `.env`:

```powershell
# Copie o arquivo de exemplo
Copy-Item .env.example .env

# Edite com suas credenciais reais
notepad .env
```

### Passo 2: Atualize a configuração MCP com suas credenciais
Execute este comando para atualizar com suas credenciais reais:

```powershell
# Substitua pelas suas credenciais reais
$config = Get-Content "$env:APPDATA\Claude\claude_desktop_config.json" | ConvertFrom-Json
$config.mcpServers.supabase.env.SUPABASE_URL = "SUA_URL_DO_SUPABASE"
$config.mcpServers.supabase.env.SUPABASE_SERVICE_ROLE_KEY = "SUA_CHAVE_SERVICE_ROLE"
$config | ConvertTo-Json -Depth 10 | Set-Content "$env:APPDATA\Claude\claude_desktop_config.json"
```

### Passo 3: Reinicie o Claude Desktop
Se o Claude Desktop estiver rodando, feche e reabra para carregar a nova configuração.

## Como Usar MCPs no Warp

Uma vez configurado, você pode usar comandos naturais no Warp:

### Comandos de Banco de Dados (Supabase)
```
# Listar todas as tabelas
"List all tables in the database"

# Ver estrutura de uma tabela específica
"Show me the structure of the matriz_riscos table"

# Consultar dados
"Get all risks with high severity from matriz_riscos"

# Contar registros
"How many users are in the 002_usuarios table?"

# Consultas complexas
"Show me the top 5 risks by severity with their associated actions"
```

### Comandos de Sistema
```
# Ver estrutura do projeto
"Show me the structure of this React project"

# Analisar código
"Analyze the authentication flow in src/store/authStore.ts"

# Verificar dependências
"What are the main dependencies of this project?"
```

## Solução de Problemas

### MCP não aparece no Warp
1. Verifique se a configuração está correta:
   ```powershell
   Get-Content "$env:APPDATA\Claude\claude_desktop_config.json"
   ```

2. Certifique-se de que o pacote está instalado:
   ```powershell
   npm list -g @supabase/mcp-server-supabase
   ```

3. Reinicie o Warp completamente

### Erro de autenticação com Supabase
1. Verifique suas credenciais no arquivo `.env`
2. Certifique-se de usar a `SERVICE_ROLE_KEY`, não a `ANON_KEY`
3. Confirme que a URL está correta (sem barra final)

### Comandos não funcionam
1. Tente comandos mais específicos: "Query the matriz_riscos table"
2. Use linguagem natural: "What tables exist in my Supabase database?"
3. Seja explícito sobre o que quer: "Show me 10 rows from the usuarios table"

## MCPs Adicionais Recomendados

Para expandir ainda mais as capacidades, considere instalar:

```powershell
# MCP para sistemas de arquivos (acesso a arquivos)
npm install -g @anthropic/mcp-server-filesystem

# MCP para Git (controle de versão)
npm install -g @anthropic/mcp-server-git

# MCP para PostgreSQL direto (alternativa ao Supabase)
npm install -g pg-mcp-server
```

## Configuração Avançada

### Adicionando MCP de Filesystem
Para acessar arquivos do projeto diretamente:

```json
{
  "mcpServers": {
    "supabase": { /* configuração existente */ },
    "filesystem": {
      "command": "npx",
      "args": ["@anthropic/mcp-server-filesystem", "D:\\Israel\\Projetos Clientes\\Projetos TRAE\\cogerh ASGRC"],
      "env": {}
    }
  }
}
```

### Adicionando MCP do Git
Para controle de versão:

```json
{
  "mcpServers": {
    "supabase": { /* configuração existente */ },
    "git": {
      "command": "npx",
      "args": ["@anthropic/mcp-server-git", "--repository", "D:\\Israel\\Projetos Clientes\\Projetos TRAE\\cogerh ASGRC"],
      "env": {}
    }
  }
}
```

## Scripts de Automação

### Script para atualizar credenciais automaticamente
```powershell
# update-mcp-credentials.ps1
param(
    [Parameter(Mandatory=$false)]
    [string]$EnvFile = ".env"
)

if (!(Test-Path $EnvFile)) {
    Write-Error "Arquivo $EnvFile não encontrado!"
    exit 1
}

# Ler credenciais do .env
$envVars = @{}
Get-Content $EnvFile | Where-Object { $_ -match '^\s*[^#].+' } | ForEach-Object {
    $key, $value = $_ -split '=', 2
    if ($key -and $value) {
        $envVars[$key.Trim()] = $value.Trim()
    }
}

$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
$config = Get-Content $configPath | ConvertFrom-Json

$config.mcpServers.supabase.env.SUPABASE_URL = $envVars["VITE_SUPABASE_URL"]
$config.mcpServers.supabase.env.SUPABASE_SERVICE_ROLE_KEY = $envVars["SUPABASE_SERVICE_ROLE_KEY"]

$config | ConvertTo-Json -Depth 10 | Set-Content $configPath

Write-Host "✅ Credenciais MCP atualizadas com sucesso!" -ForegroundColor Green
```

## Exemplos Práticos para seu Projeto

### Análise de Riscos
```
"Show me all high-severity risks from the matriz_riscos table and group them by area"
```

### Monitoramento de Usuários  
```
"How many users have access to risk management features?"
```

### Análise de Código
```
"Explain the authentication flow in this React application"
```

### Performance
```
"What are the most complex queries in this application and how can they be optimized?"
```

## Benefícios para Desenvolvimento

Com MCPs configurados, você pode:

1. **Debugging Rápido**: Consultar dados diretamente sem sair do terminal
2. **Análise de Código**: Entender estruturas complexas rapidamente
3. **Monitoramento**: Verificar estado da aplicação em tempo real
4. **Documentação**: Gerar documentação baseada no código atual

## Próximos Passos

1. ✅ Configure suas credenciais no `.env`
2. ✅ Atualize o arquivo MCP com as credenciais
3. ✅ Teste comandos básicos no Warp
4. ✅ Explore comandos mais complexos
5. ✅ Considere MCPs adicionais conforme necessário

---

**Atualizado em**: Setembro 2025  
**Status**: Configuração Básica Completa  
**Próxima Revisão**: Após testes iniciais