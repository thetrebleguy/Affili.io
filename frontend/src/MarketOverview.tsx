import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { 
  AreaChart, Area, 
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import './MarketOverview.css';

interface RisingCategory {
  category: string;
  growth_percent: number;
  change_from_yesterday: number;
}

interface DecliningCategory {
  category: string;
  growth_percent: number;
  change_from_yesterday: number;
}

interface MarketOverviewData {
  rising_categories: RisingCategory[];
  declining_categories: DecliningCategory[];
  avg_trend_velocity: {
    value_percent: number;
    momentum: string;
  };
  market_trend_growth: {
    labels: string[];
    categories: { [key: string]: number[] };
  };
  market_share: { category: string; percentage: number }[];
  trend_velocity_score: { category: string; score: number }[];
}

const MarketOverview: React.FC = () => {
  const [data, setData] = useState<MarketOverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // @ts-ignore
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  useEffect(() => {
    setLoading(true);
    setError(null);
    
      fetch(`${API_BASE_URL}/market-overview`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch market overview');
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Market overview fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <main className="content-body">
          <div style={{padding: '40px', textAlign: 'center'}}>
            <p>Loading market overview...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-wrapper">
        <main className="content-body">
          <div style={{padding: '40px', textAlign: 'center', color: 'red'}}>
            Error: {error}
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dashboard-wrapper">
        <main className="content-body">
          <div style={{padding: '40px', textAlign: 'center'}}>
            <p>No data available</p>
          </div>
        </main>
      </div>
    );
  }

  // Transform data for chart
  const transformTrendData = (trendGrowth: any) => {
    const { labels, categories } = trendGrowth;
    return labels.map((date: string, idx: number) => {
      const dataPoint: any = { date: date.split('-')[2] + '/' + date.split('-')[1] };
      Object.entries(categories).forEach(([category, values]: [string, any]) => {
        dataPoint[category] = values[idx];
      });
      return dataPoint;
    });
  };

  // Get stacked area data
  const getStackedAreaData = (trendGrowth: any) => {
    const colors = ['#a855f7', '#ec4899', '#06b6d4', '#3b82f6'];
    return Object.keys(trendGrowth.categories).map((name, idx) => ({
      name,
      color: colors[idx % colors.length]
    }));
  };

  // Get pie chart colors
  const getPieColors = () => {
    return ['#a855f7', '#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4'];
  };

  // Get distinct colors for each category
  const getChartColors = () => {
    const colors = [
      '#a855f7', // purple
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // yellow
      '#ef4444', // red
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#8b5cf6', // violet
      '#14b8a6', // teal
      '#f97316'  // orange
    ];
    return colors;
  };

  return (
    <div className="dashboard-wrapper">
      <main className="content-body">
        <div className="overview-header">
          <div>
            <h2>Market Trend Overview</h2>
            <p>Real-time insights into category performance and trend velocity</p>
          </div>
        </div>

        {/* KPI Cards Grid - Main Focus */}
        <div className="kpi-grid">
          {/* Rising Categories KPI */}
          <div className="card">
            <div className="kpi-card">
              <div className="kpi-info">
                <label>RISING CATEGORIES</label>
                <div className="kpi-value">{data.rising_categories.length}</div>
                <div className="trend up">
                  <span>↑ <span style={{color:'#22d3a7', fontWeight:700}}>+{data.rising_categories.reduce((sum, cat) => sum + cat.change_from_yesterday, 0)}</span> from yesterday</span>
                </div>
              </div>
              <div className="kpi-icon-bg purple">
                <TrendingUp size={32} />
              </div>
            </div>
          </div>

          {/* Declining Categories KPI */}
          <div className="card">
            <div className="kpi-card">
              <div className="kpi-info">
                <label>DECLINING CATEGORIES</label>
                <div className="kpi-value">{data.declining_categories.length}</div>
                <div className="trend down">
                  <span>↓ <span style={{color:'#fbbf24', fontWeight:700}}>{data.declining_categories.reduce((sum, cat) => sum + cat.change_from_yesterday, 0)}</span> from yesterday</span>
                </div>
              </div>
              <div className="kpi-icon-bg blue">
                <TrendingDown size={32} />
              </div>
            </div>
          </div>

          {/* Avg Trend Velocity KPI */}
          <div className="card">
            <div className="kpi-card">
              <div className="kpi-info">
                <label>AVG TREND VELOCITY</label>
                <div className="kpi-value">{data.avg_trend_velocity.value_percent.toFixed(1)}</div>
                <div className="trend up">
                  <span style={{color:'#22d3a7', fontWeight:700}}>{data.avg_trend_velocity.momentum}</span>
                </div>
              </div>
              <div className="kpi-icon-bg green">
                <Activity size={32} />
              </div>
            </div>
          </div>
        </div>

        {/* Category Details Section */}
        {/* Rising Categories */}
<div className="category-section centered">
  <div className="section-header centered">
    <TrendingUp size={20} className="icon-green" />
    <h3>Rising Categories</h3>
  </div>
  <div className="category-list-wrapper centered">
    {data.rising_categories.map((cat, idx) => (
      <div key={idx} className="category-pill rising">
        <span className="pill-name">{cat.category}</span>
        <div className="pill-stats">
          <span className="pill-growth">+{cat.growth_percent.toFixed(1)}%</span>
          <span className="pill-change">
            {cat.change_from_yesterday > 0 ? '↑' : '↓'} {Math.abs(cat.change_from_yesterday)}
          </span>
        </div>
      </div>
    ))}
  </div>
</div>

{/* Declining Categories */}
<div className="category-section centered">
  <div className="section-header centered">
    <TrendingDown size={20} className="icon-red" />
    <h3>Declining Categories</h3>
  </div>
  <div className="category-list-wrapper centered">
    {data.declining_categories.map((cat, idx) => (
      <div key={idx} className="category-pill declining">
        <span className="pill-name">{cat.category}</span>
        <div className="pill-stats">
          <span className="pill-growth">{cat.growth_percent.toFixed(1)}%</span>
          <span className="pill-change">
            {cat.change_from_yesterday < 0 ? '↓' : '↑'} {Math.abs(cat.change_from_yesterday)}
          </span>
        </div>
      </div>
    ))}
  </div>
</div>

        {/* Two Column Layout */}
        <div className="two-column-layout">
          {/* Category Trend Growth */}
          <div className="trend-chart-section">
            <div className="section-header">
              <BarChart3 size={20} className="icon-yellow" />
              <div>
                <h3>Category Trend Growth (7 Days)</h3>
                <p className="section-subtitle">Search volume and engagement metrics</p>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={transformTrendData(data.market_trend_growth)}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorGradient1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorGradient2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorGradient3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorGradient4" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8"
                    style={{ fontSize: '0.85rem' }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    style={{ fontSize: '0.85rem' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(15, 15, 35, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: '#e2e8f0',
                      fontSize: '0.85rem'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: '#94a3b8', fontSize: '0.85rem' }}
                  />
                  {getStackedAreaData(data.market_trend_growth).map((item, idx) => (
                    <Area
                      key={item.name}
                      type="monotone"
                      dataKey={item.name}
                      stackId="1"
                      stroke={item.color}
                      fill={`url(#colorGradient${(idx % 4) + 1})`}
                      isAnimationActive={true}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Market Share Pie Chart */}
          <div className="market-share-section">
            <div className="section-header">
              <PieChartIcon size={20} className="icon-blue" />
              <div>
                <h3>Market Share</h3>
                <p className="section-subtitle">By product category</p>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.market_share}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.category} ${entry.percentage.toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="percentage"
                  >
                    {data.market_share.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getPieColors()[index % getPieColors().length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(15, 15, 35, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: '#e2e8f0',
                      fontSize: '0.85rem'
                    }}
                    formatter={(value: any) => `${(value as number).toFixed(1)}%`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Trend Velocity Score - Horizontal Bar */}
        <div className="velocity-section">
          <div className="section-header">
            <BarChart3 size={20} className="icon-purple" />
            <div>
              <h3>Trend Velocity Score</h3>
              <p className="section-subtitle">Rate of trend acceleration by category (0-100)</p>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data.trend_velocity_score}
                margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="#94a3b8" style={{ fontSize: '0.85rem' }} />
                <YAxis 
                  type="category" 
                  dataKey="category" 
                  stroke="#94a3b8" 
                  style={{ fontSize: '0.85rem' }}
                />
                <Tooltip 
                  contentStyle={{
                    background: 'rgba(15, 15, 35, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: '#e2e8f0',
                    fontSize: '0.85rem'
                  }}
                  formatter={(value: any) => `${(value as number).toFixed(1)}`}
                />
                <Bar 
                  dataKey="score" 
                  fill="#a78bfa"
                  radius={[0, 8, 8, 0]}
                  isAnimationActive={true}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MarketOverview;