const client = require('prom-client');

// Create a Registry
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const ordersCreated = new client.Counter({
  name: 'orders_created_total',
  help: 'Total number of orders created',
  registers: [register]
});

const ordersDeleted = new client.Counter({
  name: 'orders_deleted_total',
  help: 'Total number of orders deleted',
  registers: [register]
});

module.exports = {
  register,
  httpRequestDuration,
  ordersCreated,
  ordersDeleted
};
