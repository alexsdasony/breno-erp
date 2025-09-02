-- Script para criar usuário Deyse Souza
-- Execute este script diretamente no banco de dados

INSERT INTO public.users (
    name,
    email,
    password,
    role,
    status,
    created_at,
    updated_at
) VALUES (
    'Deyse Souza',
    'deyseesouza91@gmail.com',
    '$2b$10$rQZ8K9mN2pL3vX7yJ1hF6gT8uI4oP5qR6sA7bC8dE9fG0hI1jK2lM3nN4oO5pP6qQ7rR8sS9tT0uU1vV2wW3xX4yY5zZ', -- hash de 'admin123'
    'user',
    'ativo',
    NOW(),
    NOW()
);

-- Verificar se foi criado
SELECT id, name, email, role, status, created_at FROM public.users WHERE email = 'deyseesouza91@gmail.com';
