# Documentação Técnica - Refatoração Tabela Indicadores

## Visão Geral

Este documento descreve a refatoração da tabela `008_indicadores` em um modelo de data warehouse, separando dados estáticos (dimensão) de dados históricos (fato).

## Estrutura Antiga vs Nova

### Estrutura Antiga (Tabela Única)
- **Tabela**: `008_indicadores`
- **Problema**: Dados estáticos e históricos misturados
- **Performance**: Degradação com crescimento do volume
- **Manutenção**: Complexidade em consultas históricas

### Estrutura Nova (Data Warehouse)
- **Tabela Dimensão**: `008_indicadores` (dados estáticos)
- **Tabela Fato**: `019_historico_indicadores` (dados históricos)
- **Relacionamento**: 1:N (1 indicador → N históricos)
- **Vantagens**: Melhor performance, organização, escalabilidade

## Esquema de Tabelas

### Tabela 008_indicadores (Dimensão)
```sql
CREATE TABLE 008_indicadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_risco TEXT NOT NULL,
    responsavel_risco TEXT NOT NULL,
    indicador_risco TEXT NOT NULL,
    situacao_indicador TEXT NOT NULL,
    meta_efetiva NUMERIC,
    tolerancia TEXT NOT NULL,
    limite_tolerancia TEXT,
    tipo_acompanhamento TEXT,
    apuracao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabela 019_historico_indicadores (Fato)
```sql
CREATE TABLE 019_historico_indicadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_indicador UUID REFERENCES 008_indicadores(id) ON DELETE CASCADE,
    justificativa_observacao TEXT,
    impacto_n_implementacao TEXT,
    resultado_mes NUMERIC,
    data_apuracao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Impacto no Frontend

### Interfaces TypeScript Atualizadas

#### Indicator (Dimensão)
```typescript
export interface Indicator {
  id: string;
  id_risco: string;
  responsavel_risco: string;
  indicador_risco: string;
  situacao_indicador: SituacaoIndicador;
  meta_efetiva?: number;
  tolerancia: Tolerancia;
  limite_tolerancia?: string;
  tipo_acompanhamento?: string;
  apuracao?: string;
  created_at: string;
  updated_at: string;
}
```

#### IndicatorHistory (Fato)
```typescript
export interface IndicatorHistory {
  id: string;
  id_indicador: string;
  justificativa_observacao?: string;
  impacto_n_implementacao?: string;
  resultado_mes?: number;
  data_apuracao: string;
  created_at: string;
  updated_at: string;
}
```

#### IndicatorWithHistory (Join)
```typescript
export interface IndicatorWithHistory extends Indicator {
  historico_id?: string;
  justificativa_observacao?: string;
  impacto_n_implementacao?: string;
  resultado_mes?: number;
  data_apuracao?: string;
  historico_created_at?: string;
  historico_updated_at?: string;
}
```

## Atualizações em Componentes

### Componentes Modificados
1. **Dashboard.tsx** - Atualizado para usar `IndicatorWithHistory`
2. **IndicatorDetails.tsx** - Refatorado para separar dimensão e fato
3. **IndicatorForm.tsx** - Adaptado para nova interface
4. **Indicators.tsx** - Atualizado para nova estrutura
5. **Actions.tsx** - Atualizado para compatibilidade
6. **AlertBanner.tsx** - Atualizado para nova estrutura
7. **useReports.ts** - Atualizado queries com joins
8. **useAlerts.ts** - Atualizado para nova estrutura

### Mudanças Principais
- `meta_desc` → `meta_efetiva`
- Separação clara entre dados estáticos e históricos
- Uso de joins entre tabelas 008 e 019
- Melhor tipagem e organização de código

## Queries de Exemplo

### Consulta de Indicadores com Histórico
```sql
SELECT
    i.*,
    h.resultado_mes,
    h.data_apuracao,
    h.justificativa_observacao
FROM 008_indicadores i
LEFT JOIN 019_historico_indicadores h ON i.id = h.id_indicador
WHERE i.situacao_indicador = 'Implementado'
ORDER BY h.data_apuracao DESC;
```

### Consulta de Histórico por Indicador
```sql
SELECT
    resultado_mes,
    data_apuracao,
    justificativa_observacao
FROM 019_historico_indicadores
WHERE id_indicador = :indicator_id
ORDER BY data_apuracao DESC;
```

## Performance e Otimização

### Índices Criados
```sql
-- Índices na tabela dimensão
CREATE INDEX idx_008_indicadores_situacao ON 008_indicadores(situacao_indicador);
CREATE INDEX idx_008_indicadores_responsavel ON 008_indicadores(responsavel_risco);

-- Índices na tabela fato
CREATE INDEX idx_019_historico_indicadores_id_indicador ON 019_historico_indicadores(id_indicador);
CREATE INDEX idx_019_historico_indicadores_data_apuracao ON 019_historico_indicadores(data_apuracao);
```

### Vantagens de Performance
- Consultas históricas mais rápidas
- Menor volume de dados na tabela dimensão
- Melhor utilização de índices
- Otimização de cache

## Procedimentos de Migração

### Backup
```sql
CREATE TABLE backup_008_indicadores AS SELECT * FROM 008_indicadores;
```

### Migração de Dados
1. Criar nova estrutura
2. Migrar dados estáticos para 008
3. Migrar dados históricos para 019
4. Validar integridade
5. Remover tabela antiga

### Rollback
```sql
-- Em caso de problemas
DROP TABLE 008_indicadores;
DROP TABLE 019_historico_indicadores;
ALTER TABLE backup_008_indicadores RENAME TO 008_indicadores;
```

## Considerações para Desenvolvimento

### Novas Regras de Negócio
- Dados estáticos só devem ser alterados via migração controlada
- Históricos são imutáveis (insert-only)
- Consultas devem usar joins apropriados
- Sempre verificar relacionamentos entre tabelas

### Boas Práticas
1. Usar `IndicatorWithHistory` para views que precisam de ambos os dados
2. Usar `Indicator` para operações只在 dimensão
3. Usar `IndicatorHistory` para operações只在 fato
4. Manter consistência nos nomes de propriedades
5. Validar foreign keys antes de inserir

## Monitoramento e Manutenção

### Métricas para Monitorar
- Performance de queries entre tabelas
- Crescimento da tabela de histórico
- Integridade de dados entre tabelas
- Uso de índices

### Manutenção Programada
- Limpeza de dados históricos antigos
- Reorganização de índices
- Atualização de estatísticas
- Backup periódico

## Conclusão

A refatoração para modelo de data warehouse trouxe significativas melhorias:

✅ **Performance**: Consultas mais rápidas e eficientes
✅ **Organização**: Separação clara entre dados estáticos e históricos
✅ **Escalabilidade**: Melhor preparado para crescimento de volume
✅ **Manutenção**: Código mais organizado e fácil de manter
✅ **Qualidade**: Melhor tipagem e validação de dados

A migração foi concluída com sucesso e o sistema está operando com a nova estrutura.