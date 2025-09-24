# Guia do Desenvolvedor - Nova Estrutura de Indicadores

## Introdução

Este guia explica como trabalhar com a nova estrutura de tabelas de indicadores após a refatoração para modelo de data warehouse.

## Estrutura de Dados

### Tabelas
- **008_indicadores**: Dados estáticos (dimensão)
- **019_historico_indicadores**: Dados históricos (fato)

### Relacionamento
```
008_indicadores (1) → (N) 019_historico_indicadores
```

## Interfaces TypeScript

### Quando usar cada interface

#### `Indicator` (src/types/indicator.ts)
**Use para**: Operações na tabela dimensão (008)
- Formulários de cadastro/edição de indicadores
- Listagens básicas de indicadores
- Operações que não precisam de dados históricos

```typescript
import { Indicator } from '../types/indicator';

const indicador: Indicator = {
  id: 'uuid',
  id_risco: 'RISK-001',
  responsavel_risco: 'João Silva',
  indicador_risco: 'Taxa de Satisfação',
  situacao_indicador: SituacaoIndicador.IMPLEMENTADO,
  meta_efetiva: 85,
  tolerancia: Tolerancia.DENTRO_TOLERANCIA,
  // ... outros campos da dimensão
};
```

#### `IndicatorHistory` (src/types/indicator.ts)
**Use para**: Operações na tabela fato (019)
- Registros históricos de medições
- Análises temporais
- Gráficos de evolução

```typescript
import { IndicatorHistory } from '../types/indicator';

const historico: IndicatorHistory = {
  id: 'uuid',
  id_indicador: 'indicator-uuid',
  resultado_mes: 78.5,
  data_apuracao: '2024-12-01T00:00:00Z',
  justificativa_observacao: 'Medição mensal padrão',
  // ... outros campos do histórico
};
```

#### `IndicatorWithHistory` (src/types/indicator.ts)
**Use para**: Views que precisam de ambos os dados
- Dashboard principal
- Páginas de detalhes
- Relatórios completos

```typescript
import { IndicatorWithHistory } from '../types/indicator';

const indicadorCompleto: IndicatorWithHistory = {
  // Campos da dimensão
  id: 'uuid',
  id_risco: 'RISK-001',
  indicador_risco: 'Taxa de Satisfação',
  meta_efetiva: 85,
  // ... outros campos da dimensão

  // Campos do histórico
  historico_id: 'historico-uuid',
  resultado_mes: 78.5,
  data_apuracao: '2024-12-01T00:00:00Z',
  // ... outros campos do histórico
};
```

## Padrões de Código

### Consultas ao Banco de Dados

#### Buscar Indicadores Básicos
```typescript
// Apenas dados da dimensão
const { data } = await supabase
  .from('008_indicadores')
  .select('*')
  .eq('situacao_indicador', 'Implementado');
```

#### Buscar Indicadores com Histórico Recente
```typescript
// Join com último histórico
const { data } = await supabase
  .from('008_indicadores')
  .select(`
    *,
    historico_indicadores(
      resultado_mes,
      data_apuracao,
      justificativa_observacao
    )
  `)
  .eq('situacao_indicador', 'Implementado');
```

#### Buscar Histórico Completo de um Indicador
```typescript
const { data } = await supabase
  .from('019_historico_indicadores')
  .select('*')
  .eq('id_indicador', indicatorId)
  .order('data_apuracao', { ascending: false });
```

### Operações CRUD

#### Criar Novo Indicador (Dimensão)
```typescript
const createIndicator = async (indicatorData: Omit<Indicator, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('008_indicadores')
    .insert([indicatorData])
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

#### Adicionar Registro Histórico (Fato)
```typescript
const addHistoryRecord = async (historyData: Omit<IndicatorHistory, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('019_historico_indicadores')
    .insert([historyData])
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

#### Atualizar Indicador (Apenas Dimensão)
```typescript
const updateIndicator = async (id: string, updates: Partial<Indicator>) => {
  const { data, error } = await supabase
    .from('008_indicadores')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

## Componentes React

### Padrões para Componentes

#### Componentes de Listagem
```typescript
import { useState, useEffect } from 'react';
import { Indicator } from '../types/indicator';

const IndicatorList = () => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);

  useEffect(() => {
    const fetchIndicators = async () => {
      const { data } = await supabase
        .from('008_indicadores')
        .select('*')
        .order('indicador_risco');

      setIndicators(data || []);
    };

    fetchIndicators();
  }, []);

  return (
    <div>
      {indicators.map(indicator => (
        <div key={indicator.id}>
          <h3>{indicator.indicador_risco}</h3>
          <p>{indicator.responsavel_risco}</p>
        </div>
      ))}
    </div>
  );
};
```

#### Componentes de Detalhes
```typescript
import { useState, useEffect } from 'react';
import { IndicatorWithHistory, IndicatorHistory } from '../types/indicator';

