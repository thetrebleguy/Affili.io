import React, { useState, useEffect } from 'react';
import { Flame, AlertTriangle, ShieldAlert, Lightbulb, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import './AlertInsight.css';
  
interface AlertItem {
  id?: number;
  type?: 'trend' | 'saturation' | 'refund' | 'opportunity';
  title: string;
  severity?: 'High' | 'Medium';
  description?: string;
  time?: string;
  metrics?: {
    growth?: string;
    velocity?: string;
    score?: number;
    category?: string;
    detected?: string;
  };
  aiInsight?: string;
  [key: string]: any;
}

const AlertInsight: React.FC = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    fetch(`${API_BASE_URL}/market-alerts`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch alerts');
        return res.json();
      })
      .then((data) => {
  
  const alertList = Array.isArray(data) ? data : (data.alerts || []);
  
  setAlerts(alertList.map((alert: any, idx: number) => {
    // Mapping tipe alert dari backend ke icon frontend
    const typeMap: { [key: string]: 'trend' | 'saturation' | 'refund' | 'opportunity' } = {
      'TREND_SPIKE': 'trend',
      'MARKET_SATURATION': 'saturation',
      'HIGH_REFUND_RISK': 'refund',
      'CONVERSION_DROP': 'opportunity'
    };

    return {
      id: idx + 1,
      type: typeMap[alert.alert_type] || 'trend',
      title: alert.alert_type.replace(/_/g, ' '), 
      description: `Detected issues in ${alert.category || alert.product || 'Market Data'}`,
      time: alert.detected_at,
      metrics: {
        // Ambil data sesuai key di Python kamu
        growth: alert.trend_growth ? `+${alert.trend_growth.toFixed(1)}%` : 
                alert.market_share_percent ? `${alert.market_share_percent}% Share` : 'N/A',
        velocity: alert.velocity_score ? alert.velocity_score.toFixed(1) : 
                  alert.refund_rate ? `Risk: ${(alert.refund_rate * 100).toFixed(1)}%` : 'N/A',
        score: alert.score,
        category: alert.category || alert.product || 'N/A',
        detected: alert.detected_at
      },
      aiInsight: alert.ai_insight || 'AI recommends immediate review of this category.'
    };
  }));
  setLoading(false);
});
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="alert-container">
      <div className="alert-header">
        <h2>Alert & Insight Engine</h2>
        <p>Real-time notifications and actionable intelligence</p>
      </div>

      <div className="alert-list">
        <div className="section-title">
          <h3>Recent Alerts</h3>
          <span className="badge-urgent">{alerts.length} Alerts</span>
        </div>
        {loading && <div style={{padding: '20px', textAlign: 'center'}}>Loading alerts...</div>}
        {error && <div style={{padding: '20px', color: 'red'}}>Error: {error}</div>}
        {!loading && !error && alerts.length === 0 && <div style={{padding: '20px'}}>No alerts found.</div>}
        {!loading && !error && alerts.map((alert) => (
          <div key={alert.id} className={`alert-card border-${alert.type}`}>
            <div className="alert-main-info">
              <div className="alert-icon-wrapper">
                {alert.type === 'trend' && <Flame className="icon-trend" size={20} />}
                {alert.type === 'saturation' && <AlertTriangle className="icon-warn" size={20} />}
                {alert.type === 'refund' && <ShieldAlert className="icon-danger" size={20} />}
                {alert.type === 'opportunity' && <Lightbulb className="icon-info" size={20} />}
              </div>
              
              <div className="alert-text-content">
                <div className="alert-title-row">
                  <span className="alert-title-text">{alert.title}</span>
                  <span className={`severity-tag ${(alert.severity || 'High').toLowerCase()}`}>{alert.severity || 'High'}</span>
                </div>
                <p className="alert-desc">{alert.description}</p>
                <span className="alert-time">{alert.time}</span>
              </div>

              <button className="btn-view-details" onClick={() => alert.id && toggleExpand(alert.id)}>
                {expandedId === alert.id ? 'Hide Details' : 'View Details'}
                {expandedId === alert.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {/* Expandable Section: Trend Metrics & AI Insight */}
            {expandedId === alert.id && (
              <div className="alert-expanded-content">
                <div className="metrics-grid">
                  <div className="metric-box">
                    <span>Trend Growth</span>
                    <strong>{alert.metrics?.growth || 'N/A'}</strong>
                  </div>
                  <div className="metric-box">
                    <span>Mention Velocity</span>
                    <strong>{alert.metrics?.velocity || 'N/A'}</strong>
                  </div>
                  <div className="metric-box">
                    <span>Opportunity Score</span>
                    <strong>{alert.metrics?.score ? `${alert.metrics.score}/100` : 'N/A'}</strong>
                  </div>
                  <div className="metric-box">
                    <span>Category</span>
                    <strong>{alert.metrics?.category || 'N/A'}</strong>
                  </div>
                  <div className="metric-box">
                    <span>Detected At</span>
                    <strong>{alert.metrics?.detected || 'N/A'}</strong>
                  </div>
                </div>

                <div className="ai-insight-box">
                  <div className="ai-insight-header">
                    <Sparkles size={16} className="text-purple" />
                    <span>AI Recommendations</span>
                  </div>
                  <p>{alert.aiInsight}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertInsight;