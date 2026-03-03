import React, { ReactNode, useState } from 'react';
import './MainLayout.css';
import { 
  LayoutGrid, 
  Search, 
  TrendingUp, 
  Bell, 
  Calculator, 
  Hash, 
  Settings 
} from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import SettingsPanel from './SettingsPanel';

interface MainLayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navItems = [
    { label: 'Overview', icon: LayoutGrid },
    { label: 'Scanner', icon: Search }, 
    { label: 'Alerts', icon: Bell },
    { label: 'Simulator', icon: Calculator },
    { label: 'Hashtags', icon: Hash },
  ];

  return (
    <div className="app-container">
      {/* --- TOP NAVBAR --- */}
      <header className="navbar">
        <div className="navbar-left">
          <div className="logo-box">
            <TrendingUp size={22} color="white" strokeWidth={2.5} />
          </div>
          <div className="brand-info">
            <h1 className="brand-title">AFFILI.IO</h1>
            <p className="brand-subtitle">Affiliate Trend Predictor & Income Optimizer</p>
          </div>
        </div>

        <div className="navbar-right">
          <div className="notif-icon" onClick={() => setNotifOpen(!notifOpen)}>
            <Bell size={20} />
            <span className="notif-dot"></span>
          </div>
          <Settings size={20} className="settings-icon" onClick={() => setSettingsOpen(!settingsOpen)} />
          <div className="divider"></div>
          <div className="premium-badge">
            <span className="plan-text">Premium Plan</span>
            <span className="team-text">SYNC1 Team</span>
          </div>
        </div>
      </header>

      {/* --- FLOATING TABS --- */}
      <nav className="tabs-wrapper">
        <div className="tabs-container">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`tab-button ${activeTab === item.label ? 'active' : ''}`}
              onClick={() => setActiveTab(item.label)}
            >
              <item.icon size={18} className="tab-icon" />
              <span className="tab-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* --- CONTENT AREA --- */}
      <main className="content-area">
        {children}
      </main>

      {/* --- GLOBAL FOOTER --- */}
      <footer className="dashboard-footer">
        <div className="footer-columns">
          <div className="footer-section">
            <h4>AFILII.IO</h4>
            <p>Transformasi Data Menjadi Profit Berkelanjutan</p>
            <small>Powered by Alibaba Cloud & Paylabs</small>
          </div>
          <div className="footer-section">
            <h4>Team SYNC1</h4>
            <ul>
              <li>Gabriella Agatha Uktolseja - 2802489433</li>
              <li>Hilyatul Aulia - 2802526706</li>
              <li>Davin Valerio Anton - 2902588535</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Technology Stack</h4>
            <ul>
              <li>Alibaba Cloud MaxCompute & OSS</li>
              <li>Machine Learning PAI (NLP + Forecasting)</li>
              <li>Function Compute (Serverless)</li>
              <li>Paylabs Payment Gateway Integration</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 TrendPulse AI by Team SYNC1. All rights reserved.
        </div>
      </footer>

      {/* --- NOTIFICATION & SETTINGS PANELS --- */}
      <NotificationPanel 
        isOpen={notifOpen} 
        onClose={() => setNotifOpen(false)}
        onShowAll={() => {
          setNotifOpen(false);
          setActiveTab('Alerts');
        }}
      />
      <SettingsPanel 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
};

export default MainLayout;