-- Script para importação dos clientes da base NAURU
-- Data: $(date)
-- Total de clientes: 7

-- Inserir clientes da base NAURU na tabela partners
INSERT INTO partners (
    name,
    tipo_pessoa,
    tax_id,
    email,
    phone,
    address,
    city,
    state,
    status,
    created_at,
    updated_at
) VALUES 
-- 1. ROSEANE POINHO DE OLIVEIRA
(
    'ROSEANE POINHO DE OLIVEIRA',
    'pf',
    '188.070.382-34',
    NULL,
    NULL,
    'Rua Almir Pedreiras, nº 818 - Petrópolis',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 2. IMM FABRICAÇÃO DE GELO E COMÉRCIO DE PRODUTOS ALIMENTÍCIOS LTDA
(
    'IMM FABRICAÇÃO DE GELO E COMÉRCIO DE PRODUTOS ALIMENTÍCIOS LTDA',
    'pj',
    '84.512.078/0001-85',
    NULL,
    NULL,
    'AV. Presidente Vargas, nº 600, Centro',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 3. PEDRO ELIAS DE SOUZA
(
    'PEDRO ELIAS DE SOUZA',
    'pf',
    '249.711.032-87',
    NULL,
    NULL,
    'Cond. Salvador Dali, nº 60, Torre B - Adrianópolis',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 4. MEGAMED DISTRIBUIDORA DE PRODUTOS HOSPITALARES LTDA
(
    'MEGAMED DISTRIBUIDORA DE PRODUTOS HOSPITALARES LTDA',
    'pj',
    '55.317.744/0001-26',
    NULL,
    NULL,
    'Rua Dona Mimi, nº 141, sala 01, Morro da liberdade',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 5. WINSTON NEY DE SEIXAS SANTOS
(
    'WINSTON NEY DE SEIXAS SANTOS',
    'pf',
    '181.485.142-91',
    NULL,
    NULL,
    'Conjunto Tambaú, nº 1725 - Cidade Nova I',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 6. JUDÁ BEN HUR ROCHA SAMPAIO
(
    'JUDÁ BEN HUR ROCHA SAMPAIO',
    'pf',
    '971.749.552-15',
    NULL,
    NULL,
    NULL,
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 7. ISRAEL S DE CARVALHO (CARVALHO ENGENHARIA)
(
    'ISRAEL S DE CARVALHO (CARVALHO ENGENHARIA)',
    'pj',
    '13.882.103-0001-74',
    NULL,
    NULL,
    'Rua Juan Arduino, nº 4, QD 10, Coroado',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
);

-- Verificar quantos clientes foram inseridos
SELECT COUNT(*) as total_clientes_inseridos FROM partners WHERE created_at >= NOW() - INTERVAL '1 minute';

-- Listar os clientes inseridos
SELECT 
    name,
    tipo_pessoa,
    tax_id as documento,
    city,
    state,
    status
FROM partners 
WHERE created_at >= NOW() - INTERVAL '1 minute'
ORDER BY name;
