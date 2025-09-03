# Epic 4: Dashboard Executivo Dinâmico - Especificação de Banco de Dados

## 1. Visão Geral das Mudanças no Banco

### 1.1 Objetivo
Este documento detalha as modificações necessárias no banco de dados para suportar o Dashboard Executivo Dinâmico, incluindo novas tabelas, índices, funções e políticas RLS.

### 1.2 Impacto nas Tabelas Existentes
- **riscos**: Adição de campos para controle de visibilidade no dashboard
- **usuarios**: Extensão para suporte a filtros personalizados
- **perfis**: Novas permissões específicas do dashboard

### 1.3 Novas Tabelas
- **dashboard_kpis**: Configuração de KPIs personalizáveis
- **dashboard_cache**: Cache de dados para performance
- **dashboard_user_preferences**: Preferências do usuário
- **audit_dashboard**: Logs de auditoria específicos

## 2. Migrações do Banco de Dados

### 2.1 Migração 007: Extensões da Tabela Riscos

```sql
-- 007_dashboard_riscos_extensions.sql

-- Adicionar campos para controle do dashboard na tabela riscos
ALTER TABLE riscos ADD COLUMN IF NOT EXISTS dashboard_visible BOOLEAN DEFAULT true;
ALTER TABLE riscos ADD COLUMN IF NOT EXISTS dashboard_priority INTEGER DEFAULT 0;
ALTER TABLE riscos ADD COLUMN IF NOT EXISTS dashboard_color VARCHAR(20) DEFAULT 'blue';
ALTER TABLE riscos ADD COLUMN IF NOT EXISTS dashboard_tags TEXT[] DEFAULT '{}';
ALTER TABLE riscos ADD COLUMN IF NOT EXISTS last_dashboard_update TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Adicionar constraint para dashboard_color
ALTER TABLE riscos ADD CONSTRAINT check_dashboard_color 
    CHECK (dashboard_color IN ('green', 'yellow', 'orange', 'red', 'blue', 'purple', 'gray'));

-- Adicionar constraint para dashboard_priority
ALTER TABLE riscos ADD CONSTRAINT check_dashboard_priority 
    CHECK (dashboard_priority >= 0 AND dashboard_priority <= 10);

-- Criar índices para performance do dashboard
CREATE INDEX IF NOT EXISTS idx_riscos_dashboard_visible 
    ON riscos(dashboard_visible) WHERE dashboard_visible = true;

CREATE INDEX IF NOT EXISTS idx_riscos_dashboard_priority 
    ON riscos(dashboard_priority DESC) WHERE dashboard_visible = true;

CREATE INDEX IF NOT EXISTS idx_riscos_area_status_dashboard 
    ON riscos(area_responsavel, status) WHERE dashboard_visible = true;

CREATE INDEX IF NOT EXISTS idx_riscos_data_identificacao_dashboard 
    ON riscos(data_identificacao DESC) WHERE dashboard_visible = true;

CREATE INDEX IF NOT EXISTS idx_riscos_probabilidade_impacto 
    ON riscos(probabilidade, impacto) WHERE dashboard_visible = true;

-- Criar índice composto para matriz de riscos
CREATE INDEX IF NOT EXISTS idx_riscos_matrix_data 
    ON riscos(probabilidade, impacto, area_responsavel, status) 
    WHERE dashboard_visible = true;

-- Função para atualizar timestamp do dashboard
CREATE OR REPLACE FUNCTION update_dashboard_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_dashboard_update = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar timestamp automaticamente
CREATE TRIGGER trigger_update_dashboard_timestamp
    BEFORE UPDATE ON riscos
    FOR EACH ROW
    EXECUTE FUNCTION update_dashboard_timestamp();

-- Comentários para documentação
COMMENT ON COLUMN riscos.dashboard_visible IS 'Controla se o risco aparece no dashboard';
COMMENT ON COLUMN riscos.dashboard_priority IS 'Prioridade de exibição no dashboard (0-10)';
COMMENT ON COLUMN riscos.dashboard_color IS 'Cor personalizada para exibição no dashboard';
COMMENT ON COLUMN riscos.dashboard_tags IS 'Tags para categorização no dashboard';
COMMENT ON COLUMN riscos.last_dashboard_update IS 'Última atualização relevante para o dashboard';
```

### 2.2 Migração 008: Tabela de KPIs Configuráveis

