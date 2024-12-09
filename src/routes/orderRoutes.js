const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../controllers/authController');

// Get all orders
// router.get('/', authenticate, orderController.getAllOrders);

// // Get order by ID
// router.get('/:id', authenticate, orderController.getOrderById);

// Create an order
router.post('/', authenticate, orderController.createOrder);

// Update an order
// router.put('/:id', authenticate, orderController.updateOrder);

// // Delete an order
// router.delete('/:id', authenticate, orderController.deleteOrder);

module.exports = router;