const IndicatorDetails = ({ id }: { id: string }) => {
  const [indicator, setIndicator] = useState<IndicatorWithHistory | null>(null);
  const [history, setHistory] = useState<IndicatorHistory[]>([]);

  useEffect(() => {
    const fetchIndicator = async () => {
      // Buscar dados do indicador
      const { data: indicatorData } = await supabase
        .from('008_indicadores')
        .select('*')
        .eq('id', id)
        .single();

      // Buscar histórico completo
      const { data: historyData } = await supabase
        .from('019_historico_indicadores')
        .select('*')
        .eq('id_indicador', id)
        .order('data_apuracao', { ascending: false });

      setIndicator(indicatorData);
      setHistory(historyData || []);
    };

    fetchIndicator();
  }, [id]);

  return (
    <div>
      {indicator && (
        <>
          <h2>{indicator.indicador_risco}</h2>
          <p>Responsável: {indicator.responsavel_risco}</p>
          <p>Meta: {indicator.meta_efetiva}</p>

          <h3>Histórico</h3>
          {history.map(record => (
            <div key={record.id}>
              <p>Data: {record.data_apuracao}</p>
              <p>Resultado: {record.resultado_mes}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
};
```

## Formulários

### Formulário de Indicador
```typescript
import { useForm } from 'react-hook-form';
import { Indicator } from '../types/indicator';

interface IndicatorFormProps {
  indicator?: Indicator;
  onSubmit: (data: Omit<Indicator, 'id' | 'created_at' | 'updated_at'>) => void;
}

const IndicatorForm = ({ indicator, onSubmit }: IndicatorFormProps) => {
  const { register, handleSubmit } = useForm({
    defaultValues: indicator ? {
      id_risco: indicator.id_risco,
      responsavel_risco: indicator.responsavel_risco,
      indicador_risco: indicator.indicador_risco,
      situacao_indicador: indicator.situacao_indicador,
      meta_efetiva: indicator.meta_efetiva,
      tolerancia: indicator.tolerancia,
      limite_tolerancia: indicator.limite_tolerancia,
      tipo_acompanhamento: indicator.tipo_acompanhamento,
      apuracao: indicator.apuracao,
    } : {}
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('id_risco')} placeholder="ID do Risco" required />
      <input {...register('responsavel_risco')} placeholder="Responsável" required />
      <input {...register('indicador_risco')} placeholder="Indicador" required />
      <input {...register('meta_efetiva', { valueAsNumber: true })} type="number" placeholder="Meta" />
      <select {...register('tolerancia')} required>
        <option value="Dentro da Tolerância">Dentro da Tolerância</option>
        <option value="Fora da Tolerância">Fora da Tolerância</option>
      </select>
      <button type="submit">Salvar</button>
    </form>
  );
};
```

## Boas Práticas

### 1. Sempre usar as interfaces corretas
- Use `Indicator` para operações na dimensão
- Use `IndicatorHistory` para operações no fato
- Use `IndicatorWithHistory` para views combinadas

### 2. Validar relacionamentos
```typescript
const validateIndicatorExists = async (id: string) => {
  const { data, error } = await supabase
    .from('008_indicadores')
    .select('id')
    .eq('id', id)
    .single();

  return !error && data;
};
```

### 3. Usar transações para operações complexas
```typescript
const createIndicatorWithHistory = async (
  indicatorData: Omit<Indicator, 'id' | 'created_at' | 'updated_at'>,
  historyData: Omit<IndicatorHistory, 'id' | 'id_indicador' | 'created_at' | 'updated_at'>
) => {
  // Iniciar transação
  const { data: indicator, error: indicatorError } = await supabase
    .from('008_indicadores')
    .insert([indicatorData])
    .select()
    .single();

  if (indicatorError) throw indicatorError;

  // Adicionar registro histórico
  const { data: history, error: historyError } = await supabase
    .from('019_historico_indicadores')
    .insert([{ ...historyData, id_indicador: indicator.id }])
    .select()
    .single();

  if (historyError) throw historyError;

  return { indicator, history };
};
```

### 4. Tratar erros adequadamente
```typescript
try {
  const result = await someOperation();
  return result;
} catch (error) {
  console.error('Erro na operação:', error);
  // Tratar erro específico
  if (error.code === '23503') {
    throw new Error('Violação de chave estrangeira');
  }
  throw error;
}
```

## Debugging

### Problemas Comuns

#### 1. Erro de chave estrangeira
```typescript
// Verificar se o indicador existe antes de inserir histórico
const indicatorExists = await validateIndicatorExists(indicatorId);
if (!indicatorExists) {
  throw new Error('Indicador não encontrado');
}
```

#### 2. Campos nulos em joins
```typescript
// Tratar campos nulos em resultados de join
const indicatorsWithHistory = data.map(item => ({
  ...item,
  resultado_mes: item.resultado_mes || null,
  data_apuracao: item.data_apuracao || null
}));
```

#### 3. Performance em consultas
```typescript
// Usar índices e limites para melhorar performance
const { data } = await supabase
  .from('008_indicadores')
  .select(`
    *,
    historico_indicadores(
      resultado_mes,
      data_apuracao
    )
  `)
  .eq('situacao_indicador', 'Implementado')
  .limit(100);
```

## Testes

### Testes de Integração
```typescript
describe('Indicator Operations', () => {
  it('should create indicator and history', async () => {
    const indicator = await createIndicator(testIndicatorData);
    const history = await addHistoryRecord({
      id_indicador: indicator.id,
      resultado_mes: 85,
      data_apuracao: new Date().toISOString()
    });

    expect(history.id_indicador).toBe(indicator.id);
  });

  it('should fetch indicator with history', async () => {
    const { data } = await supabase
      .from('008_indicadores')
      .select(`
        *,
        historico_indicadores(*)
      `)
      .eq('id', testIndicatorId);

    expect(data[0].historico_indicadores).toHaveLength(1);
  });
});
```

## Conclusão

Seguindo este guia, você conseguirá:

✅ Trabalhar eficientemente com a nova estrutura
✅ Escrever código mais organizado e tipado
✅ Evitar erros comuns de relacionamento
✅ Melhorar performance das consultas
✅ Manter consistência em todo o códigobase

Lembre-se sempre de:
- Usar as interfaces corretas para cada operação
- Validar relacionamentos entre tabelas
- Tratar erros adequadamente
- Seguir os padrões estabelecidos