import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BarChart3, 
  Percent, 
  DollarSign, 
  TrendingDown, 
  RotateCcw,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import './IncomeSimulator.css';

const IncomeSimulator: React.FC = () => {
  // State untuk Simulation Parameters dari input user
  const [userId, setUserId] = useState<number>(1);
  const [productName, setProductName] = useState<string>('Test Product');
  const [traffic, setTraffic] = useState<number>(1000);
  const [commRate, setCommRate] = useState<number>(25);
  const [opCosts, setOpCosts] = useState<number>(500);

  // State untuk hasil backend
  const [results, setResults] = useState({
    conversions: 0,
    grossRevenue: 0,
    commissionEarned: 0,
    netIncome: 0,
    roi: 0,
    incomeMin: 0,
    incomeMax: 0,
    opportunityScore: 0,
    ctr: 0,
    cr: 0,
    aiInsight: ''
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch dari backend saat user_id atau product_name berubah
  useEffect(() => {
    setLoading(true);
    setError(null);
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    fetch(`${API_BASE_URL}/analyze?user_id=${userId}&product_name=${productName}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch analysis data');
        return res.json();
      })
      .then((data) => {
        const metrics = data.metrics || {};
        const incomeMin = metrics.income_min || 0;
        const incomeMax = metrics.income_max || 0;
        const avgIncome = (incomeMin + incomeMax) / 2;
        
        // Hitungan tambahan berdasarkan traffic dan commission rate
        const estimatedClicks = (traffic * (metrics.ctr || 0)) / 100;
        const estimatedSales = estimatedClicks * ((metrics.cr || 0) / 100);
        const commissionEarned = (avgIncome * (commRate / 100)) * Math.max(1, traffic / 1000);
        const netIncome = commissionEarned - opCosts;
        const roi = opCosts > 0 ? (netIncome / opCosts) * 100 : 0;

        setResults({
          conversions: Math.floor(estimatedSales),
          grossRevenue: Math.floor(avgIncome * Math.max(1, traffic / 1000)),
          commissionEarned: Math.floor(commissionEarned),
          netIncome: Math.floor(netIncome),
          roi: Math.round(roi * 10) / 10,
          incomeMin: Math.floor(incomeMin),
          incomeMax: Math.floor(incomeMax),
          opportunityScore: data.opportunity_score || 0,
          ctr: metrics.ctr || 0,
          cr: metrics.cr || 0,
          aiInsight: data.ai_insight || 'No AI insight available'
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error('Analysis fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [userId, productName]);

  const resetToDefaults = () => {
    setUserId(1);
    setProductName('Test Product');
    setTraffic(1000);
    setCommRate(25);
    setOpCosts(500);
  };

  return (
    <div className="simulator-container">
      <div className="simulator-header">
        <h2>Income Simulator</h2>
        <p>What-if analysis for strategic planning</p>
      </div>

      <div className="simulator-grid">
        {/* Panel Kiri: Simulation Parameters */}
        <section className="panel parameter-panel">
          <h3>Simulation Parameters</h3>
          
          {error && <div style={{padding: '10px', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '15px'}}>{error}</div>}
          {loading && <div style={{padding: '10px', background: '#e3f2fd', color: '#1976d2', borderRadius: '4px', marginBottom: '15px'}}>Loading data from backend...</div>}

          <div className="input-group">
            <div className="input-header">
              <span><Users size={16} /> User ID</span>
              <span className="badge">{userId}</span>
            </div>
            <input type="number" min="1" max="1000" value={userId} onChange={(e) => setUserId(Number(e.target.value))} style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}} />
            <div className="range-labels"><span>Select user (1-1000)</span></div>
          </div>

          <div className="input-group">
            <div className="input-header">
              <span><BarChart3 size={16} /> Product Name</span>
              <span className="badge">{productName}</span>
            </div>
            <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. wireless, sneakers, headphones" style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}} />
            <div className="range-labels"><span>Search for product</span></div>
          </div>

          <div className="input-group">
            <div className="input-header">
              <span><Users size={16} /> Monthly Traffic</span>
              <span className="badge">{traffic.toLocaleString()} visits</span>
            </div>
            <input type="range" min="1000" max="50000" step="1000" value={traffic} onChange={(e) => setTraffic(Number(e.target.value))} />
            <div className="range-labels"><span>1K</span><span>50K</span></div>
          </div>

          <div className="input-group">
            <div className="input-header">
              <span><Percent size={16} /> Commission Rate</span>
              <span className="badge">{commRate}%</span>
            </div>
            <input type="range" min="5" max="50" value={commRate} onChange={(e) => setCommRate(Number(e.target.value))} />
            <div className="range-labels"><span>5%</span><span>50%</span></div>
          </div>

          <div className="input-group">
            <div className="input-header">
              <span><DollarSign size={16} /> Operating Costs</span>
              <span className="badge">${opCosts}</span>
            </div>
            <input type="range" min="0" max="2000" step="100" value={opCosts} onChange={(e) => setOpCosts(Number(e.target.value))} />
            <div className="range-labels"><span>$0</span><span>$2K</span></div>
          </div>

          <button className="btn-reset" onClick={resetToDefaults}>
            <RotateCcw size={16} /> Reset to Defaults
          </button>
        </section>

        {/* Panel Kanan: Projected Results */}
        <section className="results-column">
          <div className="panel results-panel">
            <h3>Backend Analysis Results</h3>
            
            <div className="result-card">
              <div>
                <p>Income Range</p>
                <h4>${results.incomeMin.toLocaleString()} - ${results.incomeMax.toLocaleString()}</h4>
              </div>
              <DollarSign className="icon-blue" />
            </div>

            <div className="result-card">
              <div>
                <p>Click-Through Rate</p>
                <h4>{results.ctr.toFixed(2)}%</h4>
              </div>
              <BarChart3 className="icon-purple" />
            </div>

            <div className="result-card">
              <div>
                <p>Conversion Rate</p>
                <h4>{results.cr.toFixed(2)}%</h4>
              </div>
              <Percent className="icon-green" />
            </div>

            <div className="result-card">
              <div>
                <p>Opportunity Score</p>
                <h4 className="text-green">{results.opportunityScore.toFixed(1)}/100</h4>
              </div>
              <Sparkles className="icon-green" />
            </div>
          </div>

          {/* Projected Results */}
          <div className="panel results-panel">
            <h3>Projected Monthly Results</h3>
            
            <div className="result-card">
              <div>
                <p>Est. Conversions</p>
                <h4>{results.conversions}</h4>
              </div>
              <Users className="icon-purple" />
            </div>

            <div className="result-card">
              <div>
                <p>Gross Revenue</p>
                <h4>${results.grossRevenue.toLocaleString()}</h4>
              </div>
              <DollarSign className="icon-blue" />
            </div>

            <div className="result-card">
              <div>
                <p>Commission Earned</p>
                <h4 className="text-green">${results.commissionEarned.toLocaleString()}</h4>
              </div>
              <Percent className="icon-green" />
            </div>

            <div className="result-card">
              <div>
                <p>Operating Costs</p>
                <h4 className="text-red">-${opCosts}</h4>
              </div>
              <TrendingDown className="icon-red" />
            </div>
          </div>

          {/* Net Income Panel */}
          <div className="panel net-income-panel">
            <p>NET MONTHLY INCOME</p>
            <h2 className="text-green">${results.netIncome.toLocaleString()}</h2>
            <div className="roi-badge">ROI: {results.roi.toFixed(1)}%</div>
          </div>
        </section>
      </div>

      {/* AI Recommendations */}
      <div className="panel recommendations">
        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px'}}>
          <Sparkles size={20} className="text-purple" />
          <h3 style={{margin: 0}}>AI Recommendations</h3>
        </div>
        {loading && <p><em>Loading AI insights...</em></p>}
        {error && <p style={{color: '#c62828'}}><em>Error: {error}</em></p>}
        {!loading && results.aiInsight && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(103, 58, 183, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)',
            padding: '15px',
            borderRadius: '8px',
            borderLeft: '4px solid #7c3aed',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6',
            fontSize: '14px',
            color: '#333'
          }}>
            {results.aiInsight}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeSimulator;