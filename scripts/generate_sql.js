import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Current directory:', __dirname);
console.log('Implementation file path:', path.join(__dirname, '..', '.trae', 'Implementacao_tabela_023.md'));

// Read the implementation file
const filePath = path.join(__dirname, '..', '.trae', 'Implementacao_tabela_023.md');
const content = fs.readFileSync(filePath, 'utf8');

// Extract JSON array - look for the start and end of the JSON array
const jsonStart = content.indexOf('[');
const jsonEnd = content.lastIndexOf(']') + 1;

if (jsonStart === -1 || jsonEnd === 0) {
    console.error('JSON data not found');
    process.exit(1);
}

const jsonString = content.substring(jsonStart, jsonEnd);
console.log('JSON string length:', jsonString.length);
console.log('JSON start:', jsonString.substring(0, 100));

try {
    var jsonData = JSON.parse(jsonString);
} catch (error) {
    console.error('JSON parsing error:', error.message);
    process.exit(1);
}
console.log(`Total records found: ${jsonData.length}`);

// Generate SQL script
let sql = `-- SQL Insert Script for 023_hist_acao table
-- Generated on: ${new Date().toISOString()}
-- Total records: ${jsonData.length}
-- Timezone: America/Fortaleza

SET TIME ZONE 'America/Fortaleza';

INSERT INTO public."023_hist_acao" (id, id_acao, justificativa_observacao, impacto_atraso_nao_implementacao, perc_implementacao, created_at, updated_at) VALUES
`;

// Generate individual records
jsonData.forEach((record, index) => {
    const id_acao = record.id;
    const justificativa = record.justificativa_observacao;
    const impacto = record.impacto_atraso_nao_implementacao;
    const perc = record.perc_implementacao;

    // Format values for SQL
    const justificativaSql = justificativa === null ? 'NULL' : `'${justificativa.replace(/'/g, "''")}'`;
    const impactoSql = impacto === null ? 'NULL' : `'${impacto.replace(/'/g, "''")}'`;
    const percSql = perc === null ? 'NULL' : perc;

    // Build INSERT line
    let line = `(gen_random_uuid(), '${id_acao}', ${justificativaSql}, ${impactoSql}, ${percSql}, NOW(), NOW())`;

    // Add comma if not last record
    if (index < jsonData.length - 1) {
        line += ",";
    }

    sql += line + '\n';
});

// Add semicolon at the end
sql = sql.trim() + ';';

// Write to file
const outputPath = path.join(__dirname, 'insercao_023_hist_acao_final.sql');
fs.writeFileSync(outputPath, sql, 'utf8');

console.log(`SQL script generated successfully at: ${outputPath}`);
console.log(`Total records: ${jsonData.length}`);

// Show statistics
const withJustificativa = jsonData.filter(r => r.justificativa_observacao !== null).length;
const withPerc0 = jsonData.filter(r => r.perc_implementacao === 0).length;
const withPerc1 = jsonData.filter(r => r.perc_implementacao === 1).length;
const withPercNull = jsonData.filter(r => r.perc_implementacao === null).length;

console.log('\nData Statistics:');
console.log(`- Records with justificativa: ${withJustificativa}`);
console.log(`- Records with perc_implementacao = 0: ${withPerc0}`);
console.log(`- Records with perc_implementacao = 1: ${withPerc1}`);
console.log(`- Records with perc_implementacao = NULL: ${withPercNull}`);