const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'order-service',
  brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS || 'localhost:9092']
});

const producer = kafka.producer();

let isConnected = false;

async function connectProducer() {
  if (!isConnected) {
    await producer.connect();
    isConnected = true;
    console.log('Kafka producer connected');
  }
}

async function publishOrderEvent(order, eventType) {
  try {
    await connectProducer();
    
    const event = {
      eventType,
      orderId: order.id,
      productId: order.productId,
      productName: order.productName,
      quantity: order.quantity,
      totalPrice: order.totalPrice,
      status: order.status,
      timestamp: Date.now()
    };
    
    await producer.send({
      topic: 'order-events',
      messages: [
        {
          key: order.id.toString(),
          value: JSON.stringify(event)
        }
      ]
    });
    
    console.log(`Published ${eventType} event for order id: ${order.id}`);
  } catch (error) {
    console.error('Failed to publish order event:', error);
  }
}

process.on('SIGTERM', async () => {
  if (isConnected) {
    await producer.disconnect();
    console.log('Kafka producer disconnected');
  }
});

module.exports = {
  publishOrderEvent
};
