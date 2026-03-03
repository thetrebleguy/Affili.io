import React, { useState } from 'react';
import { X, Moon, Sun, Bell as BellIcon, Volume2 } from 'lucide-react';
import './SettingsPanel.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  const handleSettingChange = (setting: string, value: boolean) => {
    switch (setting) {
      case 'theme':
        setDarkMode(value);
        break;
      case 'notifications':
        setNotifications(value);
        break;
      case 'sound':
        setSound(value);
        break;
      case 'email':
        setEmailAlerts(value);
        break;
      default:
        break;
    }
  };

  return (
    <>
      {isOpen && <div className="settings-overlay" onClick={onClose}></div>}
      <div className={`settings-panel ${isOpen ? 'open' : ''}`}>
        <div className="settings-header">
          <h3>⚙️ Settings</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-content">
          {/* Display Settings */}
          <div className="settings-section">
            <h4 className="section-title">Display</h4>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">
                  {darkMode ? <Moon size={18} /> : <Sun size={18} />}
                  <span>Dark Mode</span>
                </div>
                <p className="setting-description">Use dark theme for comfortable viewing</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => handleSettingChange('theme', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="settings-section">
            <h4 className="section-title">Notification</h4>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">
                  <BellIcon size={18} />
                  <span>Push Notifications</span>
                </div>
                <p className="setting-description">Receive real-time alerts and updates</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">
                  <Volume2 size={18} />
                  <span>Sound</span>
                </div>
                <p className="setting-description">Play sound for important alerts</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={sound}
                  onChange={(e) => handleSettingChange('sound', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">
                  📧
                  <span>Email Alerts</span>
                </div>
                <p className="setting-description">Send important updates to your email</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => handleSettingChange('email', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Preferences */}
          <div className="settings-section">
            <h4 className="section-title">Preferences</h4>

            <div className="preference-group">
              <label className="preference-item">
                <input type="radio" name="update-frequency" value="real-time" defaultChecked />
                <span>🚀 Real-time Updates</span>
              </label>
              <label className="preference-item">
                <input type="radio" name="update-frequency" value="hourly" />
                <span>⏰ Hourly Digest</span>
              </label>
              <label className="preference-item">
                <input type="radio" name="update-frequency" value="daily" />
                <span>📅 Daily Summary</span>
              </label>
            </div>
          </div>

          {/* About */}
          <div className="settings-section">
            <h4 className="section-title">About</h4>
            <div className="about-info">
              <p>AFFILI.IO v1.0.0</p>
              <p className="version-text">Affiliate Trend Predictor & Income Optimizer</p>
              <p className="version-text">Powered by Alibaba Cloud & Paylabs</p>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;