```sql
-- 008_dashboard_kpis.sql

-- Criar tabela para KPIs configuráveis
CREATE TABLE dashboard_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    query_sql TEXT NOT NULL,
    query_params JSONB DEFAULT '{}',
    formato VARCHAR(20) DEFAULT 'number' CHECK (formato IN ('number', 'percentage', 'currency', 'decimal')),
    cor VARCHAR(20) DEFAULT 'blue' CHECK (cor IN ('green', 'yellow', 'orange', 'red', 'blue', 'purple', 'gray')),
    icone VARCHAR(50),
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    perfis_acesso TEXT[] DEFAULT '{}',
    areas_acesso TEXT[] DEFAULT '{}',
    refresh_interval INTEGER DEFAULT 300, -- segundos
    cache_duration INTEGER DEFAULT 600, -- segundos
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_dashboard_kpis_ativo_ordem ON dashboard_kpis(ativo, ordem) WHERE ativo = true;
CREATE INDEX idx_dashboard_kpis_perfis ON dashboard_kpis USING GIN(perfis_acesso);
CREATE INDEX idx_dashboard_kpis_areas ON dashboard_kpis USING GIN(areas_acesso);

-- RLS para KPIs
ALTER TABLE dashboard_kpis ENABLE ROW LEVEL SECURITY;

-- Política para visualização de KPIs
CREATE POLICY "Users can view KPIs for their profile and area" ON dashboard_kpis
    FOR SELECT USING (
        ativo = true AND (
            -- Administradores veem todos
            auth.uid() IN (
                SELECT u.id FROM usuarios u 
                JOIN perfis p ON u.perfil_id = p.id 
                WHERE p.nome = 'Administrador'
            )
            OR
            -- Usuários veem KPIs do seu perfil
            auth.uid() IN (
                SELECT u.id FROM usuarios u 
                JOIN perfis p ON u.perfil_id = p.id 
                WHERE p.nome = ANY(perfis_acesso)
            )
            OR
            -- Usuários veem KPIs da sua área
            auth.uid() IN (
                SELECT u.id FROM usuarios u 
                WHERE u.areas_acesso && areas_acesso
            )
        )
    );

-- Política para administradores gerenciarem KPIs
CREATE POLICY "Admins can manage KPIs" ON dashboard_kpis
    FOR ALL USING (
        auth.uid() IN (
            SELECT u.id FROM usuarios u 
            JOIN perfis p ON u.perfil_id = p.id 
            WHERE 'MANAGE_DASHBOARD' = ANY(p.permissoes)
        )
    );

-- Inserir KPIs padrão
INSERT INTO dashboard_kpis (nome, descricao, query_sql, formato, cor, icone, ordem, perfis_acesso) VALUES
('Total de Riscos Ativos', 'Número total de riscos com status ativo', 
 'SELECT COUNT(*) FROM riscos WHERE status = ''ativo'' AND dashboard_visible = true', 
 'number', 'blue', 'AlertTriangle', 1, '{"Administrador", "Gestor de Área", "Responsável de Processo"}'),

('Riscos Críticos', 'Riscos com probabilidade x impacto >= 16', 
 'SELECT COUNT(*) FROM riscos WHERE status = ''ativo'' AND dashboard_visible = true AND (probabilidade * impacto) >= 16', 
 'number', 'red', 'AlertCircle', 2, '{"Administrador", "Gestor de Área", "Responsável de Processo"}'),

('Riscos Vencidos', 'Riscos com prazo de tratamento vencido', 
 'SELECT COUNT(*) FROM riscos WHERE status = ''ativo'' AND dashboard_visible = true AND prazo_tratamento < CURRENT_DATE', 
 'number', 'orange', 'Clock', 3, '{"Administrador", "Gestor de Área", "Responsável de Processo"}'),

('Taxa de Mitigação', 'Percentual de riscos mitigados no período', 
 'SELECT ROUND((COUNT(*) FILTER (WHERE status = ''mitigado'') * 100.0 / NULLIF(COUNT(*), 0)), 1) FROM riscos WHERE dashboard_visible = true AND data_identificacao >= CURRENT_DATE - INTERVAL ''30 days''', 
 'percentage', 'green', 'Shield', 4, '{"Administrador", "Gestor de Área"}');

-- Comentários
COMMENT ON TABLE dashboard_kpis IS 'Configuração de KPIs personalizáveis para o dashboard';
COMMENT ON COLUMN dashboard_kpis.query_sql IS 'Query SQL para calcular o valor do KPI';
COMMENT ON COLUMN dashboard_kpis.query_params IS 'Parâmetros dinâmicos para a query (JSON)';
COMMENT ON COLUMN dashboard_kpis.refresh_interval IS 'Intervalo de atualização em segundos';
COMMENT ON COLUMN dashboard_kpis.cache_duration IS 'Duração do cache em segundos';
```

### 2.3 Migração 009: Sistema de Cache do Dashboard

