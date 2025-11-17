const { Order } = require('../models');
const { publishOrderEvent } = require('../kafka/producer');

// Get all orders
exports.getAllOrders = async (req, res, next) => {
  try {
    console.log('Fetching all orders');
    const orders = await Order.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// Get order by ID
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Fetching order with id: ${id}`);
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// Create new order
exports.createOrder = async (req, res, next) => {
  try {
    const { productId, productName, quantity, totalPrice, customerEmail } = req.body;
    
    console.log(`Creating new order for product: ${productName}`);
    
    // Demo: Simulate backend error for specific product
    if (productId === 7 || productId === 999) {
      console.error(`DEMO ERROR: Product ID ${productId} triggers intentional backend failure`);
      throw new Error('Database connection timeout - this is a demo error for observability testing');
    }
    
    const order = await Order.create({
      productId,
      productName,
      quantity,
      totalPrice,
      customerEmail,
      status: 'PENDING'
    });
    
    // Publish event to Kafka
    await publishOrderEvent(order, 'CREATED');
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    next(error);
  }
};

// Update order status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`Updating order ${id} status to: ${status}`);
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    order.status = status;
    await order.save();
    
    // Publish event to Kafka
    await publishOrderEvent(order, 'UPDATED');
    
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// Delete order
exports.deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Deleting order with id: ${id}`);
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    await order.destroy();
    
    // Publish event to Kafka
    await publishOrderEvent(order, 'DELETED');
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
