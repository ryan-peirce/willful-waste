import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || '';

function App() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [notification, setNotification] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      showNotification('Failed to load products');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleOrder = async (product) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          quantity: 1,
          totalPrice: product.price,
          customerEmail: 'customer@example.com'
        }),
      });
      
      if (response.ok) {
        showNotification(`Ordered ${product.name}!`);
        fetchOrders();
      } else {
        showNotification('Order failed');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      showNotification('Order failed');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🛍️ Willful Waste</h1>
        <p className="tagline">Everyday products at everyday prices</p>
      </header>

      {notification && (
        <div className="notification">{notification}</div>
      )}

      <div className="tabs">
        <button 
          className={activeTab === 'products' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button 
          className={activeTab === 'orders' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('orders')}
        >
          My Orders ({orders.length})
        </button>
      </div>

      <main className="main-content">
        {activeTab === 'products' && (
          <div className="products-grid">
            {products.length === 0 ? (
              <div className="empty-state">
                <p>No products available yet.</p>
                <p className="hint">The product service will populate items automatically.</p>
              </div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-icon">📦</div>
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <p className="product-category">{product.category}</p>
                  <div className="product-footer">
                    <span className="price">${product.price}</span>
                    <span className="stock">
                      {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  <button 
                    className="order-button"
                    onClick={() => handleOrder(product)}
                    disabled={loading || product.stockQuantity === 0}
                  >
                    {loading ? 'Processing...' : 'Order Now'}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-list">
            {orders.length === 0 ? (
              <div className="empty-state">
                <p>No orders yet.</p>
                <p className="hint">Place an order to see it here!</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <span className="order-id">Order #{order.id}</span>
                    <span className={`order-status ${order.status}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="order-details">
                    <p><strong>{order.productName}</strong></p>
                    <p>Quantity: {order.quantity}</p>
                    <p>Total: ${order.totalPrice}</p>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>Willful Waste Demo Store • Observability Demo with Dash0</p>
      </footer>
    </div>
  );
}

export default App;