```sql
-- 009_dashboard_cache.sql

-- Criar tabela de cache para o dashboard
CREATE TABLE dashboard_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cache_key VARCHAR(255) NOT NULL,
    cache_type VARCHAR(50) NOT NULL CHECK (cache_type IN ('kpi', 'matrix', 'chart', 'filter')),
    data JSONB NOT NULL,
    filters_hash VARCHAR(64), -- Hash dos filtros aplicados
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    hit_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance do cache
CREATE UNIQUE INDEX idx_dashboard_cache_user_key 
    ON dashboard_cache(user_id, cache_key, filters_hash);

CREATE INDEX idx_dashboard_cache_expires 
    ON dashboard_cache(expires_at);

CREATE INDEX idx_dashboard_cache_type 
    ON dashboard_cache(cache_type);

CREATE INDEX idx_dashboard_cache_user_type 
    ON dashboard_cache(user_id, cache_type);

-- RLS para cache
ALTER TABLE dashboard_cache ENABLE ROW LEVEL SECURITY;

-- Política para usuários acessarem apenas seu próprio cache
CREATE POLICY "Users can access their own cache" ON dashboard_cache
    FOR ALL USING (auth.uid() = user_id);

-- Função para limpeza automática do cache expirado
CREATE OR REPLACE FUNCTION cleanup_expired_dashboard_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM dashboard_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log da limpeza
    INSERT INTO audit_dashboard (action, details, created_at)
    VALUES ('cache_cleanup', jsonb_build_object('deleted_count', deleted_count), NOW());
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para invalidar cache por usuário
CREATE OR REPLACE FUNCTION invalidate_user_dashboard_cache(p_user_id UUID, p_cache_type VARCHAR DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    IF p_cache_type IS NULL THEN
        DELETE FROM dashboard_cache WHERE user_id = p_user_id;
    ELSE
        DELETE FROM dashboard_cache WHERE user_id = p_user_id AND cache_type = p_cache_type;
    END IF;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para estatísticas do cache
CREATE OR REPLACE FUNCTION get_dashboard_cache_stats()
RETURNS TABLE(
    cache_type VARCHAR,
    total_entries BIGINT,
    total_hits BIGINT,
    avg_hit_count NUMERIC,
    expired_entries BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dc.cache_type,
        COUNT(*) as total_entries,
        SUM(dc.hit_count) as total_hits,
        ROUND(AVG(dc.hit_count), 2) as avg_hit_count,
        COUNT(*) FILTER (WHERE dc.expires_at < NOW()) as expired_entries
    FROM dashboard_cache dc
    GROUP BY dc.cache_type
    ORDER BY total_entries DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários
COMMENT ON TABLE dashboard_cache IS 'Cache de dados do dashboard para melhorar performance';
COMMENT ON COLUMN dashboard_cache.filters_hash IS 'Hash MD5 dos filtros aplicados para cache específico';
COMMENT ON COLUMN dashboard_cache.hit_count IS 'Número de vezes que este cache foi utilizado';
```

### 2.4 Migração 010: Preferências do Usuário

```sql
-- 010_dashboard_user_preferences.sql

-- Criar tabela de preferências do usuário para o dashboard
CREATE TABLE dashboard_user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    preference_key VARCHAR(100) NOT NULL,
    preference_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, preference_key)
);

-- Índices
CREATE INDEX idx_dashboard_preferences_user 
    ON dashboard_user_preferences(user_id);

CREATE INDEX idx_dashboard_preferences_key 
    ON dashboard_user_preferences(preference_key);

-- RLS
ALTER TABLE dashboard_user_preferences ENABLE ROW LEVEL SECURITY;

-- Política para usuários gerenciarem suas próprias preferências
CREATE POLICY "Users can manage their own preferences" ON dashboard_user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Função para obter preferências com valores padrão
CREATE OR REPLACE FUNCTION get_user_dashboard_preference(
    p_user_id UUID, 
    p_key VARCHAR, 
    p_default JSONB DEFAULT 'null'
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT preference_value INTO result
    FROM dashboard_user_preferences
    WHERE user_id = p_user_id AND preference_key = p_key;
    
    RETURN COALESCE(result, p_default);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para definir preferências
CREATE OR REPLACE FUNCTION set_user_dashboard_preference(
    p_user_id UUID,
    p_key VARCHAR,
    p_value JSONB
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO dashboard_user_preferences (user_id, preference_key, preference_value)
    VALUES (p_user_id, p_key, p_value)
    ON CONFLICT (user_id, preference_key)
    DO UPDATE SET 
        preference_value = EXCLUDED.preference_value,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserir preferências padrão comuns
INSERT INTO dashboard_user_preferences (user_id, preference_key, preference_value)
SELECT 
    u.id,
    'default_filters',
    jsonb_build_object(
        'dateRange', jsonb_build_object(
            'start', (CURRENT_DATE - INTERVAL '30 days')::text,
            'end', CURRENT_DATE::text
        ),
        'autoRefresh', true,
        'refreshInterval', 300
    )
FROM usuarios u
WHERE NOT EXISTS (
    SELECT 1 FROM dashboard_user_preferences p 
    WHERE p.user_id = u.id AND p.preference_key = 'default_filters'
);

-- Comentários
COMMENT ON TABLE dashboard_user_preferences IS 'Preferências personalizadas do usuário para o dashboard';
COMMENT ON COLUMN dashboard_user_preferences.preference_key IS 'Chave da preferência (ex: default_filters, layout_config)';
COMMENT ON COLUMN dashboard_user_preferences.preference_value IS 'Valor da preferência em formato JSON';
```

