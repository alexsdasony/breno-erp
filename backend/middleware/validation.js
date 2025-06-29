import { body, query, param, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Auth validations
export const validateRegister = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  handleValidationErrors
];

// Transaction validations
export const validateTransaction = [
  body('type').isIn(['receita', 'despesa']).withMessage('Type must be receita or despesa'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('date').isISO8601().withMessage('Valid date required'),
  body('category').trim().isLength({ min: 1 }).withMessage('Category required'),
  body('segment_id').isInt({ min: 1 }).withMessage('Valid segment ID required'),
  handleValidationErrors
];

// Product validations
export const validateProduct = [
  body('name').trim().isLength({ min: 1 }).withMessage('Name required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('min_stock').isInt({ min: 0 }).withMessage('Min stock must be a non-negative integer'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').trim().isLength({ min: 1 }).withMessage('Category required'),
  body('segment_id').isInt({ min: 1 }).withMessage('Valid segment ID required'),
  handleValidationErrors
];

// Customer validations
export const validateCustomer = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('document').optional().custom((value) => {
    if (!value) return true; // Document is optional
    
    const numbers = value.replace(/\D/g, '');
    
    // CPF validation (11 digits)
    if (numbers.length === 11) {
      const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
      if (!cpfRegex.test(value)) {
        throw new Error('CPF format: 000.000.000-00');
      }
      return true;
    }
    
    // CNPJ validation (14 digits)
    if (numbers.length === 14) {
      const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
      if (!cnpjRegex.test(value)) {
        throw new Error('CNPJ format: 00.000.000/0000-00');
      }
      return true;
    }
    
    throw new Error('Document must be a valid CPF (11 digits) or CNPJ (14 digits)');
  }).withMessage('Invalid document format'),
  handleValidationErrors
];

// Sale validations
export const validateSale = [
  body('customer_id').isInt({ min: 1 }).withMessage('Valid customer ID required'),
  body('customer_name').trim().isLength({ min: 1 }).withMessage('Customer name required'),
  body('product').trim().isLength({ min: 1 }).withMessage('Product required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('total').isFloat({ min: 0 }).withMessage('Total must be a positive number'),
  body('date').isISO8601().withMessage('Valid date required'),
  body('status').isIn(['Pendente', 'Concluída', 'Cancelada']).withMessage('Invalid status'),
  body('segment_id').isInt({ min: 1 }).withMessage('Valid segment ID required'),
  handleValidationErrors
];

// Billing validations
export const validateBilling = [
  body('customer_id').isInt({ min: 1 }).withMessage('Valid customer ID required'),
  body('customer_name').trim().isLength({ min: 1 }).withMessage('Customer name required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('due_date').isISO8601().withMessage('Valid due date required'),
  body('status').isIn(['Pendente', 'Paga', 'Vencida', 'Cancelada']).withMessage('Invalid status'),
  body('segment_id').isInt({ min: 1 }).withMessage('Valid segment ID required'),
  handleValidationErrors
];

// Segment validations
export const validateSegment = [
  body('name').trim().isLength({ min: 1 }).withMessage('Name required'),
  body('description').optional().trim(),
  handleValidationErrors
];

// Cost Center validations
export const validateCostCenter = [
  body('name').trim().isLength({ min: 1 }).withMessage('Name required'),
  body('segment_id').optional().isInt({ min: 1 }).withMessage('Valid segment ID required'),
  handleValidationErrors
];

// Accounts Payable validations - EXPORT EXPLÍCITO
export const validateAccountPayable = [
  body('supplier').trim().isLength({ min: 1 }).withMessage('Supplier required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('due_date').isISO8601().withMessage('Valid due date required'),
  body('status').isIn(['pending', 'paid', 'overdue']).withMessage('Invalid status'),
  body('segment_id').optional().isInt({ min: 1 }).withMessage('Valid segment ID required'),
  handleValidationErrors
];

// Integration validations
export const validateIntegration = [
  body('name').trim().isLength({ min: 1 }).withMessage('Name required'),
  body('type').trim().isLength({ min: 1 }).withMessage('Type required'),
  body('config').isObject().withMessage('Config must be an object'),
  body('segment_id').optional().isInt({ min: 1 }).withMessage('Valid segment ID required'),
  handleValidationErrors
];

// Pagination and filtering
export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be at least 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('segment_id').optional().isInt({ min: 1 }).withMessage('Valid segment ID required'),
  handleValidationErrors
];

// ID parameter validation
export const validateId = [
  param('id').isInt({ min: 1 }).withMessage('Valid ID required'),
  handleValidationErrors
];

// NFe validations
export const validateNFe = [
  body('customer_name').trim().isLength({ min: 1 }).withMessage('Customer name required'),
  body('total').isFloat({ min: 0 }).withMessage('Total must be a positive number'),
  body('date').isISO8601().withMessage('Valid date required'),
  body('status').isIn(['Emitida', 'Cancelada']).withMessage('Invalid status'),
  body('segment_id').optional().isInt({ min: 1 }).withMessage('Valid segment ID required'),
  handleValidationErrors
]; 