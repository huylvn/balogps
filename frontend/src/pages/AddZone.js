import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, useMapEvents, Circle } from 'react-leaflet';
import { zonesAPI } from '../services/api';
import './AddZone.css';

function LocationPicker({ onLocationSelect, center, radius }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return center ? (
    <Circle
      center={[center.lat, center.lng]}
      radius={radius}
      pathOptions={{ color: '#4CAF50', fillColor: '#4CAF50', fillOpacity: 0.2 }}
    />
  ) : null;
}

function AddZone() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [centerLat, setCenterLat] = useState(null);
  const [centerLng, setCenterLng] = useState(null);
  const [radius, setRadius] = useState(150);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLocationSelect = (lat, lng) => {
    setCenterLat(lat);
    setCenterLng(lng);
  };

  const handleGetCurrentLocation = () => {
    setError('');
    
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ GPS');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCenterLat(position.coords.latitude);
        setCenterLng(position.coords.longitude);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        setError('Không thể lấy vị trí: ' + error.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!centerLat || !centerLng) {
      setError('Vui lòng chọn vị trí trên bản đồ');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await zonesAPI.create(childId, {
        name,
        center_lat: centerLat,
        center_lng: centerLng,
        radius_m: parseInt(radius),
      });
      navigate(`/child/${childId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-zone-page">
      <header className="add-zone-header">
        <button className="back-btn" onClick={() => navigate(`/child/${childId}`)}>←</button>
        <h1>Thêm vùng an toàn</h1>
        <div style={{width: '40px'}}></div>
      </header>

      <div className="map-selector">
        <MapContainer
          center={[21.0285, 105.8542]}
          zoom={13}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            center={centerLat && centerLng ? { lat: centerLat, lng: centerLng } : null}
            radius={radius}
          />
        </MapContainer>
        <div className="map-hint">
          Nhấn vào bản đồ để chọn vị trí trung tâm
          <button 
            type="button"
            onClick={handleGetCurrentLocation}
            style={{
              marginLeft: '10px',
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            disabled={loading}
          >
            📍 Lấy vị trí hiện tại
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="add-zone-form">
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label>Tên vùng</label>
          <input
            type="text"
            placeholder="Ví dụ: Nhà"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Bán kính (mét)</label>
          <input
            type="number"
            min="1"
            max="5000"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            required
          />
        </div>

        {centerLat && centerLng && (
          <div className="coordinates-display">
            📍 Vị trí: {centerLat.toFixed(6)}, {centerLng.toFixed(6)}
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Đang tạo...' : 'Tạo vùng an toàn'}
        </button>
      </form>
    </div>
  );
}

export default AddZone;