### 2.5 Migração 011: Auditoria do Dashboard

```sql
-- 011_dashboard_audit.sql

-- Criar tabela de auditoria específica para o dashboard
CREATE TABLE audit_dashboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consultas de auditoria
CREATE INDEX idx_audit_dashboard_user_action 
    ON audit_dashboard(user_id, action);

CREATE INDEX idx_audit_dashboard_created_at 
    ON audit_dashboard(created_at DESC);

CREATE INDEX idx_audit_dashboard_resource 
    ON audit_dashboard(resource, resource_id);

CREATE INDEX idx_audit_dashboard_action 
    ON audit_dashboard(action);

-- RLS para auditoria
ALTER TABLE audit_dashboard ENABLE ROW LEVEL SECURITY;

-- Política para administradores visualizarem logs de auditoria
CREATE POLICY "Admins can view audit logs" ON audit_dashboard
    FOR SELECT USING (
        auth.uid() IN (
            SELECT u.id FROM usuarios u 
            JOIN perfis p ON u.perfil_id = p.id 
            WHERE 'VIEW_AUDIT_LOGS' = ANY(p.permissoes)
        )
    );

-- Política para usuários visualizarem seus próprios logs
CREATE POLICY "Users can view their own audit logs" ON audit_dashboard
    FOR SELECT USING (auth.uid() = user_id);

-- Função para registrar ações do dashboard
CREATE OR REPLACE FUNCTION log_dashboard_action(
    p_user_id UUID,
    p_action VARCHAR,
    p_resource VARCHAR DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO audit_dashboard (
        user_id, action, resource, resource_id, details, ip_address, user_agent
    )
    VALUES (
        p_user_id, p_action, p_resource, p_resource_id, p_details, p_ip_address, p_user_agent
    )
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para relatório de uso do dashboard
CREATE OR REPLACE FUNCTION get_dashboard_usage_report(
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
    action VARCHAR,
    total_count BIGINT,
    unique_users BIGINT,
    avg_per_day NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.action,
        COUNT(*) as total_count,
        COUNT(DISTINCT a.user_id) as unique_users,
        ROUND(COUNT(*) / GREATEST(EXTRACT(days FROM (p_end_date - p_start_date)), 1), 2) as avg_per_day
    FROM audit_dashboard a
    WHERE a.created_at::date BETWEEN p_start_date AND p_end_date
    GROUP BY a.action
    ORDER BY total_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários
COMMENT ON TABLE audit_dashboard IS 'Log de auditoria específico para ações do dashboard';
COMMENT ON COLUMN audit_dashboard.action IS 'Ação realizada (ex: view_dashboard, apply_filter, export_data)';
COMMENT ON COLUMN audit_dashboard.resource IS 'Recurso acessado (ex: kpi, matrix, chart)';
COMMENT ON COLUMN audit_dashboard.details IS 'Detalhes adicionais da ação em formato JSON';
```

## 3. Funções SQL Específicas do Dashboard

### 3.1 Função Principal para KPIs

