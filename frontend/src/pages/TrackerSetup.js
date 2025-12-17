import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { childrenAPI } from '../services/api';
import './TrackerSetup.css';

function TrackerSetup() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [trackerUrl, setTrackerUrl] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadChild();
  }, [childId]);

  const loadChild = async () => {
    try {
      const response = await childrenAPI.getOne(childId);
      setChild(response.data.child);
    } catch (error) {
      console.error('Error loading child:', error);
      setError('Không thể tải thông tin thiết bị');
    }
  };

  const handleCreateToken = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await childrenAPI.createTrackerToken(childId);
      setToken(response.data.token);
      setTrackerUrl(response.data.tracker_url);
      // Backend automatically uses local IP instead of localhost
    } catch (error) {
      console.error('Error creating tracker token:', error);
      setError(error.response?.data?.error || 'Không thể tạo link tracker');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(trackerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenTracker = () => {
    window.open(trackerUrl, '_blank');
  };

  if (!child) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="tracker-setup">
      <header className="setup-header">
        <button className="back-btn" onClick={() => navigate(`/child/${childId}`)}>←</button>
        <h1>Tạo link tracker</h1>
      </header>

      <div className="setup-content">
        <div className="device-info">
          <div className="device-icon">📱</div>
          <div>
            <h2>{child.name}</h2>
            <p>Tạo link để theo dõi vị trí</p>
          </div>
        </div>

        {!trackerUrl ? (
          <div className="create-section">
            <div className="instruction">
              <h3>📍 Hướng dẫn</h3>
              <ol>
                <li>Nhấn nút "Tạo link tracker" bên dưới</li>
                <li>Copy link được tạo ra</li>
                <li>Gửi link cho người theo dõi qua SMS/Zalo/Email</li>
                <li>Người nhận mở link trên smartphone và cho phép truy cập vị trí</li>
              </ol>
            </div>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            <button 
              className="create-btn" 
              onClick={handleCreateToken}
              disabled={loading}
            >
              {loading ? '⏳ Đang tạo...' : '🔗 Tạo link tracker'}
            </button>

            <div className="warning">
              <p>⚠️ <strong>Lưu ý:</strong></p>
              <ul>
                <li>Link chỉ hiển thị một lần duy nhất</li>
                <li>Tạo link mới sẽ vô hiệu hóa link cũ</li>
                <li>Không chia sẻ link với người không tin cậy</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="result-section">
            <div className="success-message">
              ✅ Link tracker đã được tạo thành công!
            </div>

            <div className="token-display">
              <label>🔑 Token (lưu lại để backup):</label>
              <div className="token-box">
                <code>{token}</code>
              </div>
            </div>

            <div className="url-display">
              <label>🔗 Link tracker:</label>
              <div className="url-box">
                <input 
                  type="text" 
                  value={trackerUrl} 
                  readOnly 
                  onClick={(e) => e.target.select()}
                />
                <button className="copy-btn" onClick={handleCopy}>
                  {copied ? '✅ Đã copy' : '📋 Copy'}
                </button>
              </div>
            </div>

            <div className="action-buttons">
              <button className="open-btn" onClick={handleOpenTracker}>
                🌐 Mở tracker
              </button>
              <button className="share-btn" onClick={handleCopy}>
                📤 Chia sẻ
              </button>
            </div>

            <div className="qr-section">
              <h3>📱 Quét QR Code</h3>
              <div className="qr-placeholder">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(trackerUrl)}`}
                  alt="QR Code"
                />
              </div>
              <p>Quét mã QR để mở tracker trên smartphone</p>
            </div>

            <div className="ip-info">
              <h3>📡 Link sẵn sàng cho Smartphone</h3>
              <p>Backend đã tự động detect IP máy tính của bạn.</p>
              <p>Link này có thể sử dụng trực tiếp trên smartphone (cùng WiFi).</p>
              {trackerUrl.includes('localhost') && (
                <div className="localhost-note">
                  <strong>⚠️ Lưu ý:</strong> Link chứa localhost. Nếu không hoạt động trên smartphone,
                  hãy truy cập Parent App qua IP máy tính thay vì localhost.
                </div>
              )}
            </div>

            <div className="next-steps">
              <h3>📋 Bước tiếp theo</h3>
              <ol>
                <li>Đảm bảo máy tính và smartphone cùng WiFi</li>
                <li>Mở link trên smartphone của người cần theo dõi</li>
                <li>Cho phép truy cập vị trí khi được hỏi</li>
                <li>Nhấn "Bắt đầu theo dõi"</li>
                <li>Quay lại app này để xem vị trí realtime</li>
              </ol>
            </div>

            <button 
              className="done-btn" 
              onClick={() => navigate(`/child/${childId}`)}
            >
              ✅ Hoàn tất
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackerSetup;
