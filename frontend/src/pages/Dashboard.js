import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { childrenAPI, zonesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Dashboard.css';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function Dashboard() {
  const [children, setChildren] = useState([]);
  const [allZones, setAllZones] = useState([]);
  const [activeTab, setActiveTab] = useState('map');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const response = await childrenAPI.getAll();
      const childrenData = response.data.children;
      setChildren(childrenData);
      
      // Load zones for all children
      const zonesPromises = childrenData.map(child => 
        zonesAPI.getAll(child.id).catch(err => ({ data: { zones: [] } }))
      );
      const zonesResults = await Promise.all(zonesPromises);
      const zones = zonesResults.flatMap((result, index) => 
        result.data.zones.map(zone => ({
          ...zone,
          child_name: childrenData[index].name
        }))
      );
      setAllZones(zones);
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (child) => {
    if (!child.last_lat) return 'Chưa kết nối';
    if (child.last_safe_state === 'IN_SAFE') return 'Trong vùng an toàn';
    if (child.last_safe_state === 'OUT_SAFE') return 'Ngoài vùng an toàn';
    return 'Không xác định';
  };

  const getStatusClass = (child) => {
    if (!child.last_lat) return 'status-unknown';
    if (child.last_safe_state === 'IN_SAFE') return 'status-safe';
    if (child.last_safe_state === 'OUT_SAFE') return 'status-danger';
    return 'status-unknown';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return `${diff} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return date.toLocaleString('vi-VN');
  };

  const handleChildClick = (child) => {
    navigate(`/child/${child.id}`);
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <button className="menu-btn">☰</button>
        <h1>Giám sát</h1>
        <button onClick={logout} className="logout-btn">Đăng xuất</button>
      </header>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'map' ? 'active' : ''} 
          onClick={() => setActiveTab('map')}
        >
          Bản đồ
        </button>
        <button 
          className={activeTab === 'devices' ? 'active' : ''} 
          onClick={() => setActiveTab('devices')}
        >
          Thiết bị
        </button>
        <button 
          className={activeTab === 'objects' ? 'active' : ''} 
          onClick={() => setActiveTab('objects')}
        >
          Đối tượng
        </button>
      </div>

      {activeTab === 'devices' && (
        <div className="devices-list">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Tìm kiếm thiết bị" />
          </div>

          {children.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có thiết bị nào</p>
              <button onClick={() => navigate('/add-child')} className="add-btn">
                Thêm thiết bị
              </button>
            </div>
          ) : (
            children.map((child) => (
              <div 
                key={child.id} 
                className="device-card"
                onClick={() => handleChildClick(child)}
              >
                <div className="device-icon">
                  <span className="pin-icon">📍</span>
                </div>
                <div className="device-info">
                  <div className="device-name">{child.name}</div>
                  <div className="device-details">
                    <span className="battery">🔋 N/A</span>
                    <span className="signal">📶 2G</span>
                  </div>
                  <div className={`device-status ${getStatusClass(child)}`}>
                    <span className="status-icon">🛡️</span>
                    {getStatusText(child)}
                  </div>
                </div>
                <div className="device-meta">
                  <div className={child.speed_mps > 0 ? 'moving' : 'idle'}>
                    {child.speed_mps > 0 ? '🏃 Di chuyển' : ''}
                  </div>
                  <div className="last-update">{formatTime(child.last_location_ts)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'map' && (
        <div className="map-view">
          {children.filter(c => c.last_lat && c.last_lng).length === 0 ? (
            <div className="map-placeholder">
              <p>Chưa có thiết bị nào có vị trí</p>
              <p style={{fontSize: '14px', color: '#666'}}>
                Kết nối thiết bị để xem trên bản đồ
              </p>
            </div>
          ) : (
            <MapContainer
              center={[
                children.find(c => c.last_lat)?.last_lat || 21.0285,
                children.find(c => c.last_lng)?.last_lng || 105.8542
              ]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              
              {/* Hiển thị tất cả zones */}
              {allZones.map((zone) => zone.active && (
                <Circle
                  key={zone.id}
                  center={[parseFloat(zone.center_lat), parseFloat(zone.center_lng)]}
                  radius={zone.radius_m}
                  pathOptions={{
                    color: '#4CAF50',
                    fillColor: '#4CAF50',
                    fillOpacity: 0.1
                  }}
                >
                  <Popup>
                    <strong>{zone.name}</strong><br />
                    {zone.child_name}<br />
                    Bán kính: {zone.radius_m}m
                  </Popup>
                </Circle>
              ))}
              
              {/* Hiển thị tất cả thiết bị */}
              {children.map((child) => child.last_lat && child.last_lng && (
                <Marker
                  key={child.id}
                  position={[child.last_lat, child.last_lng]}
                >
                  <Popup>
                    <div style={{ textAlign: 'center' }}>
                      <strong>{child.name}</strong><br />
                      <span style={{
                        color: child.last_safe_state === 'IN_SAFE' ? '#4CAF50' : '#f44336',
                        fontWeight: 'bold'
                      }}>
                        {getStatusText(child)}
                      </span><br />
                      <small>{formatTime(child.last_location_ts)}</small>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      )}

      {activeTab === 'objects' && (
        <div className="objects-list">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Tìm kiếm đối tượng" />
          </div>
          
          {children.map((child) => (
            <div key={child.id} className="object-card" onClick={() => handleChildClick(child)}>
              <div className="object-icon">
                <span>👤</span>
              </div>
              <div className="object-info">
                <div className="object-type">Người thân</div>
                <div className="object-name">{child.name}</div>
              </div>
              <div className="object-status">
                {child.last_lat ? 'Đã kết nối' : 'Chưa kết nối'}
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="fab" onClick={() => navigate('/add-child')}>
        +
      </button>
    </div>
  );
}

export default Dashboard;