```sql
-- Função para calcular todos os KPIs de um usuário
CREATE OR REPLACE FUNCTION get_user_dashboard_kpis(
    p_user_id UUID,
    p_filters JSONB DEFAULT '{}'
)
RETURNS TABLE(
    kpi_id UUID,
    nome VARCHAR,
    valor NUMERIC,
    valor_anterior NUMERIC,
    tendencia VARCHAR,
    formato VARCHAR,
    cor VARCHAR,
    icone VARCHAR,
    descricao TEXT,
    ultima_atualizacao TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    kpi_record RECORD;
    query_result NUMERIC;
    previous_result NUMERIC;
    user_areas TEXT[];
    user_profile VARCHAR;
BEGIN
    -- Obter informações do usuário
    SELECT u.areas_acesso, p.nome INTO user_areas, user_profile
    FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id = p_user_id;
    
    -- Iterar sobre KPIs disponíveis para o usuário
    FOR kpi_record IN 
        SELECT k.* FROM dashboard_kpis k
        WHERE k.ativo = true
          AND (user_profile = 'Administrador' OR user_profile = ANY(k.perfis_acesso))
          AND (k.areas_acesso = '{}' OR user_areas && k.areas_acesso)
        ORDER BY k.ordem
    LOOP
        -- Executar query do KPI com filtros
        BEGIN
            EXECUTE replace_query_filters(kpi_record.query_sql, p_user_id, p_filters, user_areas)
            INTO query_result;
        EXCEPTION WHEN OTHERS THEN
            query_result := 0;
        END;
        
        -- Calcular valor anterior (mesmo período anterior)
        BEGIN
            EXECUTE replace_query_filters(
                kpi_record.query_sql, 
                p_user_id, 
                get_previous_period_filters(p_filters), 
                user_areas
            ) INTO previous_result;
        EXCEPTION WHEN OTHERS THEN
            previous_result := NULL;
        END;
        
        -- Retornar resultado
        RETURN QUERY SELECT
            kpi_record.id,
            kpi_record.nome,
            COALESCE(query_result, 0),
            previous_result,
            CASE 
                WHEN previous_result IS NULL THEN 'stable'
                WHEN query_result > previous_result THEN 'up'
                WHEN query_result < previous_result THEN 'down'
                ELSE 'stable'
            END,
            kpi_record.formato,
            kpi_record.cor,
            kpi_record.icone,
            kpi_record.descricao,
            NOW();
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.2 Função para Matriz de Riscos

```sql
-- Função otimizada para dados da matriz de riscos
CREATE OR REPLACE FUNCTION get_user_risk_matrix(
    p_user_id UUID,
    p_filters JSONB DEFAULT '{}'
)
RETURNS TABLE(
    probabilidade INTEGER,
    impacto INTEGER,
    count_riscos INTEGER,
    severidade VARCHAR,
    riscos JSONB
) AS $$
DECLARE
    user_areas TEXT[];
    user_profile VARCHAR;
    date_start DATE;
    date_end DATE;
    filter_areas TEXT[];
    filter_responsaveis TEXT[];
    filter_tipos TEXT[];
    filter_status TEXT[];
BEGIN
    -- Obter informações do usuário
    SELECT u.areas_acesso, p.nome INTO user_areas, user_profile
    FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id = p_user_id;
    
    -- Extrair filtros
    date_start := COALESCE((p_filters->>'dateStart')::DATE, CURRENT_DATE - INTERVAL '1 year');
    date_end := COALESCE((p_filters->>'dateEnd')::DATE, CURRENT_DATE);
    filter_areas := COALESCE(array(SELECT jsonb_array_elements_text(p_filters->'areas')), '{}');
    filter_responsaveis := COALESCE(array(SELECT jsonb_array_elements_text(p_filters->'responsaveis')), '{}');
    filter_tipos := COALESCE(array(SELECT jsonb_array_elements_text(p_filters->'tipos')), '{}');
    filter_status := COALESCE(array(SELECT jsonb_array_elements_text(p_filters->'status')), '{"ativo"}');
    
    RETURN QUERY
    SELECT 
        r.probabilidade,
        r.impacto,
        COUNT(*)::INTEGER as count_riscos,
        CASE 
            WHEN r.probabilidade * r.impacto <= 4 THEN 'low'
            WHEN r.probabilidade * r.impacto <= 9 THEN 'medium'
            WHEN r.probabilidade * r.impacto <= 16 THEN 'high'
            ELSE 'critical'
        END as severidade,
        jsonb_agg(
            jsonb_build_object(
                'id', r.id,
                'titulo', r.titulo,
                'area', r.area_responsavel,
                'responsavel', r.responsavel,
                'status', r.status,
                'dataIdentificacao', r.data_identificacao,
                'prazoTratamento', r.prazo_tratamento,
                'score', r.probabilidade * r.impacto
            ) ORDER BY r.probabilidade * r.impacto DESC
        ) as riscos
    FROM riscos r
    WHERE r.dashboard_visible = true
      AND r.data_identificacao BETWEEN date_start AND date_end
      AND r.status = ANY(filter_status)
      AND (
          user_profile = 'Administrador' OR 
          r.area_responsavel = ANY(user_areas)
      )
      AND (
          filter_areas = '{}' OR 
          r.area_responsavel = ANY(filter_areas)
      )
      AND (
          filter_responsaveis = '{}' OR 
          r.responsavel = ANY(filter_responsaveis)
      )
      AND (
          filter_tipos = '{}' OR 
          r.tipo = ANY(filter_tipos)
      )
    GROUP BY r.probabilidade, r.impacto
    ORDER BY r.probabilidade DESC, r.impacto ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.3 Funções Auxiliares

