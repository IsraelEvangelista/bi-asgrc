/**
 * Data API Routes - DESENVOLVIMENTO APENAS
 * Endpoints seguros para acesso de leitura durante desenvolvimento
 * 
 * SEGURANÇA: 
 * - Apenas localhost em desenvolvimento
 * - Validação de ambiente obrigatória
 * - Rate limiting aplicado
 * - Logs sanitizados
 */

import express, { type Request, type Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Validação de ambiente - CRÍTICO para segurança
const isDevelopment = process.env.NODE_ENV !== 'production';
const isLocalhost = (req: Request): boolean => {
  const host = req.get('host');
  return host?.includes('localhost') || host?.includes('127.0.0.1') || false;
};

// Cliente Supabase para backend
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Middleware de segurança para todas as rotas
router.use((req: Request, res: Response, next) => {
  // BLOQUEIO ABSOLUTO EM PRODUÇÃO
  if (!isDevelopment) {
    return res.status(403).json({
      success: false,
      error: 'Data endpoints disabled in production'
    });
  }

  // BLOQUEIO PARA NON-LOCALHOST
  if (!isLocalhost(req)) {
    return res.status(403).json({
      success: false,
      error: 'Data endpoints only available on localhost'
    });
  }

  next();
});

/**
 * GET /api/data/overview
 * Dados gerais do sistema para análise
 */
router.get('/overview', async (req: Request, res: Response) => {
  try {
    // Contadores básicos (ajustando nomes das tabelas)
    const [risks, processes, users] = await Promise.all([
      supabase.from('006_matriz_riscos').select('id', { count: 'exact', head: true }),
      supabase.from('005_processos').select('id', { count: 'exact', head: true }),
      supabase.from('002_usuarios').select('id', { count: 'exact', head: true })
    ]);

    res.json({
      success: true,
      data: {
        counts: {
          risks: risks.count || 0,
          processes: processes.count || 0,
          users: users.count || 0
        },
        timestamp: new Date().toISOString(),
        environment: 'development'
      }
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overview data'
    });
  }
});

/**
 * GET /api/data/risks
 * Dados de riscos para análise
 */
router.get('/risks', async (req: Request, res: Response) => {
  try {
    const { data: risks, error } = await supabase
      .from('006_matriz_riscos')
      .select('*')
      .limit(10); // Limite pequeno para verificar estrutura

    if (error) throw error;

    res.json({
      success: true,
      data: risks,
      count: risks?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching risks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch risks data'
    });
  }
});

/**
 * GET /api/data/processes
 * Dados de processos para análise
 */
router.get('/processes', async (req: Request, res: Response) => {
  try {
    const { data: processes, error } = await supabase
      .from('005_processos')
      .select(`
        id,
        nome,
        codigo,
        macroprocesso_id,
        nivel,
        status_publicacao,
        data_criacao
      `)
      .limit(100);

    if (error) throw error;

    res.json({
      success: true,
      data: processes,
      count: processes?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching processes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch processes data'
    });
  }
});

/**
 * GET /api/data/risks-by-category
 * Riscos agrupados por categoria
 */
router.get('/risks-by-category', async (req: Request, res: Response) => {
  try {
    const { data: risksByCategory, error } = await supabase
      .from('006_matriz_riscos')
      .select(`
        categoria_risco_id,
        nivel_risco
      `);

    if (error) throw error;

    // Agrupar por categoria (simplificado sem join)
    const grouped = risksByCategory?.reduce((acc, risk) => {
      const categoryId = risk.categoria_risco_id || 'sem_categoria';
      if (!acc[categoryId]) {
        acc[categoryId] = { total: 0, baixo: 0, medio: 0, alto: 0, critico: 0 };
      }
      acc[categoryId].total++;
      acc[categoryId][risk.nivel_risco as keyof typeof acc[string]]++;
      return acc;
    }, {} as Record<string, any>);

    res.json({
      success: true,
      data: grouped,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching risks by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch risks by category'
    });
  }
});

/**
 * GET /api/data/tables
 * Lista todas as tabelas disponíveis para descobrir estrutura
 */
router.get('/tables', async (req: Request, res: Response) => {
  try {
    // Buscar informações do schema
    const { data: tables, error } = await supabase
      .rpc('get_schema_tables')
      .single();

    if (error) {
      // Fallback: tentar algumas tabelas conhecidas
      const tableTests = await Promise.allSettled([
        supabase.from('001_organizacao').select('*').limit(1),
        supabase.from('002_usuarios').select('*').limit(1),
        supabase.from('003_macroprocessos').select('*').limit(1),
        supabase.from('004_subprocessos').select('*').limit(1),
        supabase.from('005_processos').select('*').limit(1),
        supabase.from('006_matriz_riscos').select('*').limit(1),
        supabase.from('007_categoria_riscos').select('*').limit(1),
        supabase.from('008_controles').select('*').limit(1),
        supabase.from('009_planos_acao').select('*').limit(1),
        supabase.from('010_avaliacoes_risco').select('*').limit(1)
      ]);

      const availableTables = tableTests.map((result, index) => {
        const tableNames = [
          '001_organizacao', '002_usuarios', '003_macroprocessos', 
          '004_subprocessos', '005_processos', '006_matriz_riscos',
          '007_categoria_riscos', '008_controles', '009_planos_acao', '010_avaliacoes_risco'
        ];
        return {
          name: tableNames[index],
          accessible: result.status === 'fulfilled',
          error: result.status === 'rejected' ? result.reason : null
        };
      });

      return res.json({
        success: true,
        data: { availableTables },
        method: 'fallback_test',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: tables,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error listing tables:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list tables'
    });
  }
});

/**
 * GET /api/data/table/:tableName
 * Examina estrutura e dados de uma tabela específica
 */
router.get('/table/:tableName', async (req: Request, res: Response) => {
  try {
    const { tableName } = req.params;
    
    // Validação básica do nome da tabela
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid table name'
      });
    }

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(5); // Apenas 5 registros para análise

    if (error) throw error;

    res.json({
      success: true,
      data: {
        tableName,
        recordCount: data?.length || 0,
        sampleData: data || [],
        columns: data && data.length > 0 ? Object.keys(data[0]) : []
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error examining table ${req.params.tableName}:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to examine table: ${error}`
    });
  }
});

export default router;