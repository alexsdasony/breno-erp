-- Script para importação dos clientes do ARN ADVOGADOS
-- Data: $(date)
-- Total de clientes: 12

-- Inserir clientes do ARN ADVOGADOS na tabela partners
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
-- 1. WM DA MATA (Menina Vaidosa)
(
    'WM DA MATA (Menina Vaidosa)',
    'pj',
    '41.299.690/0001-09',
    NULL,
    NULL,
    'Rua 2 de Agosto, 93 - Flores',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 2. SD LOGÍSTICA E TRANSPORTE MULTIMODAL EIRELI
(
    'SD LOGÍSTICA E TRANSPORTE MULTIMODAL EIRELI',
    'pj',
    '06.820.212/0001-00',
    NULL,
    NULL,
    'Rua 24 de Maio, 220 - Ed. Rio Negro Center, 9º andar, sala 902 - Centro',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 3. MANOEL CUNHA DA MOTA
(
    'MANOEL CUNHA DA MOTA',
    'pf',
    '404.700.082-53',
    NULL,
    NULL,
    'Rua Marquês do Maranhão, 72 - Flores',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 4. ELIZANGELA SOARES ARAÚJO
(
    'ELIZANGELA SOARES ARAÚJO',
    'pf',
    '315.284.492-15',
    NULL,
    NULL,
    'Av. São Jorge, 02 - São Jorge',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 5. PINK COSMÉTICOS LTDA
(
    'PINK COSMÉTICOS LTDA',
    'pj',
    '37.799.017/0001-60',
    NULL,
    NULL,
    'Rua Joaquim Sarmento, nº 251, Centro',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 6. DILCILENE ESTHER COSTA AUZIER
(
    'DILCILENE ESTHER COSTA AUZIER',
    'pf',
    '730.858.202-72',
    NULL,
    NULL,
    'Rua Professora Diva Ponce, 420 - Japiim',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 7. MIRIAN PRUDÊNCIO DA SILVA
(
    'MIRIAN PRUDÊNCIO DA SILVA',
    'pf',
    '316.916.922-04',
    NULL,
    NULL,
    'Rua Carbonita, 40 - Conjunto Shangrilá - Parque 10 de Novembro',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 8. NATASHA MARINHO DE OLIVEIRA
(
    'NATASHA MARINHO DE OLIVEIRA',
    'pf',
    '041.943.682-07',
    NULL,
    NULL,
    'Rua Cachoeira da Prata, 786 - Tancredo Neves',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 9. ELAINE CRISTINA GUEDES WANDERLEY
(
    'ELAINE CRISTINA GUEDES WANDERLEY',
    'pf',
    '718.566.225-49',
    NULL,
    NULL,
    'Rua Arquiteto Renato Braga, 300 - CASA - AO LADO DA LOJA DA MAÇONARIA - Parque 10 de Novembro',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 10. GABRIEL ENOC DE SOUZA SIQUEIRA
(
    'GABRIEL ENOC DE SOUZA SIQUEIRA',
    'pf',
    '016.388.222-39',
    NULL,
    NULL,
    'Rua Virgílio de Barros, 216 - CASA - Petrópolis',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 11. WILLIAM YOSHIAKI AOKI
(
    'WILLIAM YOSHIAKI AOKI',
    'pf',
    '012.137.082-81',
    NULL,
    NULL,
    'Avenida Torquato Tapajós - Cond. residencial Tapajós, 6437 - casa 145 - Tarumã',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 12. PEDRO JÚNIOR DA SILVA GARCIA
(
    'PEDRO JÚNIOR DA SILVA GARCIA',
    'pf',
    '009.641.302-62',
    NULL,
    NULL,
    'Avenida Igarapé de Manaus, 02 - QD 2LA, BL14 - Centro',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
);

-- Adicionar roles de customer para todos os clientes
INSERT INTO partner_roles (partner_id, role)
SELECT 
    p.id,
    'customer'
FROM partners p
WHERE p.name IN (
    'WM DA MATA (Menina Vaidosa)',
    'SD LOGÍSTICA E TRANSPORTE MULTIMODAL EIRELI',
    'MANOEL CUNHA DA MOTA',
    'ELIZANGELA SOARES ARAÚJO',
    'PINK COSMÉTICOS LTDA',
    'DILCILENE ESTHER COSTA AUZIER',
    'MIRIAN PRUDÊNCIO DA SILVA',
    'NATASHA MARINHO DE OLIVEIRA',
    'ELAINE CRISTINA GUEDES WANDERLEY',
    'GABRIEL ENOC DE SOUZA SIQUEIRA',
    'WILLIAM YOSHIAKI AOKI',
    'PEDRO JÚNIOR DA SILVA GARCIA'
)
AND NOT EXISTS (
    SELECT 1 FROM partner_roles pr 
    WHERE pr.partner_id = p.id AND pr.role = 'customer'
);

-- Atualizar segment_id para ARN ADVOGADOS
UPDATE partners 
SET segment_id = '4cf080c3-fc46-4c92-8261-26adc4905d95'
WHERE name IN (
    'WM DA MATA (Menina Vaidosa)',
    'SD LOGÍSTICA E TRANSPORTE MULTIMODAL EIRELI',
    'MANOEL CUNHA DA MOTA',
    'ELIZANGELA SOARES ARAÚJO',
    'PINK COSMÉTICOS LTDA',
    'DILCILENE ESTHER COSTA AUZIER',
    'MIRIAN PRUDÊNCIO DA SILVA',
    'NATASHA MARINHO DE OLIVEIRA',
    'ELAINE CRISTINA GUEDES WANDERLEY',
    'GABRIEL ENOC DE SOUZA SIQUEIRA',
    'WILLIAM YOSHIAKI AOKI',
    'PEDRO JÚNIOR DA SILVA GARCIA'
);

-- Verificar quantos clientes foram inseridos
SELECT COUNT(*) as total_clientes_inseridos FROM partners WHERE created_at >= NOW() - INTERVAL '1 minute';

-- Listar os clientes inseridos
SELECT 
    p.name,
    p.tipo_pessoa,
    p.tax_id,
    s.name as segmento,
    pr.role
FROM partners p
LEFT JOIN segments s ON p.segment_id = s.id
LEFT JOIN partner_roles pr ON p.id = pr.partner_id
WHERE p.name IN (
    'WM DA MATA (Menina Vaidosa)',
    'SD LOGÍSTICA E TRANSPORTE MULTIMODAL EIRELI',
    'MANOEL CUNHA DA MOTA',
    'ELIZANGELA SOARES ARAÚJO',
    'PINK COSMÉTICOS LTDA',
    'DILCILENE ESTHER COSTA AUZIER',
    'MIRIAN PRUDÊNCIO DA SILVA',
    'NATASHA MARINHO DE OLIVEIRA',
    'ELAINE CRISTINA GUEDES WANDERLEY',
    'GABRIEL ENOC DE SOUZA SIQUEIRA',
    'WILLIAM YOSHIAKI AOKI',
    'PEDRO JÚNIOR DA SILVA GARCIA'
)
ORDER BY p.name;
