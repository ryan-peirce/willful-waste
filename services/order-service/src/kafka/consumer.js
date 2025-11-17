const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'order-service',
  brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS || 'localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'order-service-group' });

// In-memory product cache
const productCache = new Map();

async function startKafkaConsumer() {
  try {
    await consumer.connect();
    console.log('Kafka consumer connected');
    
    await consumer.subscribe({ topic: 'product-events', fromBeginning: false });
    console.log('Subscribed to product-events topic');
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          console.log(`Received ${event.eventType} event for product ${event.productId}`);
          
          // Update product cache
          if (event.eventType === 'CREATED' || event.eventType === 'UPDATED') {
            productCache.set(event.productId, {
              id: event.productId,
              name: event.name,
              price: event.price,
              stockQuantity: event.stockQuantity,
              category: event.category
            });
            console.log(`Updated product cache for product ${event.productId}`);
          } else if (event.eventType === 'DELETED') {
            productCache.delete(event.productId);
            console.log(`Removed product ${event.productId} from cache`);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      }
    });
  } catch (error) {
    console.error('Error starting Kafka consumer:', error);
    throw error;
  }
}

function getProductFromCache(productId) {
  return productCache.get(productId);
}

process.on('SIGTERM', async () => {
  await consumer.disconnect();
  console.log('Kafka consumer disconnected');
});

module.exports = {
  startKafkaConsumer,
  getProductFromCache
};
