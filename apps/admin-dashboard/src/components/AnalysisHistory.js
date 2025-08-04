/**
 * Composant d'historique des analyses IA
 * Affiche l'evolution des scores et tendances dans le temps
 */

import React, { useState, useEffect } from 'react';
import { 
  History, TrendingUp, TrendingDown, Minus, Calendar, Download, 
  Trash2, Eye, AlertTriangle, CheckCircle, Clock, BarChart3 
} from 'lucide-react';
import analysisHistoryService from '../services/analysisHistoryService';

const AnalysisHistory = () => {
  const [history, setHistory] = useState([]);
  const [trendStats, setTrendStats] = useState(null);
  const [categoryTrends, setCategoryTrends] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30); // Periode en jours

  useEffect(() => {
    loadHistoryData();
  }, [period]);

  const loadHistoryData = () => {
    setLoading(true);
    
    try {
      const historyData = analysisHistoryService.getHistory();
      const stats = analysisHistoryService.getTrendStats(period);
      const catTrends = analysisHistoryService.getCategoryTrends(period);
      
      setHistory(historyData);
      setTrendStats(stats);
      setCategoryTrends(catTrends);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportHistory = () => {
    analysisHistoryService.exportHistory();
  };

  const handleClearHistory = () => {
    if (analysisHistoryService.clearHistory()) {
      loadHistoryData();
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'declining':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin">
          <History className="w-8 h-8 text-blue-500" />
        </div>
        <span className="ml-3 text-gray-600">Chargement de l'historique...</span>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun Historique</h3>
        <p className="text-gray-600">
          Les analyses futures seront automatiquement sauvegardees ici pour suivre les tendances.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tete avec statistiques globales */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <History className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Historique des Analyses</h2>
              <p className="text-indigo-100">Suivi des tendances et evolution</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Selecteur de periode */}
            <select
              value={period}
              onChange={(e) => setPeriod(parseInt(e.target.value))}
              className="bg-white bg-opacity-20 text-white rounded-lg px-3 py-2 border border-white border-opacity-30"
            >
              <option value={7} className="text-gray-800">7 jours</option>
              <option value={30} className="text-gray-800">30 jours</option>
              <option value={90} className="text-gray-800">90 jours</option>
            </select>
            
            {/* Actions */}
            <button
              onClick={handleExportHistory}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-colors"
              title="Exporter l'historique"
            >
              <Download className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleClearHistory}
              className="bg-red-500 bg-opacity-50 hover:bg-opacity-70 p-2 rounded-lg transition-colors"
              title="Vider l'historique"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques de tendance */}
      {trendStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`bg-white rounded-lg p-4 border-2 ${getTrendColor(trendStats.score_trend)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tendance Score</p>
                <p className="text-2xl font-bold">{trendStats.score_change >= 0 ? '+' : ''}{trendStats.score_change.toFixed(2)}</p>
              </div>
              {getTrendIcon(trendStats.score_trend)}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Score Moyen</p>
                <p className="text-2xl font-bold text-gray-800">{trendStats.average_score?.toFixed(1) || 'N/A'}</p>
              </div>
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Analyses</p>
                <p className="text-2xl font-bold text-gray-800">{trendStats.analysis_count}</p>
              </div>
              <History className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Periode</p>
                <p className="text-2xl font-bold text-gray-800">{period}j</p>
              </div>
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des analyses */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span>Analyses Recentes ({history.length})</span>
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.map((analysis) => (
                <div
                  key={analysis.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedAnalysis(analysis)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(analysis.score_global)}`}>
                        {analysis.score_global?.toFixed(1) || 'N/A'}/10
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{analysis.date} à {analysis.time}</p>
                        <p className="text-sm text-gray-500">{analysis.total_surveys} enquêtes analysées</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {analysis.alerts_count > 0 && (
                        <div className="flex items-center text-red-500">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          <span className="text-sm">{analysis.alerts_count}</span>
                        </div>
                      )}
                      <Eye className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  
                  {analysis.trends_summary && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {analysis.trends_summary}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tendances par categorie */}
        <div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span>Tendances Catégories</span>
            </h3>
            
            {categoryTrends.length > 0 ? (
              <div className="space-y-3">
                {categoryTrends.slice(0, 6).map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-800">{trend.category_label}</p>
                      <p className="text-xs text-gray-500">
                        {trend.first_value.toFixed(1)} → {trend.last_value.toFixed(1)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${trend.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.change > 0 ? '+' : ''}{trend.change.toFixed(2)}
                      </span>
                      {trend.trend === 'improving' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Minus className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Pas assez de données pour détecter les tendances</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de detail d'analyse */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Analyse du {selectedAnalysis.date} à {selectedAnalysis.time}
                </h3>
                <button
                  onClick={() => setSelectedAnalysis(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-600 font-medium">Score Global</p>
                  <p className="text-2xl font-bold text-blue-800">{selectedAnalysis.score_global?.toFixed(1) || 'N/A'}/10</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-600 font-medium">Recommandations</p>
                  <p className="text-2xl font-bold text-green-800">{selectedAnalysis.recommendations_count}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-600 font-medium">Alertes</p>
                  <p className="text-2xl font-bold text-red-800">{selectedAnalysis.alerts_count}</p>
                </div>
              </div>
              
              {/* Priorites */}
              {selectedAnalysis.priorities?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Priorités Identifiées</h4>
                  <div className="space-y-2">
                    {selectedAnalysis.priorities.map((priority, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                        <span className="bg-blue-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-gray-800">{priority}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Moyennes par categorie */}
              {selectedAnalysis.category_averages && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Moyennes par Catégorie</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(selectedAnalysis.category_averages).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">
                          {analysisHistoryService.getCategoryLabel(key)}
                        </span>
                        <span className={`font-medium ${parseFloat(value) >= 4 ? 'text-green-600' : parseFloat(value) >= 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {parseFloat(value).toFixed(2)}/5
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisHistory;
