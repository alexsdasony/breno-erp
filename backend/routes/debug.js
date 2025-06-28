import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

// Rota temporária de debug - REMOVER após correção
router.get('/jwt-debug', async (req, res) => {
  try {
    // Criar token teste
    const testToken = jwt.sign({ userId: 999, debug: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Tentar verificar o mesmo token
    const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
    
    res.json({
      jwt_secret_exists: !!process.env.JWT_SECRET,
      jwt_secret_length: process.env.JWT_SECRET?.length || 0,
      test_token: testToken,
      decoded_test: decoded,
      node_env: process.env.NODE_ENV,
      database_url_exists: !!process.env.DATABASE_URL
    });
  } catch (error) {
    res.json({
      error: error.message,
      jwt_secret_exists: !!process.env.JWT_SECRET,
      jwt_secret_length: process.env.JWT_SECRET?.length || 0
    });
  }
});

export default router; 