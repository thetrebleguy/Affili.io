import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, AlertCircle, Zap, BarChart3 } from 'lucide-react';
import './TrendAnalysisDetail.css';

interface RevenueTrendData {
  [date: string]: number;
}

interface ProductTrend {
  product: string;
  growth_percent: number;
  status: string;
}

interface AnalyticsData {
  aggregated_data: {
    total_transactions: number;
    paid: number;
    refunded: number;
    refund_rate_percent: number;
    revenue: number;
    margin: number;
  };
  weekly_growth_badge: string;
  revenue_trend_last_7_days: RevenueTrendData;
  product_trend_movement: ProductTrend[];
  business_score: number;
}

interface TrendAnalysisDetailProps {
  onBack: () => void;
}

const TrendAnalysisDetail: React.FC<TrendAnalysisDetailProps> = ({ onBack }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/paylabs`);
      const result = await response.json();
      setData(result);
      generateAIInsight(result);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsight = (analytics: AnalyticsData) => {
    const growth = analytics.weekly_growth_badge;
    const refundRate = analytics.aggregated_data.refund_rate_percent;
    const revenue = analytics.aggregated_data.revenue;
    const margin = analytics.aggregated_data.margin;

    let insight = `📊 **Analisis Mingguan Bisnis Anda**\n\n`;
    
    if (analytics.business_score >= 75) {
      insight += `✅ Kesehatan bisnis sangat baik dengan skor ${analytics.business_score}/100.\n\n`;
    } else if (analytics.business_score >= 50) {
      insight += `⚠️ Kesehatan bisnis cukup dengan skor ${analytics.business_score}/100.\n\n`;
    } else {
      insight += `🔴 Kesehatan bisnis perlu perhatian (skor ${analytics.business_score}/100).\n\n`;
    }

    insight += `💰 **Performa Finansial:**\n`;
    insight += `- Total Revenue: Rp ${revenue.toLocaleString()}\n`;
    insight += `- Profit Margin: Rp ${margin.toLocaleString()}\n`;
    insight += `- Growth Trend: ${growth}\n\n`;

    insight += `📈 **Kesimpulan:**\n`;
    if (refundRate > 5) {
      insight += `⚠️ Refund rate tinggi (${refundRate}%) - tinjau kualitas produk atau customer service.\n`;
    } else {
      insight += `✅ Customer satisfaction optimal dengan refund rate ${refundRate}%.\n`;
    }

    const topGrowth = analytics.product_trend_movement.sort((a, b) => b.growth_percent - a.growth_percent)[0];
    if (topGrowth) {
      insight += `🚀 Produk terpopuler: ${topGrowth.product} (${topGrowth.growth_percent}% growth)`;
    }

    setAiInsight(insight);
  };

  if (loading) {
    return (
      <div className="trend-detail-container">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="trend-detail-container">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>
        <div className="loading">Error loading data</div>
      </div>
    );
  }

  const dates = Object.keys(data.revenue_trend_last_7_days).sort().reverse();
  const revenues = dates.map(date => data.revenue_trend_last_7_days[date]);
  const maxRevenue = Math.max(...revenues);
  const minRevenue = Math.min(...revenues);
  const range = maxRevenue - minRevenue || 1;

  const refundRate = data.aggregated_data.refund_rate_percent;
  const hasElevatedRefund = refundRate > 5;

  return (
    <div className="trend-detail-container">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={18} /> Back to Scanner
      </button>

      <div className="detail-header">
        <h1>Trend Analysis Detail</h1>
        <p className="subtitle">Comprehensive 7-Day Performance Overview</p>
      </div>

      {/* AI Insight Panel */}
      <div className="ai-insight-panel">
        <div className="ai-header">
          <Zap size={20} color="#fbbf24" />
          <h3>🧠 AI Insight</h3>
        </div>
        <div className="insight-content">
          {aiInsight.split('\n').map((line, i) => (
            <p key={i} className="insight-line">{line}</p>
          ))}
        </div>
      </div>

      <div className="detail-grid">
        {/* Revenue Trend */}
        <div className="detail-card">
          <div className="card-header">
            <h3>📊 Revenue Trend (7 Days)</h3>
            <span className="badge-growth">{data.weekly_growth_badge}</span>
          </div>

          <div className="chart-container">
            <div className="line-chart">
              {dates.map((date, idx) => {
                const revenue = data.revenue_trend_last_7_days[date];
                const height = ((revenue - minRevenue) / range) * 100;
                return (
                  <div key={date} className="chart-bar-wrapper">
                    <div className="chart-bar" style={{ height: `${height}%` }}>
                      <span className="bar-value">Rp {Math.round(revenue / 1000)}k</span>
                    </div>
                    <span className="bar-date">{new Date(date).toLocaleDateString('id-ID', { weekday: 'short', month: 'numeric', day: 'numeric' })}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="trend-stats">
            <div className="stat">
              <span className="stat-label">Daily Avg</span>
              <span className="stat-value">Rp {Math.round((revenues.reduce((a, b) => a + b) / dates.length) / 1000)}k</span>
            </div>
            <div className="stat">
              <span className="stat-label">Weekly Total</span>
              <span className="stat-value">Rp {Math.round(revenues.reduce((a, b) => a + b) / 1000)}k</span>
            </div>
            <div className="stat">
              <span className="stat-label">Peak Day</span>
              <span className="stat-value">Rp {Math.round(maxRevenue / 1000)}k</span>
            </div>
          </div>
        </div>

        {/* Transaction Overview */}
        <div className="detail-card">
          <div className="card-header">
            <h3>📦 Transaction Overview</h3>
            {hasElevatedRefund && <span className="badge-warning">⚠ Elevated Refund</span>}
          </div>

          <div className="transaction-stats">
            <div className="trans-stat">
              <span className="trans-label">Total Transactions</span>
              <span className="trans-value">{data.aggregated_data.total_transactions}</span>
            </div>
            <div className="trans-stat">
              <span className="trans-label">Paid</span>
              <span className="trans-value success">{data.aggregated_data.paid}</span>
            </div>
            <div className="trans-stat">
              <span className="trans-label">Refunded</span>
              <span className="trans-value danger">{data.aggregated_data.refunded}</span>
            </div>
            <div className="trans-stat">
              <span className="trans-label">Refund Rate</span>
              <span className={`trans-value ${refundRate > 5 ? 'danger' : 'success'}`}>{refundRate}%</span>
            </div>
          </div>

          <div className="mini-bar-chart">
            <div className="bar-item">
              <div className="bar-bg">
                <div className="bar-fill" style={{ width: `${(data.aggregated_data.paid / data.aggregated_data.total_transactions) * 100}%`, backgroundColor: '#22c55e' }}></div>
              </div>
              <span className="bar-label">Success Rate: {((data.aggregated_data.paid / data.aggregated_data.total_transactions) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Product Trend Movement */}
        <div className="detail-card full-width">
          <div className="card-header">
            <h3>📈 Product Trend Movement</h3>
          </div>

          <div className="product-table">
            <div className="table-header">
              <div className="col-product">Product</div>
              <div className="col-growth">Growth %</div>
              <div className="col-status">Status</div>
            </div>

            {data.product_trend_movement.map((product, idx) => (
              <div key={idx} className="table-row">
                <div className="col-product">
                  <p className="product-name">{product.product}</p>
                </div>
                <div className="col-growth">
                  <span className={`growth-badge ${product.growth_percent > 0 ? 'positive' : 'negative'}`}>
                    {product.growth_percent > 0 ? '+' : ''}{product.growth_percent.toFixed(1)}%
                  </span>
                </div>
                <div className="col-status">
                  <span className={`status-badge ${product.status === 'Rising' ? 'rising' : 'cooling'}`}>
                    {product.status === 'Rising' ? '🔥 Rising' : '❄️ Cooling'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Business Score Card */}
      <div className="business-score-card">
        <div className="score-circle">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" className="score-bg" />
            <circle
              cx="50"
              cy="50"
              r="45"
              className="score-fill"
              style={{
                strokeDasharray: `${(data.business_score / 100) * 282.7} 282.7`,
              }}
            />
          </svg>
          <div className="score-text">
            <span className="score-number">{data.business_score}</span>
            <span className="score-label">/100</span>
          </div>
        </div>
        <div className="score-info">
          <h4>Overall Business Health</h4>
          <p>
            {data.business_score >= 80
              ? 'Excellent performance! Your business is thriving.'
              : data.business_score >= 60
              ? 'Good performance. Keep improving key metrics.'
              : 'Need improvement. Focus on reducing refunds and increasing revenue.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrendAnalysisDetail;