```sql
-- Função para substituir filtros na query
CREATE OR REPLACE FUNCTION replace_query_filters(
    p_query TEXT,
    p_user_id UUID,
    p_filters JSONB,
    p_user_areas TEXT[]
)
RETURNS TEXT AS $$
DECLARE
    result_query TEXT;
    date_start TEXT;
    date_end TEXT;
BEGIN
    result_query := p_query;
    
    -- Substituir placeholders de data
    date_start := COALESCE(p_filters->>'dateStart', (CURRENT_DATE - INTERVAL '30 days')::TEXT);
    date_end := COALESCE(p_filters->>'dateEnd', CURRENT_DATE::TEXT);
    
    result_query := replace(result_query, '{{DATE_START}}', quote_literal(date_start));
    result_query := replace(result_query, '{{DATE_END}}', quote_literal(date_end));
    result_query := replace(result_query, '{{USER_ID}}', quote_literal(p_user_id));
    
    -- Adicionar filtro de área se não for administrador
    IF p_user_areas IS NOT NULL AND array_length(p_user_areas, 1) > 0 THEN
        result_query := replace(
            result_query, 
            'WHERE ', 
            'WHERE area_responsavel = ANY(' || quote_literal(p_user_areas) || ') AND '
        );
    END IF;
    
    RETURN result_query;
END;
$$ LANGUAGE plpgsql;

-- Função para obter filtros do período anterior
CREATE OR REPLACE FUNCTION get_previous_period_filters(p_filters JSONB)
RETURNS JSONB AS $$
DECLARE
    date_start DATE;
    date_end DATE;
    period_days INTEGER;
    result_filters JSONB;
BEGIN
    date_start := (p_filters->>'dateStart')::DATE;
    date_end := (p_filters->>'dateEnd')::DATE;
    
    IF date_start IS NULL OR date_end IS NULL THEN
        RETURN p_filters;
    END IF;
    
    period_days := date_end - date_start;
    
    result_filters := p_filters;
    result_filters := jsonb_set(result_filters, '{dateStart}', to_jsonb((date_start - period_days - 1)::TEXT));
    result_filters := jsonb_set(result_filters, '{dateEnd}', to_jsonb((date_start - 1)::TEXT));
    
    RETURN result_filters;
END;
$$ LANGUAGE plpgsql;
```

## 4. Políticas RLS Específicas

### 4.1 Políticas para Tabela Riscos (Extensão)

```sql
-- Política específica para dashboard - visualização otimizada
CREATE POLICY "Dashboard risk visibility" ON riscos
    FOR SELECT USING (
        dashboard_visible = true AND (
            -- Administradores veem todos os riscos
            auth.uid() IN (
                SELECT u.id FROM usuarios u 
                JOIN perfis p ON u.perfil_id = p.id 
                WHERE p.nome = 'Administrador'
            )
            OR
            -- Usuários veem riscos de suas áreas
            auth.uid() IN (
                SELECT u.id FROM usuarios u 
                WHERE area_responsavel = ANY(u.areas_acesso)
            )
            OR
            -- Responsáveis veem seus próprios riscos
            responsavel = (
                SELECT u.nome FROM usuarios u WHERE u.id = auth.uid()
            )
        )
    );
```

### 4.2 Políticas para Cache

```sql
-- Política para limpeza automática de cache
CREATE POLICY "System can cleanup expired cache" ON dashboard_cache
    FOR DELETE USING (expires_at < NOW());

-- Política para administradores gerenciarem cache
CREATE POLICY "Admins can manage all cache" ON dashboard_cache
    FOR ALL USING (
        auth.uid() IN (
            SELECT u.id FROM usuarios u 
            JOIN perfis p ON u.perfil_id = p.id 
            WHERE 'MANAGE_SYSTEM' = ANY(p.permissoes)
        )
    );
```

## 5. Índices de Performance

### 5.1 Índices Compostos para Consultas Complexas

```sql
-- Índice para consultas de KPI por área e período
CREATE INDEX idx_riscos_kpi_area_periodo 
    ON riscos(area_responsavel, data_identificacao, status) 
    WHERE dashboard_visible = true;

-- Índice para matriz de riscos com filtros
CREATE INDEX idx_riscos_matrix_completo 
    ON riscos(probabilidade, impacto, area_responsavel, status, data_identificacao) 
    WHERE dashboard_visible = true;

-- Índice para consultas de tendência temporal
CREATE INDEX idx_riscos_tendencia_temporal 
    ON riscos(data_identificacao, area_responsavel, status) 
    WHERE dashboard_visible = true;

-- Índice para busca por responsável
CREATE INDEX idx_riscos_responsavel_dashboard 
    ON riscos(responsavel, status) 
    WHERE dashboard_visible = true;
```

### 5.2 Índices para Tabelas de Sistema

```sql
-- Índices para auditoria
CREATE INDEX idx_audit_dashboard_user_date 
    ON audit_dashboard(user_id, created_at DESC);

CREATE INDEX idx_audit_dashboard_action_date 
    ON audit_dashboard(action, created_at DESC);

-- Índices para preferências
CREATE INDEX idx_preferences_user_updated 
    ON dashboard_user_preferences(user_id, updated_at DESC);
```

