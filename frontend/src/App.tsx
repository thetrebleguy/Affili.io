import React, { useState } from 'react';
import MainLayout from './MainLayout';
import MarketOverview from './MarketOverview';
import Scanner from './Scanner';
import IncomeSimulator from './IncomeSimulator';
import AlertInsight from './AlertInsight';
import HashtagAnalysis from './HashtagAnalysis';
import TrendAnalysisDetail from './TrendAnalysisDetail';

function App() {
  const [currentTab, setCurrentTab] = useState<string>('Overview');
  const [showTrendDetail, setShowTrendDetail] = useState(false);

  const renderContent = () => {
    if (showTrendDetail) {
      return <TrendAnalysisDetail onBack={() => setShowTrendDetail(false)} />;
    }

    switch (currentTab) {
      case 'Overview': 
        return <MarketOverview />;
      case 'Scanner': 
        return <Scanner onViewTrendAnalysis={() => setShowTrendDetail(true)} />; // Pass callback
      case 'Simulator': 
        return <IncomeSimulator />;
      case 'Alerts': 
        return <AlertInsight />;
      case 'Hashtags': 
        return <HashtagAnalysis />;
      default: 
        return <MarketOverview />;
    }
  };

  return (
    <MainLayout activeTab={currentTab} setActiveTab={setCurrentTab}>
      {renderContent()}
    </MainLayout>
  );
}

export default App;