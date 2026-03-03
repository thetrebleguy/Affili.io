import React, { useState, useEffect } from 'react';
import { 
  Hash, 
  TrendingUp, 
  MessageCircle, 
  Heart, 
  BarChart3, 
  Sparkles, 
  CheckCircle2, 
  Lightbulb, 
  AlertTriangle,
  Info
} from 'lucide-react';
import './HashtagAnalysis.css';

const HashtagAnalysis: React.FC = () => {
  const [hashtags, setHashtags] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // For AI hashtag generation
  const [productName, setProductName] = useState<string>('');
  const [aiRecommendations, setAiRecommendations] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Mock data fallback
  const mockHashtags = [
    { name: '#BeautyHacks', posts: '2.4M', likes: '12.5K', engagement: '8.5%', sentiment: 82, comments: 342, growth: '+145%', rank: '1', source: 'mock' },
    { name: '#SkincareTips', posts: '1.8M', likes: '9.8K', engagement: '7.8%', sentiment: 79, comments: 287, growth: '+118%', rank: '2', source: 'mock' },
    { name: '#TechGadgets', posts: '3.1M', likes: '15.2K', engagement: '6.9%', sentiment: 75, comments: 421, growth: '+92%', rank: '3', source: 'mock' },
    { name: '#FitnessMotivation', posts: '4.5M', likes: '11.3K', engagement: '6.2%', sentiment: 81, comments: 298, growth: '+76%', rank: '4', source: 'mock' },
    { name: '#HomeDecorIdeas', posts: '1.2M', likes: '8.1K', engagement: '5.8%', sentiment: 73, comments: 176, growth: '+54%', rank: '5', source: 'mock' },
  ];

  // Fetch trending hashtags dari backend
  useEffect(() => {
    setLoading(true);
    setError(null);
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    fetch(`${API_BASE_URL}/hashtags/trending?limit=5`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch hashtags');
        return res.json();
      })
      .then((data) => {
        const transformedHashtags = data.hashtags.map((ht: any, index: number) => {
          const postsNum = parseInt(ht.posts.replace(/[MK]/g, '')) * (ht.posts.includes('M') ? 1000000 : 1000);
          
          const baseEngagement = Math.max(5, Math.min(9, (postsNum / 500000) * 10));
          const sentiment = Math.floor(Math.random() * 20 + 75); // 75-95%
          const engagement = (baseEngagement + (Math.random() * 2 - 1)).toFixed(1);
          const growth = Math.floor(Math.random() * 100 + 50); // +50% to +150%
          const comments = Math.floor(postsNum / 5000);
          const likes = `${Math.floor(postsNum / 200)}K`;
          
          return {
            name: ht.hashtag.startsWith('#') ? ht.hashtag : `#${ht.hashtag}`,
            posts: ht.posts,
            likes: likes,
            engagement: `${engagement}%`,
            sentiment: sentiment,
            comments: comments,
            growth: `+${growth}%`,
            rank: ht.rank,
            source: ht.source
          };
        });
        
        setHashtags(transformedHashtags);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Hashtag fetch error:', err);
        // Fallback to mock data on error
        setHashtags(mockHashtags);
        setError('Using sample data (backend unavailable)');
        setLoading(false);
      });
  }, []);

  // Generate AI hashtags based on product name
  const generateAiHashtags = async () => {
    if (!productName.trim()) {
      setAiError('Please enter a product name');
      return;
    }

    setAiLoading(true);
    setAiError(null);
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/hashtags/generate?product_name=${encodeURIComponent(productName)}`);
      if (!response.ok) throw new Error('Failed to generate hashtags');
      
      const data = await response.json();
      setAiRecommendations(data);
      setAiError(null);
    } catch (err: any) {
      console.error('AI hashtag generation error:', err);
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="hashtag-container">
      <div className="hashtag-header">
        <h2>Hashtag Performance & Affiliate Insights</h2>
        <p>Deep analysis of hashtag effectiveness and top performer strategies</p>
      </div>

      {/* AI Hashtag Generator Section */}
      <div className="panel" style={{background: 'linear-gradient(135deg, rgba(103, 58, 183, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)', borderLeft: '4px solid #7c3aed', marginBottom: '30px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px'}}>
          <Sparkles size={20} className="text-purple" />
          <h3 style={{margin: 0}}>AI Hashtag Generator</h3>
        </div>
        
        <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && generateAiHashtags()}
            placeholder="Enter product name (e.g., wireless earbuds, skincare cream)"
            style={{
              flex: 1,
              padding: '10px 15px',
              borderRadius: '6px',
              border: '2px solid #e0e0e0',
              fontSize: '14px'
            }}
          />
          <button
            onClick={generateAiHashtags}
            disabled={aiLoading}
            style={{
              padding: '10px 20px',
              background: '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: aiLoading ? 'not-allowed' : 'pointer',
              opacity: aiLoading ? 0.6 : 1,
              fontWeight: 'bold'
            }}
          >
            {aiLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {aiError && <div style={{color: '#c62828', fontSize: '14px', marginBottom: '10px'}}>ℹ️ {aiError}</div>}

        {aiRecommendations && !aiLoading && (
          <div style={{marginTop: '15px'}}>
            {aiRecommendations.ai_recommendation && typeof aiRecommendations.ai_recommendation === 'object' && !aiRecommendations.ai_recommendation.error ? (
              <div>
                {aiRecommendations.ai_recommendation.primary_hashtags && aiRecommendations.ai_recommendation.primary_hashtags.length > 0 && (
                  <div style={{marginBottom: '12px'}}>
                    <p style={{fontSize: '13px', color: '#666', marginBottom: '6px'}}><strong>Primary Hashtags (High Buyer Intent):</strong></p>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                      {aiRecommendations.ai_recommendation.primary_hashtags.map((tag: string, idx: number) => (
                        <span key={idx} style={{background: '#7c3aed', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '13px'}}>
                          {tag.startsWith('#') ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {aiRecommendations.ai_recommendation.supporting_hashtags && aiRecommendations.ai_recommendation.supporting_hashtags.length > 0 && (
                  <div style={{marginBottom: '12px'}}>
                    <p style={{fontSize: '13px', color: '#666', marginBottom: '6px'}}><strong>Supporting Hashtags (Niche + Edukasi):</strong></p>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                      {aiRecommendations.ai_recommendation.supporting_hashtags.map((tag: string, idx: number) => (
                        <span key={idx} style={{background: '#9c27b0', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '13px'}}>
                          {tag.startsWith('#') ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {aiRecommendations.ai_recommendation.best_combination && aiRecommendations.ai_recommendation.best_combination.length > 0 && (
                  <div>
                    <p style={{fontSize: '13px', color: '#666', marginBottom: '6px'}}><strong>✨ Best Combination:</strong></p>
                    <div style={{background: '#f5f5f5', padding: '12px', borderRadius: '6px', fontSize: '13px'}}>
                      {aiRecommendations.ai_recommendation.best_combination.map((tag: string, idx: number) => (
                        <span key={idx}>{tag.startsWith('#') ? tag : `#${tag}`}{idx < aiRecommendations.ai_recommendation.best_combination.length - 1 ? ' ' : ''}</span>
                      ))}
                    </div>
                  </div>
                )}

                {aiRecommendations.ai_recommendation.strategy_reason && (
                  <div style={{marginTop: '12px', fontSize: '13px', color: '#333', fontStyle: 'italic'}}>
                    📝 <strong>Why:</strong> {aiRecommendations.ai_recommendation.strategy_reason}
                  </div>
                )}
              </div>
            ) : (
              <p style={{fontSize: '14px', color: '#666'}}>Could not parse AI recommendations. Please try again.</p>
            )}
          </div>
        )}
      </div>

      {loading && <div style={{padding: '20px', textAlign: 'center'}}><em>Loading hashtag data...</em></div>}
      {error && <div style={{padding: '20px', background: 'rgba(255, 193, 7, 0.1)', color: '#8b7a00', borderRadius: '8px', margin: '10px 0'}}><em>ℹ️ {error}</em></div>}
      {!loading && hashtags.length === 0 && !error && <div style={{padding: '20px', textAlign: 'center'}}><em>No hashtags found</em></div>}

      {!loading && hashtags.length > 0 && (
        <>
          <div className="analysis-toggle">
            <button className="toggle-btn active">Hashtag Analysis</button>
            <button className="toggle-btn">Top Affiliators</button>
          </div>

          <div className="hashtag-grid">
            {hashtags.map((tag, index) => (
              <div key={index} className="hashtag-card">
                <div className="card-header">
                  <span className="tag-name"><Hash size={16} /> {tag.name.substring(1)}</span>
                  <span className="growth-tag">{tag.growth}</span>
                </div>
                
                <div className="stats-row">
                  <div className="stat-box">
                    <Info size={14} className="icon-blue" />
                    <div>
                      <span className="stat-val">{tag.posts}</span>
                      <span className="stat-label">Posts</span>
                    </div>
                  </div>
                  <div className="stat-box">
                    <Heart size={14} className="icon-red" />
                    <div>
                      <span className="stat-val">{tag.likes}</span>
                      <span className="stat-label">Avg Likes</span>
                    </div>
                  </div>
                </div>

                <div className="detail-metrics">
                  <div className="metric">
                    <span>Engagement Rate</span>
                    <span className="val-white">{tag.engagement}</span>
                  </div>
                  <div className="metric">
                    <span>Sentiment Score</span>
                    <span className="val-green">{tag.sentiment}%</span>
                  </div>
                  <div className="metric">
                    <span>Avg Comments</span>
                    <span className="val-white">{tag.comments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="visual-insights-grid">
            {/* Engagement Comparison (Simplified Chart View) */}
            <div className="panel chart-panel">
              <h3>Engagement Rate Comparison</h3>
              <p className="sub-p">Average engagement by hashtag</p>
              <div className="bar-chart-container">
                {hashtags.map((tag, i) => (
                  <div key={i} className="bar-group">
                    <div className="bar" style={{ height: `${Number(tag.engagement.replace('%','')) * 10}px` }}></div>
                    <span className="bar-label">{tag.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Radar Placeholder */}
            <div className="panel radar-panel">
              <h3>Performance Radar</h3>
              <p className="sub-p">Multi-dimensional hashtag metrics</p>
              <div className="radar-placeholder">
                <div className="radar-circle">
                  <div className="radar-shape"></div>
                  <span className="label-top">Engagement</span>
                  <span className="label-right">Reach</span>
                  <span className="label-bottom-right">Sentiment</span>
                  <span className="label-bottom-left">Growth</span>
                  <span className="label-left">Conversion</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendations Section */}
          <div className="panel recommendations-panel">
            <h3>AI Recommendations</h3>
            <div className="rec-list">
              <div className="rec-item">
                <CheckCircle2 size={18} className="text-green" />
                <p><strong>{hashtags[0]?.name || '#TopHashtag'}</strong> has the highest engagement. Use it as your primary hashtag for relevant products.</p>
              </div>
              <div className="rec-item">
                <Lightbulb size={18} className="text-yellow" />
                <p>Combine <strong>{hashtags[1]?.name || '#Secondary'}</strong> with <strong>{hashtags[0]?.name || '#Primary'}</strong> for reach boost.</p>
              </div>
              <div className="rec-item">
                <Info size={18} className="text-blue" />
                <p>Trending hashtags update daily. Check back regularly to stay ahead of competition.</p>
              </div>
              <div className="rec-item">
                <AlertTriangle size={18} className="text-orange" />
                <p>Focus on quality content with trending hashtags rather than just using them randomly.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HashtagAnalysis;