-- Script para corrigir o segmento dos clientes ARN ADVOGADOS
-- Data: $(date)

-- 1. Atualizar os clientes para usar o segmento correto (ESCRITÓRIO JURÍDICO - AR&N)
UPDATE partners 
SET segment_id = '791b380a-89dd-44e6-8982-bc204b47a024'
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

-- 2. Deletar o segmento duplicado que foi criado
DELETE FROM segments WHERE id = '4cf080c3-fc46-4c92-8261-26adc4905d95';

-- 3. Verificar se os clientes foram atualizados corretamente
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

-- 4. Verificar se o segmento duplicado foi removido
SELECT COUNT(*) as segmentos_arn FROM segments WHERE name ILIKE '%arn%';
