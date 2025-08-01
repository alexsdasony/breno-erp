import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente do arquivo .env.local na raiz do projeto
dotenv.config({ path: path.join(__dirname, '../../../.env.local') });

const router = express.Router();
import { SECURITY_CONFIG } from '../config/constants.js';

const JWT_SECRET = SECURITY_CONFIG.JWT_SECRET;

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Buscar usuário no Supabase
    const { data: users, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('status', 'ativo')
      .limit(1);

    if (queryError) {
      console.error('Erro ao buscar usuário:', queryError);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    if (!users || users.length === 0) {
      return res.status(401).json({
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = users[0];

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Senha incorreta',
        code: 'INVALID_PASSWORD'
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        segment_id: user.segment_id
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Retornar dados do usuário (sem senha)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      token,
      user: userWithoutPassword,
      message: 'Login realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Registro
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, segmentId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Nome, email e senha são obrigatórios',
        code: 'MISSING_FIELDS'
      });
    }

    // Verificar se usuário já existe
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (checkError) {
      console.error('Erro ao verificar usuário existente:', checkError);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    if (existingUsers && existingUsers.length > 0) {
      return res.status(409).json({
        error: 'Usuário com este email já existe',
        code: 'USER_ALREADY_EXISTS'
      });
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password: hashedPassword,
        role: 'user',
        status: 'ativo',
        segment_id: segmentId || null
      })
      .select()
      .single();

    if (createError) {
      console.error('Erro ao criar usuário:', createError);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        segment_id: newUser.segment_id
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Retornar dados do usuário (sem senha)
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      token,
      user: userWithoutPassword,
      message: 'Usuário criado com sucesso'
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Perfil do usuário
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, segment_id, status, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar perfil:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Atualizar perfil
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: 'Nome e email são obrigatórios',
        code: 'MISSING_FIELDS'
      });
    }

    // Verificar se email já existe (exceto para o usuário atual)
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('id', userId)
      .limit(1);

    if (checkError) {
      console.error('Erro ao verificar email:', checkError);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    if (existingUsers && existingUsers.length > 0) {
      return res.status(409).json({
        error: 'Email já está em uso',
        code: 'EMAIL_ALREADY_EXISTS'
      });
    }

    // Atualizar usuário
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        name,
        email,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, name, email, role, segment_id, status, created_at, updated_at')
      .single();

    if (updateError) {
      console.error('Erro ao atualizar perfil:', updateError);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    res.json({
      success: true,
      user: updatedUser,
      message: 'Perfil atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Alterar senha
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Senha atual e nova senha são obrigatórias',
        code: 'MISSING_FIELDS'
      });
    }

    // Buscar usuário com senha
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('password')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Erro ao buscar usuário:', fetchError);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    // Verificar senha atual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Senha atual incorreta',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Criptografar nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Atualizar senha
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: hashedNewPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Erro ao atualizar senha:', updateError);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Logout (apenas para registro, o frontend deve limpar o token)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
});

export default router; 