-- Script para importação dos clientes da RDS IMOBILIÁRIA
-- Data: $(date)
-- Total de clientes: 50+ (locadores e locatários)

-- Inserir clientes da RDS IMOBILIÁRIA na tabela partners
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
-- LOCADORES (Proprietários)
-- 1. RHEMA NEGÓCIOS IMOBILIÁRIOS LTDA
(
    'RHEMA NEGÓCIOS IMOBILIÁRIOS LTDA',
    'pj',
    '55.518.933/0001-67',
    NULL,
    NULL,
    'Rua Raul Brandão, nº17, Compensa',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 2. SPAZZIO GESTÃO E ADMINISTRAÇÃO LTDA
(
    'SPAZZIO GESTÃO E ADMINISTRAÇÃO LTDA',
    'pj',
    '40.170.291/0001-80',
    NULL,
    NULL,
    'Rua Ayres de Almeida, nº18, São Francisco',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 3. E.M RODRIGUES
(
    'E.M RODRIGUES',
    'pj',
    '44.005.614/0001-31',
    NULL,
    NULL,
    'Rua Manjerioba, nº1, Jorge Teixeira',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 4. RDS PLACE NEGÓCIOS IMOBILIÁRIOS E ADMINISTRADORES LTDA
(
    'RDS PLACE NEGÓCIOS IMOBILIÁRIOS E ADMINISTRADORES LTDA',
    'pj',
    '52.841.370/0001-55',
    NULL,
    NULL,
    'Rua Salvador, nº440, Ed. Soberane, sala 610, 6º andar, Adrianópolis',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 5. CHARLES ALBERTE DE ALMEIDA SANTOS ME (ÓTICA OFICINA DOS ÓCULOS)
(
    'CHARLES ALBERTE DE ALMEIDA SANTOS ME (ÓTICA OFICINA DOS ÓCULOS)',
    'pj',
    '84.126.598/0001-50',
    NULL,
    NULL,
    'Rua Rui Barbosa, nº122',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 6. CLÁUDIA TEIXEIRA BRASIL
(
    'CLÁUDIA TEIXEIRA BRASIL',
    'pf',
    '572.881.432-87',
    NULL,
    NULL,
    'Avenida Jacira Reis, nº 700, São Jorge',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 7. VERA LÚCIA FERREIRA QUEIROZ
(
    'VERA LÚCIA FERREIRA QUEIROZ',
    'pf',
    '043.488.852-49',
    NULL,
    NULL,
    'Av. Joaquim Nabuco, nº2157, Centro',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- LOCATÁRIOS (Inquilinos)
-- 8. JOSINEI NUNES DO NASCIMENTO
(
    'JOSINEI NUNES DO NASCIMENTO',
    'pf',
    '524.171.152-04',
    NULL,
    NULL,
    'Travessa Alvorada, nº151, Apt. 01',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 9. VITÓRIA EMANUELLY RIBEIRO LEMOS
(
    'VITÓRIA EMANUELLY RIBEIRO LEMOS',
    'pf',
    '061.660.022-46',
    NULL,
    NULL,
    'Travessa Alvorada, nº151, Apt. 02',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 10. ALBERTO TEIXEIRA DA SILVA JÚNIOR
(
    'ALBERTO TEIXEIRA DA SILVA JÚNIOR',
    'pf',
    '033.772.392-35',
    NULL,
    NULL,
    'Travessa Alvorada, nº151, Apt. 03',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 11. ANILTON MARQUES / LUZIETH FARIAS
(
    'ANILTON MARQUES / LUZIETH FARIAS',
    'pf',
    NULL,
    NULL,
    NULL,
    'Travessa Alvorada, nº151, Apt. 04',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 12. PATRICK JEHMERSON GOMES DE ALMEIDA
(
    'PATRICK JEHMERSON GOMES DE ALMEIDA',
    'pf',
    NULL,
    NULL,
    NULL,
    'Travessa Alvorada, nº151, Apt. 05',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 13. LINDAELZA RAMOS
(
    'LINDAELZA RAMOS',
    'pf',
    '836.948.702-53',
    NULL,
    NULL,
    'Travessa Alvorada, nº151, Apt. 06',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 14. JÉSSICA SILVA SANTOS
(
    'JÉSSICA SILVA SANTOS',
    'pf',
    '035.026.122-93',
    NULL,
    NULL,
    'Travessa Alvorada, nº151, Apt. 07',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 15. LEUDIMARA TAUANA MACIEL
(
    'LEUDIMARA TAUANA MACIEL',
    'pf',
    '038.454.522-00',
    NULL,
    NULL,
    'Travessa Alvorada, nº151, Apt. 08',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 16. FRANNY MARIANA GOMEZ CONDE
(
    'FRANNY MARIANA GOMEZ CONDE',
    'pf',
    '709.840.122-65',
    NULL,
    NULL,
    'Travessa Alvorada, nº151, Apt. 09',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 17. MARCOS ADRIANO GAMA
(
    'MARCOS ADRIANO GAMA',
    'pf',
    '040.603.712-16',
    NULL,
    NULL,
    'Travessa Alvorada, nº151, Apt. 11',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 18. ALEXANDRE DOS SANTOS CHAVEZ
(
    'ALEXANDRE DOS SANTOS CHAVEZ',
    'pf',
    '035.348.852-60',
    NULL,
    NULL,
    'Travessa Alvorada, nº151, Apt. 12',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 19. LAURA FABIAN DOS SANTOS COSTA
(
    'LAURA FABIAN DOS SANTOS COSTA',
    'pf',
    '054.841.212-05',
    NULL,
    NULL,
    'Travessa Alvorada, nº151, Apt. 4L',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 20. ALEJANDRO ENRIQUE GUILLEN
(
    'ALEJANDRO ENRIQUE GUILLEN',
    'pf',
    '110.580.732-89',
    NULL,
    NULL,
    'Travessa Alvorada, nº151, Apt. 6L',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 21. AIRIS MARIA DOS SANTOS
(
    'AIRIS MARIA DOS SANTOS',
    'pf',
    '042.094.562-84',
    NULL,
    NULL,
    'Travessa Alvorada, nº151, Apt. 7L',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 22. KEVEN LENO GONCALVES DE SOUZA
(
    'KEVEN LENO GONCALVES DE SOUZA',
    'pf',
    '010.767.672-90',
    NULL,
    NULL,
    'Travessa Alvorada, nº151, Ponto Comercial',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 23. KAILANE FERREIRA PINTO
(
    'KAILANE FERREIRA PINTO',
    'pf',
    '060.699.022-46',
    NULL,
    NULL,
    'Rua Doutor Gentil Bittencourt, nº272, Apt. 02',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 24. ISAAC CAMPOS DE LIMA
(
    'ISAAC CAMPOS DE LIMA',
    'pf',
    '703.845.362-98',
    NULL,
    NULL,
    'Rua Doutor Gentil Bittencourt, nº272, Apt. 03',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 25. JESSICA EMILY CAMPOS
(
    'JESSICA EMILY CAMPOS',
    'pf',
    '015.788.942-47',
    NULL,
    NULL,
    'Rua Doutor Gentil Bittencourt, nº272, Casa',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 26. FIDELIVROS DISTRIBUIDORA
(
    'FIDELIVROS DISTRIBUIDORA',
    'pj',
    '43.491.255/0001-07',
    NULL,
    NULL,
    'Rua Inglaterra, nº481, Loja B, Parque das Nações',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 27. MULTICULTURAL EVENTOS LTDA
(
    'MULTICULTURAL EVENTOS LTDA',
    'pj',
    '06.215.079/0001-54',
    NULL,
    NULL,
    'Rua Inglaterra, nº481, Galpão, Parque das Nações',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 28. JULIANE NUNES MONTEIRO
(
    'JULIANE NUNES MONTEIRO',
    'pf',
    '793.549.962-82',
    NULL,
    NULL,
    'Av. Brigadeiro Gurjão, nº210, Jorge Teixeira',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 29. NELSA DA SILVA RIBEIRO
(
    'NELSA DA SILVA RIBEIRO',
    'pj',
    '37.852.636/0001-71',
    NULL,
    NULL,
    'Av. Brigadeiro Gurjão, nº210, Jorge Teixeira',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 30. MARIA DO PERPETUO SOCORRO SOUZA PANTOJA
(
    'MARIA DO PERPETUO SOCORRO SOUZA PANTOJA',
    'pf',
    '005.136.432-81',
    NULL,
    NULL,
    'Av. Brigadeiro Gurjão, nº210, Jorge Teixeira',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 31. RICARDO CAMINHA MONTENEGRO
(
    'RICARDO CAMINHA MONTENEGRO',
    'pf',
    '853.803.852-49',
    NULL,
    NULL,
    'Av. Brigadeiro Gurjão, nº210, Jorge Teixeira',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 32. LEONARDO DA SILVA LEITÃO
(
    'LEONARDO DA SILVA LEITÃO',
    'pf',
    '046.787.162-03',
    NULL,
    NULL,
    'Av. Brigadeiro Gurjão, nº210, Ponto 1',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 33. LUCIENE DOS SANTOS OLIVEIRA CASTRO
(
    'LUCIENE DOS SANTOS OLIVEIRA CASTRO',
    'pf',
    '675.774.582-87',
    NULL,
    NULL,
    'Av. Brigadeiro Gurjão, nº210, Ponto 2',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 34. ALCIENE GENTIL DA SILVA
(
    'ALCIENE GENTIL DA SILVA',
    'pf',
    '656.565.982-68',
    NULL,
    NULL,
    'Av. Brigadeiro Gurjão, nº210, Ponto 3',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 35. AMAZONVIDA ATIVIDADES MÉDICAS E AMBULATORIAL LTDA
(
    'AMAZONVIDA ATIVIDADES MÉDICAS E AMBULATORIAL LTDA',
    'pj',
    '38.492.533/0001-00',
    NULL,
    NULL,
    'Rua Rui Barbosa, nº122, Altos, Centro',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 36. JH CONSTRUÇÃO LTDA
(
    'JH CONSTRUÇÃO LTDA',
    'pj',
    '06.046.143/0001-10',
    NULL,
    NULL,
    'Rua Ayres de Almeida, nº18, Sala 3, São Francisco',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 37. ATTACKMED COMÉRCIO DE MAT.
(
    'ATTACKMED COMÉRCIO DE MAT.',
    'pj',
    '27.986.353/0001-69',
    NULL,
    NULL,
    'Rua Ayres de Almeida, nº18, Sala 4, São Francisco',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 38. GESTCONT CONSULTORIA E GERENCIAL MENTO CONTÁBIL
(
    'GESTCONT CONSULTORIA E GERENCIAL MENTO CONTÁBIL',
    'pj',
    '48.999.863/0001-40',
    NULL,
    NULL,
    'Rua Ayres de Almeida, nº18, Sala 5, São Francisco',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 39. ZEUS CONSULTORIA EM GESTÃO EMPRESARIAL
(
    'ZEUS CONSULTORIA EM GESTÃO EMPRESARIAL',
    'pj',
    '20.711.259/0001-58',
    NULL,
    NULL,
    'Rua Ayres de Almeida, nº18, Sala 6, São Francisco',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 40. FABIANO LIMA DA SILVEIRA
(
    'FABIANO LIMA DA SILVEIRA',
    'pf',
    '934.003.492-91',
    NULL,
    NULL,
    'Rua Ayres de Almeida, nº18, Sala 7, São Francisco',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 41. EDUARDO CORRÊA DE SENA CAJADO
(
    'EDUARDO CORRÊA DE SENA CAJADO',
    'pf',
    '021.774.582-26',
    NULL,
    NULL,
    'Rua Ayres de Almeida, nº18, Sala 8, São Francisco',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 42. MARCIA REGINA PACHECO OLIVEIRA
(
    'MARCIA REGINA PACHECO OLIVEIRA',
    'pf',
    '642.787.602-30',
    NULL,
    NULL,
    'Rua Ayres de Almeida, nº18, Sala 11, São Francisco',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 43. MT DESPACHOS ADUANEIROS
(
    'MT DESPACHOS ADUANEIROS',
    'pj',
    '31.314.037/0001-18',
    NULL,
    NULL,
    'Rua Ayres de Almeida, nº18, Sala 12, São Francisco',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 44. EDIVILSON SOUZA NETO
(
    'EDIVILSON SOUZA NETO',
    'pf',
    '018.112.482-33',
    NULL,
    NULL,
    'Av. Leopoldo Peres, nº432, Educandos',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 45. CARLOS ALDEMAR ROMERO ALGUACA
(
    'CARLOS ALDEMAR ROMERO ALGUACA',
    'pf',
    '709.502.852-42',
    NULL,
    NULL,
    'Av. Leopoldo Peres, nº432, Educandos',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 46. RAIMUNDO NONATO PEIXOTO
(
    'RAIMUNDO NONATO PEIXOTO',
    'pf',
    '407.451.632-20',
    NULL,
    NULL,
    'Av. Leopoldo Peres, nº432, Educandos',
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
    'RHEMA NEGÓCIOS IMOBILIÁRIOS LTDA',
    'SPAZZIO GESTÃO E ADMINISTRAÇÃO LTDA',
    'E.M RODRIGUES',
    'RDS PLACE NEGÓCIOS IMOBILIÁRIOS E ADMINISTRADORES LTDA',
    'CHARLES ALBERTE DE ALMEIDA SANTOS ME (ÓTICA OFICINA DOS ÓCULOS)',
    'CLÁUDIA TEIXEIRA BRASIL',
    'VERA LÚCIA FERREIRA QUEIROZ',
    'JOSINEI NUNES DO NASCIMENTO',
    'VITÓRIA EMANUELLY RIBEIRO LEMOS',
    'ALBERTO TEIXEIRA DA SILVA JÚNIOR',
    'ANILTON MARQUES / LUZIETH FARIAS',
    'PATRICK JEHMERSON GOMES DE ALMEIDA',
    'LINDAELZA RAMOS',
    'JÉSSICA SILVA SANTOS',
    'LEUDIMARA TAUANA MACIEL',
    'FRANNY MARIANA GOMEZ CONDE',
    'MARCOS ADRIANO GAMA',
    'ALEXANDRE DOS SANTOS CHAVEZ',
    'LAURA FABIAN DOS SANTOS COSTA',
    'ALEJANDRO ENRIQUE GUILLEN',
    'AIRIS MARIA DOS SANTOS',
    'KEVEN LENO GONCALVES DE SOUZA',
    'KAILANE FERREIRA PINTO',
    'ISAAC CAMPOS DE LIMA',
    'JESSICA EMILY CAMPOS',
    'FIDELIVROS DISTRIBUIDORA',
    'MULTICULTURAL EVENTOS LTDA',
    'JULIANE NUNES MONTEIRO',
    'NELSA DA SILVA RIBEIRO',
    'MARIA DO PERPETUO SOCORRO SOUZA PANTOJA',
    'RICARDO CAMINHA MONTENEGRO',
    'LEONARDO DA SILVA LEITÃO',
    'LUCIENE DOS SANTOS OLIVEIRA CASTRO',
    'ALCIENE GENTIL DA SILVA',
    'AMAZONVIDA ATIVIDADES MÉDICAS E AMBULATORIAL LTDA',
    'JH CONSTRUÇÃO LTDA',
    'ATTACKMED COMÉRCIO DE MAT.',
    'GESTCONT CONSULTORIA E GERENCIAL MENTO CONTÁBIL',
    'ZEUS CONSULTORIA EM GESTÃO EMPRESARIAL',
    'FABIANO LIMA DA SILVEIRA',
    'EDUARDO CORRÊA DE SENA CAJADO',
    'MARCIA REGINA PACHECO OLIVEIRA',
    'MT DESPACHOS ADUANEIROS',
    'EDIVILSON SOUZA NETO',
    'CARLOS ALDEMAR ROMERO ALGUACA',
    'RAIMUNDO NONATO PEIXOTO'
)
AND NOT EXISTS (
    SELECT 1 FROM partner_roles pr 
    WHERE pr.partner_id = p.id AND pr.role = 'customer'
);

-- Atualizar segment_id para RDS IMOBILIÁRIO
UPDATE partners 
SET segment_id = 'f5c2e105-4c05-4bbd-947a-575cf8877936'
WHERE name IN (
    'RHEMA NEGÓCIOS IMOBILIÁRIOS LTDA',
    'SPAZZIO GESTÃO E ADMINISTRAÇÃO LTDA',
    'E.M RODRIGUES',
    'RDS PLACE NEGÓCIOS IMOBILIÁRIOS E ADMINISTRADORES LTDA',
    'CHARLES ALBERTE DE ALMEIDA SANTOS ME (ÓTICA OFICINA DOS ÓCULOS)',
    'CLÁUDIA TEIXEIRA BRASIL',
    'VERA LÚCIA FERREIRA QUEIROZ',
    'JOSINEI NUNES DO NASCIMENTO',
    'VITÓRIA EMANUELLY RIBEIRO LEMOS',
    'ALBERTO TEIXEIRA DA SILVA JÚNIOR',
    'ANILTON MARQUES / LUZIETH FARIAS',
    'PATRICK JEHMERSON GOMES DE ALMEIDA',
    'LINDAELZA RAMOS',
    'JÉSSICA SILVA SANTOS',
    'LEUDIMARA TAUANA MACIEL',
    'FRANNY MARIANA GOMEZ CONDE',
    'MARCOS ADRIANO GAMA',
    'ALEXANDRE DOS SANTOS CHAVEZ',
    'LAURA FABIAN DOS SANTOS COSTA',
    'ALEJANDRO ENRIQUE GUILLEN',
    'AIRIS MARIA DOS SANTOS',
    'KEVEN LENO GONCALVES DE SOUZA',
    'KAILANE FERREIRA PINTO',
    'ISAAC CAMPOS DE LIMA',
    'JESSICA EMILY CAMPOS',
    'FIDELIVROS DISTRIBUIDORA',
    'MULTICULTURAL EVENTOS LTDA',
    'JULIANE NUNES MONTEIRO',
    'NELSA DA SILVA RIBEIRO',
    'MARIA DO PERPETUO SOCORRO SOUZA PANTOJA',
    'RICARDO CAMINHA MONTENEGRO',
    'LEONARDO DA SILVA LEITÃO',
    'LUCIENE DOS SANTOS OLIVEIRA CASTRO',
    'ALCIENE GENTIL DA SILVA',
    'AMAZONVIDA ATIVIDADES MÉDICAS E AMBULATORIAL LTDA',
    'JH CONSTRUÇÃO LTDA',
    'ATTACKMED COMÉRCIO DE MAT.',
    'GESTCONT CONSULTORIA E GERENCIAL MENTO CONTÁBIL',
    'ZEUS CONSULTORIA EM GESTÃO EMPRESARIAL',
    'FABIANO LIMA DA SILVEIRA',
    'EDUARDO CORRÊA DE SENA CAJADO',
    'MARCIA REGINA PACHECO OLIVEIRA',
    'MT DESPACHOS ADUANEIROS',
    'EDIVILSON SOUZA NETO',
    'CARLOS ALDEMAR ROMERO ALGUACA',
    'RAIMUNDO NONATO PEIXOTO'
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
    'RHEMA NEGÓCIOS IMOBILIÁRIOS LTDA',
    'SPAZZIO GESTÃO E ADMINISTRAÇÃO LTDA',
    'E.M RODRIGUES',
    'RDS PLACE NEGÓCIOS IMOBILIÁRIOS E ADMINISTRADORES LTDA',
    'CHARLES ALBERTE DE ALMEIDA SANTOS ME (ÓTICA OFICINA DOS ÓCULOS)',
    'CLÁUDIA TEIXEIRA BRASIL',
    'VERA LÚCIA FERREIRA QUEIROZ',
    'JOSINEI NUNES DO NASCIMENTO',
    'VITÓRIA EMANUELLY RIBEIRO LEMOS',
    'ALBERTO TEIXEIRA DA SILVA JÚNIOR',
    'ANILTON MARQUES / LUZIETH FARIAS',
    'PATRICK JEHMERSON GOMES DE ALMEIDA',
    'LINDAELZA RAMOS',
    'JÉSSICA SILVA SANTOS',
    'LEUDIMARA TAUANA MACIEL',
    'FRANNY MARIANA GOMEZ CONDE',
    'MARCOS ADRIANO GAMA',
    'ALEXANDRE DOS SANTOS CHAVEZ',
    'LAURA FABIAN DOS SANTOS COSTA',
    'ALEJANDRO ENRIQUE GUILLEN',
    'AIRIS MARIA DOS SANTOS',
    'KEVEN LENO GONCALVES DE SOUZA',
    'KAILANE FERREIRA PINTO',
    'ISAAC CAMPOS DE LIMA',
    'JESSICA EMILY CAMPOS',
    'FIDELIVROS DISTRIBUIDORA',
    'MULTICULTURAL EVENTOS LTDA',
    'JULIANE NUNES MONTEIRO',
    'NELSA DA SILVA RIBEIRO',
    'MARIA DO PERPETUO SOCORRO SOUZA PANTOJA',
    'RICARDO CAMINHA MONTENEGRO',
    'LEONARDO DA SILVA LEITÃO',
    'LUCIENE DOS SANTOS OLIVEIRA CASTRO',
    'ALCIENE GENTIL DA SILVA',
    'AMAZONVIDA ATIVIDADES MÉDICAS E AMBULATORIAL LTDA',
    'JH CONSTRUÇÃO LTDA',
    'ATTACKMED COMÉRCIO DE MAT.',
    'GESTCONT CONSULTORIA E GERENCIAL MENTO CONTÁBIL',
    'ZEUS CONSULTORIA EM GESTÃO EMPRESARIAL',
    'FABIANO LIMA DA SILVEIRA',
    'EDUARDO CORRÊA DE SENA CAJADO',
    'MARCIA REGINA PACHECO OLIVEIRA',
    'MT DESPACHOS ADUANEIROS',
    'EDIVILSON SOUZA NETO',
    'CARLOS ALDEMAR ROMERO ALGUACA',
    'RAIMUNDO NONATO PEIXOTO'
)
ORDER BY p.name;
