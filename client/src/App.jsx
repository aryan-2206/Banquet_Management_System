import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import DJLiveView from './pages/dj/DJLiveView';
import KitchenDashboard from './pages/kitchen/KitchenDashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  const renderPage = () => {
    switch(currentPage) {
      case 'landing':
        return <LandingPage onModuleClick={setCurrentPage} />;
      case 'dj':
        return <DJLiveView onBack={() => setCurrentPage('landing')} />;
      case 'kitchen':
        return <KitchenDashboard onBack={() => setCurrentPage('landing')} />;
      default:
        return <LandingPage onModuleClick={setCurrentPage} />;
    }
  };

  return (
    <div className="app">
      {/* Temporary Route Switcher */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 9999,
        background: 'rgba(0,0,0,0.8)',
        padding: '10px',
        borderRadius: '8px',
        color: 'white',
        fontSize: '12px'
      }}>
        <div style={{ marginBottom: '8px' }}>Quick Routes:</div>
        <button 
          onClick={() => setCurrentPage('landing')}
          style={{
            display: 'block',
            width: '100%',
            padding: '4px 8px',
            margin: '2px 0',
            background: currentPage === 'landing' ? '#C9A84C' : 'transparent',
            border: '1px solid #C9A84C',
            color: currentPage === 'landing' ? 'black' : '#C9A84C',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Landing
        </button>
        <button 
          onClick={() => setCurrentPage('kitchen')}
          style={{
            display: 'block',
            width: '100%',
            padding: '4px 8px',
            margin: '2px 0',
            background: currentPage === 'kitchen' ? '#E85555' : 'transparent',
            border: '1px solid #E85555',
            color: currentPage === 'kitchen' ? 'black' : '#E85555',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Kitchen
        </button>
        <button 
          onClick={() => setCurrentPage('dj')}
          style={{
            display: 'block',
            width: '100%',
            padding: '4px 8px',
            margin: '2px 0',
            background: currentPage === 'dj' ? '#E8C455' : 'transparent',
            border: '1px solid #E8C455',
            color: currentPage === 'dj' ? 'black' : '#E8C455',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          DJ View
        </button>
      </div>
      {renderPage()}
    </div>
  );
}