## 6. Triggers e Automações

### 6.1 Trigger para Invalidação de Cache

```sql
-- Trigger para invalidar cache quando riscos são modificados
CREATE OR REPLACE FUNCTION invalidate_dashboard_cache_on_risk_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Invalidar cache de KPIs e matriz para usuários da área afetada
    DELETE FROM dashboard_cache 
    WHERE cache_type IN ('kpi', 'matrix') 
      AND user_id IN (
          SELECT u.id FROM usuarios u 
          WHERE NEW.area_responsavel = ANY(u.areas_acesso)
      );
    
    -- Log da invalidação
    INSERT INTO audit_dashboard (action, resource, resource_id, details)
    VALUES (
        'cache_invalidated', 
        'risk', 
        NEW.id, 
        jsonb_build_object('area', NEW.area_responsavel, 'trigger', 'risk_update')
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
CREATE TRIGGER trigger_invalidate_cache_on_risk_update
    AFTER UPDATE ON riscos
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE FUNCTION invalidate_dashboard_cache_on_risk_change();

CREATE TRIGGER trigger_invalidate_cache_on_risk_insert
    AFTER INSERT ON riscos
    FOR EACH ROW
    EXECUTE FUNCTION invalidate_dashboard_cache_on_risk_change();
```

### 6.2 Trigger para Auditoria Automática

```sql
-- Trigger para log automático de mudanças em KPIs
CREATE OR REPLACE FUNCTION audit_kpi_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_dashboard (user_id, action, resource, resource_id, details)
        VALUES (auth.uid(), 'kpi_created', 'dashboard_kpi', NEW.id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_dashboard (user_id, action, resource, resource_id, details)
        VALUES (auth.uid(), 'kpi_updated', 'dashboard_kpi', NEW.id, 
                jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_dashboard (user_id, action, resource, resource_id, details)
        VALUES (auth.uid(), 'kpi_deleted', 'dashboard_kpi', OLD.id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de auditoria
CREATE TRIGGER trigger_audit_kpi_changes
    AFTER INSERT OR UPDATE OR DELETE ON dashboard_kpis
    FOR EACH ROW
    EXECUTE FUNCTION audit_kpi_changes();
```

## 7. Manutenção e Monitoramento

### 7.1 Jobs de Limpeza Automática

```sql
-- Função para job de limpeza diária
CREATE OR REPLACE FUNCTION daily_dashboard_maintenance()
RETURNS VOID AS $$
DECLARE
    cache_cleaned INTEGER;
    old_audits INTEGER;
BEGIN
    -- Limpar cache expirado
    SELECT cleanup_expired_dashboard_cache() INTO cache_cleaned;
    
    -- Limpar logs de auditoria antigos (> 90 dias)
    DELETE FROM audit_dashboard 
    WHERE created_at < NOW() - INTERVAL '90 days';
    GET DIAGNOSTICS old_audits = ROW_COUNT;
    
    -- Atualizar estatísticas das tabelas
    ANALYZE dashboard_cache;
    ANALYZE dashboard_kpis;
    ANALYZE audit_dashboard;
    
    -- Log da manutenção
    INSERT INTO audit_dashboard (action, details)
    VALUES ('daily_maintenance', jsonb_build_object(
        'cache_cleaned', cache_cleaned,
        'old_audits_removed', old_audits,
        'timestamp', NOW()
    ));
END;
$$ LANGUAGE plpgsql;
```

### 7.2 Funções de Monitoramento

```sql
-- Função para verificar saúde do dashboard
CREATE OR REPLACE FUNCTION check_dashboard_health()
RETURNS TABLE(
    metric VARCHAR,
    value NUMERIC,
    status VARCHAR,
    details TEXT
) AS $$
BEGIN
    -- Cache hit rate
    RETURN QUERY
    SELECT 
        'cache_hit_rate'::VARCHAR,
        ROUND(AVG(hit_count), 2),
        CASE WHEN AVG(hit_count) > 5 THEN 'good' ELSE 'warning' END::VARCHAR,
        'Average cache hits per entry'::TEXT
    FROM dashboard_cache;
    
    -- Expired cache percentage
    RETURN QUERY
    SELECT 
        'expired_cache_pct'::VARCHAR,
        ROUND(COUNT(*) FILTER (WHERE expires_at < NOW()) * 100.0 / NULLIF(COUNT(*), 0), 2),
        CASE WHEN COUNT(*) FILTER (WHERE expires_at < NOW()) * 100.0 / NULLIF(COUNT(*), 0) < 10 
             THEN 'good' ELSE 'warning' END::VARCHAR,
        'Percentage of expired cache entries'::TEXT
    FROM dashboard_cache;
    
    -- Active KPIs count
    RETURN QUERY
    SELECT 
        'active_kpis'::VARCHAR,
        COUNT(*)::NUMERIC,
        CASE WHEN COUNT(*) > 0 THEN 'good' ELSE 'error' END::VARCHAR,
        'Number of active KPIs'::TEXT
    FROM dashboard_kpis WHERE ativo = true;
    
    -- Dashboard usage (last 24h)
    RETURN QUERY
    SELECT 
        'daily_usage'::VARCHAR,
        COUNT(DISTINCT user_id)::NUMERIC,
        CASE WHEN COUNT(DISTINCT user_id) > 0 THEN 'good' ELSE 'warning' END::VARCHAR,
        'Unique users in last 24h'::TEXT
    FROM audit_dashboard 
    WHERE created_at > NOW() - INTERVAL '24 hours'
      AND action = 'view_dashboard';
END;
$$ LANGUAGE plpgsql;
```

