/**
 * Composant d'aide a la decision avec IA (DeepSeek)
 * Analyse les donnees et genere des recommandations intelligentes
 */

import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, Target, Lightbulb, RefreshCw, Zap, History, FileText } from 'lucide-react';
import deepseekService from '../services/deepseekService';
import analysisHistoryService from '../services/analysisHistoryService';
import AnalysisHistory from './AnalysisHistory';
import { exportRecommendationsToPDF } from '../utils/exportUtils';

const AIRecommendations = ({ dashboardData, surveys = [] }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    if (dashboardData && dashboardData.summary) {
      loadLastAnalysis();
    }
  }, [dashboardData]);

  const loadLastAnalysis = () => {
    setLoading(true);
    setError(null);

    try {
      // Charger la derniere analyse depuis l'historique
      const recentAnalyses = analysisHistoryService.getRecentAnalyses(1);
      
      if (recentAnalyses.length > 0) {
        const lastAnalysis = recentAnalyses[0];
        setRecommendations(lastAnalysis.full_analysis);
        setExecutiveSummary(''); // Le resume sera dans full_analysis
        setLastUpdated(new Date(lastAnalysis.timestamp));
        setIsFromCache(true);
        console.log('Derniere analyse chargee:', lastAnalysis.id);
      } else {
        // Aucune analyse precedente, generer une nouvelle
        console.log('Aucune analyse precedente trouvee, generation d\'une nouvelle analyse...');
        generateRecommendations();
      }
    } catch (error) {
      console.error('Erreur chargement derniere analyse:', error);
      // En cas d'erreur, generer une nouvelle analyse
      generateRecommendations();
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      // Generer recommandations et resume en parallele
      const [recommendationsResult, summaryResult] = await Promise.all([
        deepseekService.generateRecommendations(dashboardData, surveys),
        deepseekService.generateExecutiveSummary(dashboardData)
      ]);

      setRecommendations(recommendationsResult);
      setExecutiveSummary(summaryResult);
      setLastUpdated(new Date());
      setIsFromCache(false);
      
      // Sauvegarder l'analyse dans l'historique
      analysisHistoryService.saveAnalysis(recommendationsResult, dashboardData);
    } catch (error) {
      console.error('Erreur generation recommandations:', error);
      setError('Impossible de generer les recommandations. Service temporairement indisponible.');
      
      // Fallback avec recommandations de base
      setRecommendations(deepseekService.getFallbackRecommendations(dashboardData));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    console.log('Actualisation demandee - generation d\'une nouvelle analyse...');
    generateRecommendations();
  };

  const handleExportPDF = async () => {
    if (!recommendations) {
      alert('Aucune recommandation à exporter');
      return;
    }

    try {
      console.log('Export PDF des recommandations...');
      const result = await exportRecommendationsToPDF(recommendations, dashboardData, executiveSummary);
      
      if (result.success) {
        console.log(`PDF exporté avec succès: ${result.fileName}`);
        // Optionnel: afficher une notification de succès
      } else {
        console.error('Erreur export PDF:', result.error);
        alert(`Erreur lors de l'export PDF: ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur export PDF:', error);
      alert('Erreur lors de l\'export PDF');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getPriorityIcon = (index) => {
    const icons = [Target, Zap, TrendingUp];
    const colors = ['text-red-500', 'text-orange-500', 'text-blue-500'];
    const Icon = icons[index] || Lightbulb;
    return <Icon className={`w-5 h-5 ${colors[index] || 'text-gray-500'}`} />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center space-y-4 flex-col">
          <div className="animate-spin">
            <Brain className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Intelligence Artificielle en Analyse</h3>
            <p className="text-gray-600">Generation des recommandations en cours...</p>
            <div className="mt-3 bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700 flex items-center justify-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Motorise par DeepSeek AI</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Service IA Temporairement Indisponible</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reessayer</span>
          </button>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return null;
  }

  // Afficher l'historique si demandé
  if (showHistory) {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setShowHistory(false)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Brain className="w-4 h-4" />
            <span>Retour aux Recommandations</span>
          </button>
        </div>
        <AnalysisHistory />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tete avec score global */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Aide a la Decision IA</h2>
              <p className="text-blue-100">Analyse intelligente by DeepSeek</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-4 py-2 rounded-lg border-2 ${getScoreColor(recommendations.score_global)} bg-white`}>
              <span className="text-2xl font-bold">{recommendations.score_global?.toFixed(1) || 'N/A'}</span>
              <span className="text-sm ml-1">/10</span>
            </div>
            <p className="text-blue-100 text-sm mt-1">Score Global</p>
          </div>
        </div>
        
        {lastUpdated && (
          <div className="mt-4 flex items-center justify-between text-blue-100 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Derniere analyse: {lastUpdated.toLocaleString('fr-FR')}</span>
              {isFromCache && (
                <span className="bg-blue-700 bg-opacity-50 px-2 py-1 rounded text-xs">
                  📁 Chargee depuis l'historique
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
              
              <button
                onClick={handleExportPDF}
                disabled={loading || !recommendations}
                className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                <FileText className="w-4 h-4 mr-1" />
                Export PDF
              </button>
              
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
              >
                <History className="w-4 h-4 mr-1" />
                {showHistory ? 'Recommandations' : 'Historique'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Resume executif */}
      {executiveSummary && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <Target className="w-5 h-5 text-purple-500" />
            <span>Resume Executif</span>
          </h3>
          <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
            <p className="text-gray-700 leading-relaxed">{executiveSummary}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priorites principales */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <Target className="w-5 h-5 text-red-500" />
            <span>Priorites Strategiques</span>
          </h3>
          <div className="space-y-3">
            {recommendations.priorities?.map((priority, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {getPriorityIcon(index)}
                <div className="flex-1">
                  <span className="font-medium text-gray-800">{priority}</span>
                  <div className="text-xs text-gray-500 mt-1">Priorite {index + 1}</div>
                </div>
              </div>
            )) || <p className="text-gray-500">Aucune priorite identifiee</p>}
          </div>
        </div>

        {/* Alertes */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span>Alertes & Points d'Attention</span>
          </h3>
          <div className="space-y-3">
            {recommendations.alerts?.length > 0 ? (
              recommendations.alerts.map((alert, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-red-800 text-sm">{alert}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-800 text-sm">Aucune alerte critique detectee</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommandations detaillees */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <span>Recommandations Detaillees</span>
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {recommendations.recommendations?.map((rec, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-gray-800 text-sm">{rec.category}</h4>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{rec.timeline}</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-red-600">Probleme:</span>
                  <p className="text-gray-700 mt-1">{rec.issue}</p>
                </div>
                
                <div>
                  <span className="font-medium text-green-600">Action:</span>
                  <p className="text-gray-700 mt-1">{rec.action}</p>
                </div>
                
                <div>
                  <span className="font-medium text-purple-600">Impact:</span>
                  <p className="text-gray-700 mt-1">{rec.impact}</p>
                </div>
              </div>
            </div>
          )) || <p className="text-gray-500 col-span-2">Aucune recommandation specifique disponible</p>}
        </div>
      </div>

      {/* Prochaines actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-500" />
          <span>Plan d'Action 30 Jours</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recommendations.next_actions?.map((action, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="bg-blue-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                {index + 1}
              </div>
              <span className="text-blue-800 text-sm font-medium">{action}</span>
            </div>
          )) || <p className="text-gray-500 col-span-3">Aucune action planifiee</p>}
        </div>
      </div>

      {/* Analyse des tendances */}
      {recommendations.trends && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span>Analyse des Tendances</span>
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 leading-relaxed">{recommendations.trends}</p>
          </div>
        </div>
      )}

      {/* Debug info en mode dev */}
      {process.env.NODE_ENV === 'development' && recommendations.raw_response && (
        <div className="bg-gray-800 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-2">Debug - Reponse IA brute:</h4>
          <pre className="text-gray-300 text-xs overflow-auto max-h-40 bg-gray-900 p-3 rounded">
            {recommendations.raw_response}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;
