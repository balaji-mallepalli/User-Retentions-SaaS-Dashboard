import React, { useEffect, useState } from 'react';
import { AiOutlinePlus, AiOutlineDelete, AiOutlineCheck } from 'react-icons/ai';
import { BsListUl } from 'react-icons/bs';

function JsonServerDemo() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiBase = 'http://localhost:3001';

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/items`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error('Fetch items error', err);
      setError('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const addItem = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const res = await fetch(`${apiBase}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), completed: false })
      });
      const created = await res.json();
      setItems(prev => [...prev, created]);
      setTitle('');
    } catch (err) {
      console.error('Add item error', err);
      setError('Failed to add item');
    }
  };

  const toggleComplete = async (item) => {
    try {
      const res = await fetch(`${apiBase}/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !item.completed })
      });
      const updated = await res.json();
      setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
    } catch (err) {
      console.error('Toggle error', err);
      setError('Failed to update item');
    }
  };

  const removeItem = async (id) => {
    try {
      await fetch(`${apiBase}/items/${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error('Delete error', err);
      setError('Failed to delete item');
    }
  };

  return (
    <div className="json-demo-container">
      {/* Header Section */}
      <div className="json-demo-header">
        <div className="demo-title-section">
          <BsListUl size={32} className="demo-icon" />
          <div>
            <h1>JSON Server Demo</h1>
            <p className="demo-subtitle">Interactive CRUD operations with json-server</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="json-demo-content">
        {/* API Info Card */}
        <div className="api-info-card">
          <div className="api-info-title">🔌 API Connection</div>
          <code className="api-endpoint">http://localhost:3001/items</code>
          <p className="api-status">✅ Connected</p>
        </div>

        {/* Add Item Form */}
        <form onSubmit={addItem} className="add-item-form">
          <div className="form-group">
            <input 
              type="text"
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Enter a new item..." 
              className="item-input"
              disabled={loading}
            />
            <button 
              type="submit" 
              className="btn-add-item"
              disabled={loading || !title.trim()}
            >
              <AiOutlinePlus size={18} />
              <span>Add Item</span>
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="error-box">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Items List */}
        <div className="items-section">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <BsListUl size={48} />
              <p>No items yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="items-list">
              <div className="items-header">
                <span className="items-count">📋 {items.length} {items.length === 1 ? 'item' : 'items'}</span>
                <span className="items-completed">
                  {items.filter(i => i.completed).length} completed
                </span>
              </div>
              <div className="items-container">
                {items.map(item => (
                  <div key={item.id} className={`item-card ${item.completed ? 'completed' : ''}`}>
                    <div className="item-content">
                      <button
                        className={`item-checkbox ${item.completed ? 'checked' : ''}`}
                        onClick={() => toggleComplete(item)}
                        title={item.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {item.completed && <AiOutlineCheck size={16} />}
                      </button>
                      <span className="item-text">{item.title}</span>
                    </div>
                    <button 
                      className="btn-delete-item"
                      onClick={() => removeItem(item.id)}
                      title="Delete item"
                    >
                      <AiOutlineDelete size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default JsonServerDemo;
