import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import DJLiveView from './pages/dj/DJLiveView';
import KitchenDashboard from './pages/kitchen/KitchenDashboard';
import SalesDashboard from './pages/sales/SalesDashboard';
import ClientDashboard from './pages/client-portal/ClientDashboard';
import FinanceDashboard from './pages/finance/FinanceDashboard';
import GREDashboard from './pages/gre/GREDashboard';

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
      case 'sales':
        return <SalesDashboard onBack={() => setCurrentPage('landing')} />;
      case 'client':
        return <ClientDashboard onBack={() => setCurrentPage('landing')} />;
      case 'finance':
        return <FinanceDashboard onBack={() => setCurrentPage('landing')} />;
      case 'gre':
        return <GREDashboard onBack={() => setCurrentPage('landing')} />;
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
        <button 
          onClick={() => setCurrentPage('sales')}
          style={{
            display: 'block',
            width: '100%',
            padding: '4px 8px',
            margin: '2px 0',
            background: currentPage === 'sales' ? '#5B8FE8' : 'transparent',
            border: '1px solid #5B8FE8',
            color: currentPage === 'sales' ? 'black' : '#5B8FE8',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sales
        </button>
        <button 
          onClick={() => setCurrentPage('client')}
          style={{
            display: 'block',
            width: '100%',
            padding: '4px 8px',
            margin: '2px 0',
            background: currentPage === 'client' ? '#C9A84C' : 'transparent',
            border: '1px solid #C9A84C',
            color: currentPage === 'client' ? 'black' : '#C9A84C',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Client Portal
        </button>
        <button 
          onClick={() => setCurrentPage('finance')}
          style={{
            display: 'block',
            width: '100%',
            padding: '4px 8px',
            margin: '2px 0',
            background: currentPage === 'finance' ? '#16a34a' : 'transparent',
            border: '1px solid #16a34a',
            color: currentPage === 'finance' ? 'black' : '#16a34a',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Finance
        </button>
        <button 
          onClick={() => setCurrentPage('gre')}
          style={{
            display: 'block',
            width: '100%',
            padding: '4px 8px',
            margin: '2px 0',
            background: currentPage === 'gre' ? '#f59e0b' : 'transparent',
            border: '1px solid #f59e0b',
            color: currentPage === 'gre' ? 'black' : '#f59e0b',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          GRE
        </button>
      </div>
      {renderPage()}
    </div>
  );
}