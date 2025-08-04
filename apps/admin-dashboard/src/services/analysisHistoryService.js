/**
 * Service de gestion de l'historique des analyses IA
 * Permet de sauvegarder et suivre l'evolution des recommandations dans le temps
 */

class AnalysisHistoryService {
  constructor() {
    this.storageKey = 'onda_nador_analysis_history';
    this.maxHistoryItems = 50; // Limiter a 50 analyses max
  }

  /**
   * Sauvegarde une nouvelle analyse dans l'historique
   * @param {Object} analysisData - Donnees de l'analyse complete
   * @param {Object} dashboardData - Donnees du dashboard utilisees pour l'analyse
   */
  saveAnalysis(analysisData, dashboardData) {
    try {
      const history = this.getHistory();
      
      const analysisEntry = {
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('fr-FR'),
        time: new Date().toLocaleTimeString('fr-FR'),
        score_global: analysisData.score_global || 0,
        priorities: analysisData.priorities || [],
        recommendations_count: analysisData.recommendations?.length || 0,
        alerts_count: analysisData.alerts?.length || 0,
        trends_summary: analysisData.trends?.substring(0, 150) + '...' || '',
        
        // Donnees du dashboard au moment de l'analyse
        total_surveys: dashboardData?.summary?.totalSurveys || 0,
        category_averages: dashboardData?.summary?.averageRatings || {},
        
        // Analyse complete pour consultation detaillee
        full_analysis: analysisData,
        dashboard_snapshot: {
          summary: dashboardData?.summary,
          distributions: dashboardData?.distributions
        }
      };

      // Ajouter au debut de l'historique
      history.unshift(analysisEntry);
      
      // Limiter la taille de l'historique
      if (history.length > this.maxHistoryItems) {
        history.splice(this.maxHistoryItems);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(history));
      
      console.log('Analyse sauvegardee dans l\'historique:', analysisEntry.id);
      return analysisEntry;
    } catch (error) {
      console.error('Erreur sauvegarde analyse:', error);
      return null;
    }
  }

  /**
   * Recupere l'historique complet des analyses
   */
  getHistory() {
    try {
      const historyData = localStorage.getItem(this.storageKey);
      return historyData ? JSON.parse(historyData) : [];
    } catch (error) {
      console.error('Erreur lecture historique:', error);
      return [];
    }
  }

  /**
   * Recupere une analyse specifique par ID
   */
  getAnalysisById(id) {
    const history = this.getHistory();
    return history.find(analysis => analysis.id === id);
  }

  /**
   * Recupere les N dernieres analyses
   */
  getRecentAnalyses(count = 10) {
    const history = this.getHistory();
    return history.slice(0, count);
  }

  /**
   * Recupere les donnees de tendance pour les graphiques
   */
  getTrendData(days = 30) {
    const history = this.getHistory();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return history
      .filter(analysis => new Date(analysis.timestamp) >= cutoffDate)
      .reverse() // Plus ancien vers plus recent pour les graphiques
      .map(analysis => ({
        date: analysis.date,
        timestamp: analysis.timestamp,
        score: analysis.score_global,
        surveys_count: analysis.total_surveys,
        alerts_count: analysis.alerts_count,
        categories: analysis.category_averages
      }));
  }

  /**
   * Calcule les statistiques de tendance
   */
  getTrendStats(days = 30) {
    const trendData = this.getTrendData(days);
    
    if (trendData.length < 2) {
      return {
        score_trend: 'stable',
        score_change: 0,
        analysis_count: trendData.length,
        period_days: days
      };
    }

    const firstScore = trendData[0]?.score || 0;
    const lastScore = trendData[trendData.length - 1]?.score || 0;
    const scoreChange = lastScore - firstScore;
    
    let trend = 'stable';
    if (scoreChange > 0.3) trend = 'improving';
    else if (scoreChange < -0.3) trend = 'declining';
    
    return {
      score_trend: trend,
      score_change: scoreChange,
      first_score: firstScore,
      last_score: lastScore,
      analysis_count: trendData.length,
      period_days: days,
      average_score: trendData.reduce((sum, item) => sum + (item.score || 0), 0) / trendData.length
    };
  }

  /**
   * Nettoie l'historique (supprime les anciennes entrees)
   */
  cleanHistory(keepDays = 90) {
    try {
      const history = this.getHistory();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - keepDays);
      
      const filteredHistory = history.filter(
        analysis => new Date(analysis.timestamp) >= cutoffDate
      );
      
      localStorage.setItem(this.storageKey, JSON.stringify(filteredHistory));
      
      const removedCount = history.length - filteredHistory.length;
      if (removedCount > 0) {
        console.log(`Historique nettoye: ${removedCount} analyses supprimees`);
      }
      
      return filteredHistory.length;
    } catch (error) {
      console.error('Erreur nettoyage historique:', error);
      return 0;
    }
  }

  /**
   * Exporte l'historique en JSON
   */
  exportHistory() {
    const history = this.getHistory();
    const exportData = {
      export_date: new Date().toISOString(),
      analysis_count: history.length,
      analyses: history
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onda_nador_analysis_history_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return exportData;
  }

  /**
   * Supprime tout l'historique (avec confirmation)
   */
  clearHistory() {
    if (window.confirm('Etes-vous sur de vouloir supprimer tout l\'historique des analyses ?')) {
      localStorage.removeItem(this.storageKey);
      console.log('Historique des analyses supprime');
      return true;
    }
    return false;
  }

  /**
   * Genere un ID unique pour une analyse
   */
  generateId() {
    return 'analysis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  }

  /**
   * Obtient les categories avec les plus grandes variations
   */
  getCategoryTrends(days = 30) {
    const trendData = this.getTrendData(days);
    
    if (trendData.length < 2) return [];
    
    const firstAnalysis = trendData[0];
    const lastAnalysis = trendData[trendData.length - 1];
    
    const categoryTrends = [];
    
    Object.keys(firstAnalysis.categories || {}).forEach(category => {
      const firstValue = parseFloat(firstAnalysis.categories[category]) || 0;
      const lastValue = parseFloat(lastAnalysis.categories[category]) || 0;
      const change = lastValue - firstValue;
      
      if (Math.abs(change) > 0.1) { // Seulement les changements significatifs
        categoryTrends.push({
          category,
          first_value: firstValue,
          last_value: lastValue,
          change,
          trend: change > 0 ? 'improving' : 'declining',
          category_label: this.getCategoryLabel(category)
        });
      }
    });
    
    // Trier par importance du changement
    return categoryTrends.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  }

  /**
   * Convertit une cle de categorie en label lisible
   */
  getCategoryLabel(key) {
    const labels = {
      'avg_acces_terminal': 'Acces Terminal',
      'avg_enregistrement_controles': 'Enregistrement/Controles',
      'avg_zones_attente': 'Zones d\'Attente',
      'avg_services_commodites': 'Services/Commodites',
      'avg_hygiene_infrastructure': 'Hygiene/Infrastructure',
      'avg_personnel_service': 'Personnel/Service'
    };
    return labels[key] || key;
  }
}

// Export singleton
export default new AnalysisHistoryService();
