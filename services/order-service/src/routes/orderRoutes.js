const express = require('express');
const { body, param } = require('express-validator');
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/orderController');

const router = express.Router();

// Validation middleware
const validateOrder = [
  body('productId').isInt().withMessage('Product ID must be an integer'),
  body('productName').notEmpty().withMessage('Product name is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('totalPrice').isDecimal().withMessage('Total price must be a decimal'),
  body('customerEmail').optional().isEmail().withMessage('Invalid email format')
];

const validateStatus = [
  body('status')
    .isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
    .withMessage('Invalid status value')
];

// Routes
router.get('/', getAllOrders);
router.get('/:id', param('id').isInt(), getOrderById);
router.post('/', validateOrder, createOrder);
router.patch('/:id/status', param('id').isInt(), validateStatus, updateOrderStatus);
router.delete('/:id', param('id').isInt(), deleteOrder);

module.exports = router;
