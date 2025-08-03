import React, { useState, useEffect } from 'react';
import DashboardStats from './DashboardStats';
import SurveyCharts from './SurveyCharts';
import SurveyTable from './SurveyTable';
import { useLanguage } from '../hooks/useLanguage';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedLanguage, languageData } = useLanguage();

  const text = languageData[selectedLanguage] || languageData.fr;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/dashboard');
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
      } else {
        setError('Erreur lors du chargement des données');
      }
    } catch (error) {
      console.error('Erreur API:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
    { id: 'charts', label: 'Graphiques', icon: '📈' },
    { id: 'surveys', label: 'Enquêtes', icon: '📝' },
    { id: 'export', label: 'Export', icon: '💾' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center space-x-3">
            <span className="text-red-500 text-xl">⚠️</span>
            <div>
              <h3 className="text-red-800 font-medium">Erreur</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">NA</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dashboard Admin - Aéroport Nador
                </h1>
                <p className="text-gray-600">
                  Plateforme de satisfaction des passagers
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={fetchDashboardData}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>🔄</span>
                <span>Actualiser</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <DashboardStats data={dashboardData} />
        )}
        
        {activeTab === 'charts' && (
          <SurveyCharts data={dashboardData} />
        )}
        
        {activeTab === 'surveys' && (
          <SurveyTable />
        )}
        
        {activeTab === 'export' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Exporter les données
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📊</span>
                  <div className="text-left">
                    <div className="font-medium">Export Excel</div>
                    <div className="text-sm text-gray-600">Données complètes</div>
                  </div>
                </div>
              </button>
              
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📄</span>
                  <div className="text-left">
                    <div className="font-medium">Export PDF</div>
                    <div className="text-sm text-gray-600">Rapport synthèse</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
