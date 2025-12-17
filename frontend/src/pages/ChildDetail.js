import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { childrenAPI, zonesAPI, alertsAPI, createSSEConnection } from '../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './ChildDetail.css';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function ChildDetail() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [zones, setZones] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState('route');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    
    // Setup SSE for real-time updates
    const eventSource = createSSEConnection(childId, handleRealtimeEvent);
    
    return () => {
      eventSource.close();
    };
  }, [childId]);

  const handleRealtimeEvent = (event) => {
    console.log('Realtime event:', event);
    
    if (event.type === 'location_update') {
      loadChild();
    } else if (event.type === 'alert_created') {
      loadAlerts();
    } else if (event.type === 'state_changed') {
      loadChild();
    }
  };

  const loadData = async () => {
    await Promise.all([
      loadChild(),
      loadZones(),
      loadAlerts()
    ]);
    setLoading(false);
  };

  const loadChild = async () => {
    try {
      const response = await childrenAPI.getOne(childId);
      setChild(response.data.child);
    } catch (error) {
      console.error('Error loading child:', error);
    }
  };

  const loadZones = async () => {
    try {
      const response = await zonesAPI.getAll(childId);
      setZones(response.data.zones);
    } catch (error) {
      console.error('Error loading zones:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await alertsAPI.getAll(childId, { limit: 20 });
      setAlerts(response.data.alerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const handleDeleteChild = async () => {
    if (!window.confirm(`Bạn có chắc muốn xóa thiết bị "${child?.name}"? Thao tác này không thể hoàn tác.`)) {
      return;
    }

    try {
      await childrenAPI.delete(childId);
      navigate('/');
    } catch (error) {
      console.error('Error deleting child:', error);
      alert('Lỗi khi xóa thiết bị: ' + (error.response?.data?.error || error.message));
    }
  };

  const getStatusText = () => {
    if (!child) return '';
    if (!child.last_lat) return 'Chưa kết nối';
    if (child.last_safe_state === 'IN_SAFE') return 'Trong vùng an toàn';
    if (child.last_safe_state === 'OUT_SAFE') return 'Ngoài vùng an toàn';
    return 'Không xác định';
  };

  const getStatusClass = () => {
    if (!child || !child.last_lat) return 'status-unknown';
    if (child.last_safe_state === 'IN_SAFE') return 'status-safe';
    if (child.last_safe_state === 'OUT_SAFE') return 'status-danger';
    return 'status-unknown';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('vi-VN');
  };

  const handleAddZone = () => {
    navigate(`/child/${childId}/add-zone`);
  };

  // Tính khoảng cách giữa 2 điểm (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371000; // Bán kính Trái Đất (mét)
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Trả về khoảng cách tính bằng mét
  };

  // Kiểm tra thiết bị có trong zone không
  const isDeviceInZone = (zone) => {
    if (!child || !child.last_lat || !child.last_lng) return false;
    
    const distance = calculateDistance(
      child.last_lat,
      child.last_lng,
      parseFloat(zone.center_lat),
      parseFloat(zone.center_lng)
    );
    
    return distance <= zone.radius_m;
  };

  // Lấy khoảng cách từ thiết bị đến zone
  const getDistanceToZone = (zone) => {
    if (!child || !child.last_lat || !child.last_lng) return null;
    
    const distance = calculateDistance(
      child.last_lat,
      child.last_lng,
      parseFloat(zone.center_lat),
      parseFloat(zone.center_lng)
    );
    
    return Math.round(distance);
  };

  if (loading || !child) {
    return <div className="loading">Đang tải...</div>;
  }

  const defaultCenter = child.last_lat 
    ? [parseFloat(child.last_lat), parseFloat(child.last_lng)]
    : [21.0285, 105.8542]; // Hanoi default

  return (
    <div className="child-detail">
      <header className="detail-header">
        <button className="back-btn" onClick={() => navigate('/')}>←</button>
        <h1>{child.name}</h1>
        <button className="info-btn">ⓘ</button>
      </header>

      <div className="location-card">
        <div className="location-icon">📍</div>
        <div className="location-info">
          <div className="location-title">Vị trí: {child.last_lat ? 'Xuân La, Tây Hồ, Hà Nội' : 'Chưa có'}</div>
          <div className="location-details">
            <span>🔋 N/A</span>
            <span>📶 2G</span>
          </div>
          <div className={`location-status ${getStatusClass()}`}>
            <span>🛡️</span> {getStatusText()}
          </div>
        </div>
        {child.speed_mps > 0 && (
          <div className="location-moving">
            🏃 Di chuyển
          </div>
        )}
      </div>

      {child.last_lat && (
        <div className="map-container">
          <MapContainer
            center={defaultCenter}
            zoom={15}
            style={{ height: '300px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <Marker position={defaultCenter}>
              <Popup>{child.name}</Popup>
            </Marker>
            {zones.map((zone) => (
              <Circle
                key={zone.id}
                center={[parseFloat(zone.center_lat), parseFloat(zone.center_lng)]}
                radius={zone.radius_m}
                pathOptions={{
                  color: zone.active ? '#4CAF50' : '#999',
                  fillColor: zone.active ? '#4CAF50' : '#999',
                  fillOpacity: 0.2,
                }}
              >
                <Popup>{zone.name}</Popup>
              </Circle>
            ))}
          </MapContainer>
        </div>
      )}

      <div className="detail-tabs">
        <button className={activeTab === 'route' ? 'active' : ''} onClick={() => setActiveTab('route')}>
          Lộ trình
        </button>
        <button className={activeTab === 'zones' ? 'active' : ''} onClick={() => setActiveTab('zones')}>
          Vùng an toàn
        </button>
        <button className={activeTab === 'alerts' ? 'active' : ''} onClick={() => setActiveTab('alerts')}>
          Bản tin
        </button>
        <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
          Thiết lập
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'route' && (
          <div className="route-content">
            <p>Lộ trình di chuyển</p>
            <p style={{color: '#666', fontSize: '14px'}}>Cập nhật: {formatTime(child.last_location_ts)}</p>
          </div>
        )}

        {activeTab === 'zones' && (
          <div className="zones-content">
            {!child.last_lat && (
              <div style={{
                background: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
                color: '#856404'
              }}>
                <strong>⚠️ Chưa kết nối thiết bị</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                  Vui lòng kết nối thiết bị trước khi thiết lập vùng an toàn.
                  <br />
                  Vào tab "Thiết lập" → "Tạo link tracker" để kết nối.
                </p>
              </div>
            )}
            
            <button 
              className="add-zone-btn" 
              onClick={handleAddZone}
              disabled={!child.last_lat}
              style={!child.last_lat ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              + Thêm vùng an toàn
            </button>
            
            {zones.length === 0 ? (
              <p className="empty-text">
                {!child.last_lat 
                  ? 'Kết nối thiết bị để bắt đầu thiết lập vùng an toàn'
                  : 'Chưa có vùng an toàn nào'}
              </p>
            ) : (
              <>
                <div style={{
                  background: '#e3f2fd',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#1976d2'
                }}>
                  📍 Quét vị trí hiện tại với {zones.filter(z => z.active).length} vùng an toàn
                </div>
                {zones.map((zone) => {
                  const inZone = isDeviceInZone(zone);
                  const distance = getDistanceToZone(zone);
                  
                  return (
                    <div 
                      key={zone.id} 
                      className="zone-item"
                      style={{
                        border: inZone ? '2px solid #4CAF50' : '1px solid #e0e0e0',
                        background: inZone ? '#f1f8f4' : 'white'
                      }}
                    >
                      <div className="zone-icon">
                        {inZone ? '✅' : '📍'}
                      </div>
                      <div className="zone-info">
                        <div className="zone-name">{zone.name}</div>
                        <div className="zone-details">
                          Bán kính: {zone.radius_m}m
                          {distance !== null && (
                            <>
                              <br />
                              <span style={{ 
                                color: inZone ? '#4CAF50' : '#666',
                                fontWeight: inZone ? 'bold' : 'normal'
                              }}>
                                {inZone 
                                  ? `🟢 Thiết bị đang ở trong vùng này` 
                                  : `🔴 Cách ${distance}m từ vùng này`
                                }
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div 
                        className="zone-status"
                        style={{
                          color: inZone ? '#4CAF50' : (zone.active ? '#666' : '#999'),
                          fontWeight: inZone ? 'bold' : 'normal'
                        }}
                      >
                        {inZone ? 'TRONG VÙNG' : (zone.active ? 'NGOÀI VÙNG' : 'Đã tắt')}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="alerts-content">
            {alerts.length === 0 ? (
              <p className="empty-text">Chưa có cảnh báo nào</p>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className={`alert-item ${alert.type.toLowerCase()}`}>
                  <div className="alert-icon">
                    {alert.type === 'EXIT' ? '⚠️' : '✅'}
                  </div>
                  <div className="alert-info">
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-time">{formatTime(alert.ts)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-content">
            <button onClick={() => navigate(`/child/${childId}/tracker`)}>
              🔗 Tạo link tracker
            </button>
            <button onClick={() => navigate(`/child/${childId}/edit`)}>
              ✏️ Chỉnh sửa thông tin
            </button>
            <button 
              onClick={handleDeleteChild}
              style={{ 
                backgroundColor: '#f44336',
                marginTop: '20px'
              }}
            >
              🗑️ Xóa thiết bị
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChildDetail;
