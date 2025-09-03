# Documentação: Sistema de Validação de Funcionários

## Visão Geral

Este documento descreve o processo de migração e validação de usuários contra a tabela de funcionários da empresa durante a transição para o banco PostgreSQL.

## Estrutura Atual (Supabase)

### Tabela `002_usuarios`

A tabela foi expandida com os seguintes campos para preparar a migração:

- `verified_against_employee_table` (BOOLEAN): Indica se o usuário foi validado contra a tabela de funcionários
- `employee_id` (TEXT): ID do funcionário na tabela corporativa (preenchido após validação)

## Processo de Migração

### Fase 1: Cadastro Atual (Supabase)

1. **Registro de Usuário**:
   - Usuário preenche formulário com nome, email e senha
   - Sistema cria conta no Supabase Auth
   - Registro é inserido na tabela `002_usuarios` com:
     - `verified_against_employee_table = false`
     - `employee_id = null`
     - `ativo = false` (até verificação de email)

2. **Verificação de Email**:
   - Usuário recebe email de confirmação
   - Após confirmação, `ativo` é alterado para `true`
   - Usuário pode fazer login normalmente

### Fase 2: Migração para PostgreSQL

1. **Preparação da Base**:
   - Importar tabela de funcionários da empresa para PostgreSQL
   - Estrutura esperada da tabela `funcionarios`:
     ```sql
     CREATE TABLE funcionarios (
       id SERIAL PRIMARY KEY,
       employee_id VARCHAR(50) UNIQUE NOT NULL,
       nome VARCHAR(255) NOT NULL,
       email VARCHAR(255) UNIQUE NOT NULL,
       area_gerencia VARCHAR(100),
       cargo VARCHAR(100),
       status VARCHAR(20) DEFAULT 'ativo',
       created_at TIMESTAMP DEFAULT NOW()
     );
     ```

2. **Processo de Validação**:
   ```sql
   -- Script de validação automática
   UPDATE "002_usuarios" 
   SET 
     verified_against_employee_table = true,
     employee_id = f.employee_id
   FROM funcionarios f 
   WHERE "002_usuarios".email = f.email 
     AND f.status = 'ativo';
   ```

3. **Tratamento de Casos Especiais**:
   - Usuários não encontrados na tabela de funcionários
   - Funcionários inativos
   - Emails divergentes

## Implementação no Código

### AuthStore - Função signUp Atualizada

```typescript
// Após a migração, a função signUp deve incluir validação
const signUp = async (data: RegisterData): Promise<RegisterResponse> => {
  // ... código atual ...
  
  // Após migração para PostgreSQL:
  // 1. Verificar se email existe na tabela funcionarios
  const employeeValidation = await supabase
    .from('funcionarios')
    .select('employee_id, nome, area_gerencia')
    .eq('email', data.email)
    .eq('status', 'ativo')
    .single();
  
  if (employeeValidation.data) {
    // Funcionário válido - auto-aprovar
    userData.verified_against_employee_table = true;
    userData.employee_id = employeeValidation.data.employee_id;
    userData.ativo = true; // Auto-ativar após verificação de email
  } else {
    // Funcionário não encontrado - processo manual
    userData.verified_against_employee_table = false;
    userData.employee_id = null;
    userData.ativo = false; // Requer aprovação manual
  }
};
```

### Middleware de Validação

```typescript
// Middleware para verificar status do funcionário
export const validateEmployeeStatus = async (userId: string) => {
  const { data: user } = await supabase
    .from('002_usuarios')
    .select('verified_against_employee_table, employee_id, ativo')
    .eq('id', userId)
    .single();
  
  if (!user?.verified_against_employee_table) {
    throw new Error('Usuário não validado contra base de funcionários');
  }
  
  if (!user?.ativo) {
    throw new Error('Usuário inativo no sistema');
  }
  
  return user;
};
```

## Fluxos de Usuário

### Cenário 1: Funcionário Válido
1. Usuário se cadastra com email corporativo
2. Sistema valida automaticamente contra tabela funcionarios
3. Usuário recebe email de confirmação
4. Após confirmação, acesso é liberado imediatamente

### Cenário 2: Email Não Encontrado
1. Usuário se cadastra com email não corporativo
2. Sistema não encontra na tabela funcionarios
3. Conta fica pendente de aprovação manual
4. Administrador deve validar e aprovar manualmente

### Cenário 3: Funcionário Inativo
1. Usuário se cadastra com email de ex-funcionário
2. Sistema encontra registro mas status = 'inativo'
3. Cadastro é rejeitado automaticamente
4. Usuário recebe mensagem explicativa

## Configurações de Segurança

### RLS (Row Level Security)

```sql
-- Política para usuários verificados
CREATE POLICY "Usuários verificados podem acessar dados" 
ON "002_usuarios" 
FOR ALL 
USING (verified_against_employee_table = true AND ativo = true);

-- Política para administradores
CREATE POLICY "Administradores podem gerenciar todos usuários" 
ON "002_usuarios" 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');
```

## Monitoramento e Logs

- Registrar todas tentativas de cadastro
- Log de validações automáticas vs manuais
- Alertas para tentativas de cadastro com emails suspeitos
- Relatório mensal de novos usuários e validações

## Rollback e Contingência

1. **Backup da Base**: Sempre fazer backup antes da migração
2. **Rollback Script**: Preparar script para reverter alterações
3. **Modo Compatibilidade**: Manter funcionamento atual durante transição
4. **Testes**: Validar em ambiente de homologação primeiro

## Próximos Passos

1. ✅ Implementar campos de preparação na tabela usuarios
2. ✅ Criar sistema de cadastro com abas
3. ⏳ Preparar scripts de migração para PostgreSQL
4. ⏳ Implementar validação automática contra tabela funcionarios
5. ⏳ Criar interface de administração para aprovações manuais
6. ⏳ Implementar sistema de notificações para administradores

---

**Última atualização**: Janeiro 2024  
**Responsável**: Sistema COGERH ASGRC  
**Status