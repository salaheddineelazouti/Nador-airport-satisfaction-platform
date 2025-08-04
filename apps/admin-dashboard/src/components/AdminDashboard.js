import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, FileText, Download, Settings, RotateCcw, LogOut, FileSpreadsheet, FileImage, Database, Bell, Users } from 'lucide-react';
import ondaLogo from '../assets/images/Logo office national des aeroports.png';
import LoginModal from './LoginModal';
import DashboardStats from './DashboardStats';
import SurveyCharts from './SurveyCharts';
import SurveyTable from './SurveyTable';
import { exportToExcel, exportToCSV, exportToPDF } from '../utils/exportUtils';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // TODO: Vérifier l'authentification depuis localStorage/sessionStorage
    const authToken = localStorage.getItem('admin-token');
    if (authToken) {
      setIsAuthenticated(true);
      fetchDashboardData();
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${apiUrl}/api/analytics/dashboard`);
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
      } else {
        setError('Erreur lors du chargement des données: ' + (result.message || 'Inconnue'));
      }
    } catch (error) {
      console.error('Erreur API:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (credentials) => {
    // TODO: Implémenter la vraie authentification
    console.log('Tentative de connexion:', credentials);
    
    // Simulation d'authentification
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      const token = 'mock-admin-token-' + Date.now();
      localStorage.setItem('admin-token', token);
      setIsAuthenticated(true);
      fetchDashboardData();
      return { success: true };
    }
    
    return { success: false, message: 'Identifiants incorrects' };
  };

  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    setIsAuthenticated(false);
    setDashboardData(null);
  };

  // Fonction pour afficher les notifications
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleExport = async (type) => {
    if (exportLoading) return;
    
    setExportLoading(true);
    
    try {
      let result;
      
      switch (type) {
        case 'excel':
          showNotification('Génération du fichier Excel en cours...', 'info');
          result = await exportToExcel();
          break;
        case 'csv':
          showNotification('Génération du fichier CSV en cours...', 'info');
          result = await exportToCSV();
          break;
        case 'pdf':
          showNotification('Génération du rapport PDF en cours...', 'info');
          result = await exportToPDF(dashboardData);
          break;
        default:
          throw new Error('Type d\'export non supporté');
      }
      
      if (result.success) {
        showNotification(`Fichier ${result.fileName} téléchargé avec succès !`, 'success');
      } else {
        throw new Error(result.error || 'Erreur lors de l\'export');
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      showNotification(`Erreur lors de l'export: ${error.message}`, 'error');
    } finally {
      setExportLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'charts', label: 'Graphiques', icon: TrendingUp },
    { id: 'surveys', label: 'Enquêtes', icon: FileText },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  // Affichage du modal de connexion si non authentifié
  if (!isAuthenticated) {
    return <LoginModal onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-admin-primary"></div>
          <p className="text-gray-600 text-lg">Chargement du dashboard admin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
            <div>
              <h3 className="text-red-800 font-medium text-lg">Erreur de connexion</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={fetchDashboardData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
            <button 
              onClick={handleLogout}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Se déconnecter
            </button>
          </div>
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
              <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center p-2">
                <img 
                  src={ondaLogo} 
                  alt="ONDA Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                  <span>Dashboard Administrateur</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-normal text-green-600">En ligne</span>
                  </div>
                </h1>
                <p className="text-gray-600 flex items-center space-x-2">
                  <span>Aéroport Nador Al Aroui - Plateforme de satisfaction</span>
                  <span className="text-admin-primary">•</span>
                  <span className="text-sm">Port 3001</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell size={20} />
                </button>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              
              {/* Indicateur utilisateurs en ligne */}
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                <Users size={16} />
                <span>3 admin</span>
              </div>
              
              {/* Heure de dernière mise à jour */}
              <div className="text-xs text-gray-500">
                MAJ: {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
              
              <button 
                onClick={fetchDashboardData}
                disabled={loading}
                className="flex items-center space-x-2 bg-admin-primary text-white px-4 py-2 rounded-lg hover:bg-admin-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw size={18} className={loading ? 'animate-spin' : ''} />
                <span>{loading ? 'Actualisation...' : 'Actualiser'}</span>
              </button>
              
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                <LogOut size={18} />
                <span>Déconnexion</span>
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
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-admin-primary text-admin-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="fade-in">
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
            <div className="bg-white rounded-lg shadow-admin p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Export des données
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <button 
                  onClick={() => handleExport('excel')}
                  disabled={exportLoading}
                  className={`p-6 border-2 border-green-200 bg-green-50 rounded-xl hover:bg-green-100 hover:border-green-300 transition-all duration-200 transform hover:scale-105 ${exportLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-600 p-3 rounded-lg">
                      <FileSpreadsheet className="text-white" size={28} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-green-800">Export Excel</div>
                      <div className="text-sm text-green-600">Données brutes complètes</div>
                      <div className="text-xs text-green-500 mt-1">Format .xlsx</div>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => handleExport('pdf')}
                  disabled={exportLoading}
                  className={`p-6 border-2 border-red-200 bg-red-50 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all duration-200 transform hover:scale-105 ${exportLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-red-600 p-3 rounded-lg">
                      <FileImage className="text-white" size={28} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-red-800">Rapport PDF</div>
                      <div className="text-sm text-red-600">Synthèse graphique</div>
                      <div className="text-xs text-red-500 mt-1">Format .pdf</div>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => handleExport('csv')}
                  disabled={exportLoading}
                  className={`p-6 border-2 border-blue-200 bg-blue-50 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 transform hover:scale-105 ${exportLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-600 p-3 rounded-lg">
                      <Database className="text-white" size={28} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-blue-800">Données CSV</div>
                      <div className="text-sm text-blue-600">Format tabulaire</div>
                      <div className="text-xs text-blue-500 mt-1">Format .csv</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center space-x-3">
                  <div className="bg-admin-primary p-3 rounded-lg">
                    <Settings className="text-white" size={24} />
                  </div>
                  <span>Paramètres administrateur</span>
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Configuration Système */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                      <h3 className="font-bold text-blue-900 mb-4 flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Configuration système</span>
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-700">Dashboard Admin</span>
                          <span className="font-mono bg-blue-100 px-2 py-1 rounded text-blue-900">:3001</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-blue-700">API Backend</span>
                          <span className="font-mono bg-blue-100 px-2 py-1 rounded text-blue-900">:5000</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-blue-700">Interface Utilisateur</span>
                          <span className="font-mono bg-blue-100 px-2 py-1 rounded text-blue-900">:3000</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-blue-700">Environnement</span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-medium">Développement</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                      <h3 className="font-bold text-green-900 mb-4 flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Statut des services</span>
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-green-700">API Backend</span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-medium">✓ Actif</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-green-700">Base de données</span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-medium">✓ Connectée</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-green-700">Interface Web</span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-medium">✓ Opérationnelle</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Sécurité et Authentification */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                      <h3 className="font-bold text-yellow-900 mb-4 flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>Sécurité</span>
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-yellow-700">Authentification</span>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">Activée</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-yellow-700">Mode</span>
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded font-medium">Développement</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-yellow-700">Session</span>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">LocalStorage</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                      <h3 className="font-bold text-purple-900 mb-4 flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span>Informations ONDA</span>
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-purple-700">Organisation</span>
                          <span className="text-purple-900 font-medium">ONDA</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-purple-700">Aéroport</span>
                          <span className="text-purple-900 font-medium">Nador Al Aroui</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-purple-700">Version</span>
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">v1.0.0</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-purple-700">Dernière MAJ</span>
                          <span className="text-purple-900 font-medium">{new Date().toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Composant de notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          notification.type === 'info' ? 'bg-blue-500 text-white' :
          'bg-gray-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' && <div className="w-5 h-5 bg-white bg-opacity-30 rounded-full flex items-center justify-center">✓</div>}
            {notification.type === 'error' && <div className="w-5 h-5 bg-white bg-opacity-30 rounded-full flex items-center justify-center">✗</div>}
            {notification.type === 'info' && <div className="w-5 h-5 bg-white bg-opacity-30 rounded-full flex items-center justify-center">i</div>}
            <span className="font-medium">{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
