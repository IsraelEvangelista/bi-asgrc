1. Este projeto consiste em elaborar um BI para a Assessoria de Risco e Compliance da COGERH, com foco na gestão de riscos.
2. O BI já existe no Power BI, mas iremos construí-lo em linha de código, utilizando stack React.js, TypeScript, Tailwind e Vite.js.
3. O link para o PBI atual é: https://app.powerbi.com/view?r=eyJrIjoiMzFkZjY0ODgtZjFjNS00MDg2LWIwNmEtZDQ5MDU2MDQzOWM0IiwidCI6ImUxNzM2MDhhLTNmMjktNGEzZS1iMGIzLTAyZjliYzYzODUyOSJ9
4. Será criado uma base de dados junto ao supabase com base nas informações que temos disponíveis na base atual, planilhas Excel.
5. Existem formulários de entrada dos indicadores de risco das gerências estratégicas da empresa, porém atualmente eles são escritos em planilhas Excel. Vamos automatizar e virtualizar a inserção por sistema destes indicadores de risco.
6. Alguns atributos só existem junto ao PBI (métricas e colunas DAX). Teremos que replicar estas informações com cuidado à base de dados deste projeto.