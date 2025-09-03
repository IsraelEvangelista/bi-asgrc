-- Migração: Adicionar campo de verificação contra tabela de funcionários
-- Data: 2024-01-24
-- Descrição: Prepara a estrutura para validação futura contra tabela de funcionários do PostgreSQL

-- Adicionar campo verified_against_employee_table à tabela 002_usuarios
ALTER TABLE "002_usuarios" 
ADD COLUMN "verified_against_employee_table" BOOLEAN DEFAULT FALSE;

-- Adicionar comentário explicativo
COMMENT ON COLUMN "002_usuarios"."verified_against_employee_table" IS 
'Campo para indicar se o usuário foi validado contra a tabela de funcionários durante a migração para PostgreSQL';

-- Adicionar campo employee_id para referência futura (opcional)
ALTER TABLE "002_usuarios" 
ADD COLUMN "employee_id" TEXT NULL;

-- Adicionar comentário para employee_id
COMMENT ON COLUMN "002_usuarios"."employee_id" IS 
'ID do funcionário na tabela de funcionários da empresa (usado após migração para PostgreSQL)';

-- Criar índice para otimizar consultas de verificação
CREATE INDEX IF NOT EXISTS "idx_usuarios_verified_employee" 
ON "002_usuarios" ("verified_against_employee_table");

CREATE INDEX IF NOT EXISTS "idx_usuarios_employee_id" 
ON "002_usuarios" ("employee_id") 
WHERE "employee_id" IS NOT NULL;

-- Atualizar a função de trigger para incluir o novo campo no updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Garantir que o trigger existe para a tabela usuarios
DROP TRIGGER IF EXISTS update_002_usuarios_updated_at ON "002_usuarios";
CREATE TRIGGER update_002_usuarios_updated_at 
    BEFORE UPDATE ON "002_usuarios" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();