import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { childrenAPI } from '../services/api';
import './AddChild.css';

function AddChild() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await childrenAPI.create({ name });
      navigate(`/child/${response.data.child.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-child-page">
      <header className="add-child-header">
        <button className="back-btn" onClick={() => navigate('/')}>←</button>
        <h1>Thêm thiết bị</h1>
        <div style={{width: '40px'}}></div>
      </header>

      <form onSubmit={handleSubmit} className="add-child-form">
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label>Tên thiết bị / Trẻ</label>
          <input
            type="text"
            placeholder="Ví dụ: Bé An"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Đang tạo...' : 'Tạo thiết bị'}
        </button>
      </form>
    </div>
  );
}

export default AddChild;