## 8. Scripts de Inicialização

### 8.1 Script para Popular Dados de Teste

```sql
-- Script para popular dados de teste do dashboard
DO $$
DECLARE
    admin_user_id UUID;
    test_user_id UUID;
BEGIN
    -- Obter IDs de usuários para teste
    SELECT id INTO admin_user_id FROM usuarios WHERE email = 'admin@cogerh.com.br';
    SELECT id INTO test_user_id FROM usuarios WHERE email LIKE '%@cogerh.com.br' AND id != admin_user_id LIMIT 1;
    
    -- Inserir preferências de teste
    IF admin_user_id IS NOT NULL THEN
        PERFORM set_user_dashboard_preference(
            admin_user_id,
            'layout_config',
            jsonb_build_object(
                'kpiLayout', 'grid',
                'matrixSize', 'large',
                'showCharts', true,
                'autoRefresh', true
            )
        );
    END IF;
    
    -- Inserir cache de exemplo (será substituído por dados reais)
    IF test_user_id IS NOT NULL THEN
        INSERT INTO dashboard_cache (user_id, cache_key, cache_type, data, expires_at)
        VALUES (
            test_user_id,
            'test_kpis',
            'kpi',
            jsonb_build_array(
                jsonb_build_object(
                    'id', gen_random_uuid(),
                    'nome', 'Total Riscos (Teste)',
                    'valor', 15,
                    'formato', 'number',
                    'cor', 'blue'
                )
            ),
            NOW() + INTERVAL '5 minutes'
        );
    END IF;
    
    -- Log da inicialização
    INSERT INTO audit_dashboard (action, details)
    VALUES ('test_data_initialized', jsonb_build_object(
        'admin_user', admin_user_id,
        'test_user', test_user_id,
        'timestamp', NOW()
    ));
END;
$$;
```

### 8.2 Script de Verificação Pós-Deploy

```sql
-- Script para verificar se todas as estruturas foram criadas corretamente
DO $$
DECLARE
    missing_tables TEXT[] := '{}';
    missing_functions TEXT[] := '{}';
    missing_indexes TEXT[] := '{}';
BEGIN
    -- Verificar tabelas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dashboard_kpis') THEN
        missing_tables := array_append(missing_tables, 'dashboard_kpis');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dashboard_cache') THEN
        missing_tables := array_append(missing_tables, 'dashboard_cache');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dashboard_user_preferences') THEN
        missing_tables := array_append(missing_tables, 'dashboard_user_preferences');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_dashboard') THEN
        missing_tables := array_append(missing_tables, 'audit_dashboard');
    END IF;
    
    -- Verificar funções
    IF NOT EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_user_dashboard_kpis') THEN
        missing_functions := array_append(missing_functions, 'get_user_dashboard_kpis');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_user_risk_matrix') THEN
        missing_functions := array_append(missing_functions, 'get_user_risk_matrix');
    END IF;
    
    -- Verificar índices principais
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_riscos_dashboard_visible') THEN
        missing_indexes := array_append(missing_indexes, 'idx_riscos_dashboard_visible');
    END IF;
    
    -- Reportar resultados
    IF array_length(missing_tables, 1) > 0 OR array_length(missing_functions, 1) > 0 OR array_length(missing_indexes, 1) > 0 THEN
        RAISE EXCEPTION 'Deploy verification failed. Missing: Tables=%, Functions=%, Indexes=%', 
            missing_tables, missing_functions, missing_indexes;
    ELSE
        INSERT INTO audit_dashboard (action, details)
        VALUES ('deploy_verification_success', jsonb_build_object(
            'timestamp', NOW(),
            'status', 'All dashboard structures created successfully'
        ));
    END IF;
END;
$$;
```

Esta especificação de banco de dados fornece uma base sólida e escalável para o Dashboard Executivo Dinâmico, com foco em performance, segurança e auditoria completa.