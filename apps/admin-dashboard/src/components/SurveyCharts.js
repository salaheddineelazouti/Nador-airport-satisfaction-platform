import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';

// Fonction pour convertir les clés techniques en labels lisibles (TOUJOURS EN FRANÇAIS POUR L'ADMIN)
const getCategoryLabel = (key, language = 'fr') => {
  const categoryLabels = {
    fr: {
      // Catégories principales
      'avg_acces_terminal': 'Accès et Terminal',
      'avg_enregistrement_controles': 'Enregistrement & Contrôles',
      'avg_zones_attente': 'Zones d\'Attente & Embarquement',
      'avg_services_commodites': 'Services & Commodités',
      'avg_hygiene_infrastructure': 'Hygiène & Infrastructure',
      'avg_personnel_service': 'Personnel & Service Global'
    }
  };
  
  // TOUJOURS retourner le label français pour l'admin
  if (categoryLabels.fr[key]) {
    return categoryLabels.fr[key];
  }
  
  // Si pas trouvé, retourner la clé formatée
  return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const SurveyCharts = ({ data }) => {
  const [trendsData, setTrendsData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTrendsData();
  }, [selectedPeriod]);

  const fetchTrendsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/trends?period=${selectedPeriod}`);
      const result = await response.json();
      
      if (result.success) {
        setTrendsData(result.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tendances:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const { summary, distributions } = data;

  // Composant simple de graphique en barres
  const SimpleBarChart = ({ data, title, color = 'blue' }) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-500">
          Aucune donnée disponible
        </div>
      );
    }

    const maxValue = Math.max(...data.map(item => item.value || item.count || 0));

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <div className="space-y-3">
          {data.map((item, index) => {
            const value = item.value || item.count || 0;
            const percentage = maxValue > 0 ? (value / maxValue * 100) : 0;
            
            return (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-20 text-sm text-gray-600 text-right">
                  {item.label || item.date || item.language || `Item ${index + 1}`}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div 
                    className={`h-6 rounded-full transition-all duration-500 ${
                      color === 'green' ? 'bg-green-500' :
                      color === 'blue' ? 'bg-blue-500' :
                      color === 'purple' ? 'bg-purple-500' :
                      color === 'orange' ? 'bg-orange-500' : 'bg-gray-500'
                    }`}
                    style={{width: `${percentage}%`}}
                  ></div>
                  <span className="absolute right-2 top-0 h-6 flex items-center text-xs font-medium text-gray-700">
                    {value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Composant de graphique linéaire simple
  const SimpleLineChart = ({ data, title }) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-500">
          Aucune donnée disponible
        </div>
      );
    }

    const maxValue = Math.max(...data.map(item => item.count || 0));
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((item.count || 0) / maxValue * 80);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <div className="h-64 bg-gray-50 rounded-lg p-4 relative">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Grille */}
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
            
            {/* Ligne de tendance */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              points={points}
            />
            
            {/* Points */}
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((item.count || 0) / maxValue * 80);
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="#3b82f6"
                  className="hover:r-5 transition-all cursor-pointer"
                >
                  <title>{`${item.date}: ${item.count} enquêtes`}</title>
                </circle>
              );
            })}
          </svg>
          
          {/* Légendes */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600 mt-2">
            <span>{data[0]?.date}</span>
            <span>{data[data.length - 1]?.date}</span>
          </div>
        </div>
      </div>
    );
  };

  // Données pour les graphiques
  const ratingsChartData = Object.entries(summary.averageRatings || {}).map(([key, value]) => {
    return {
      label: getCategoryLabel(key, 'fr'),
      value: value ? parseFloat(value).toFixed(1) : 0
    };
  });

  const languageChartData = distributions.languages?.map(lang => ({
    label: lang.language.toUpperCase(),
    count: lang.count
  })) || [];

  return (
    <div className="space-y-6">
      {/* Contrôles de période */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Analyse graphique
          </h2>
          <div className="flex space-x-2">
            {['week', 'month', 'quarter'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {period === 'week' ? 'Semaine' : 
                 period === 'month' ? 'Mois' : 'Trimestre'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Graphiques en grille */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évaluations moyennes */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <SimpleBarChart 
            data={ratingsChartData}
            title="Évaluations moyennes par catégorie"
            color="green"
          />
        </div>

        {/* Distribution des langues */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <SimpleBarChart 
            data={languageChartData}
            title="Répartition par langue"
            color="purple"
          />
        </div>

        {/* Tendances temporelles */}
        <div className="bg-white rounded-lg shadow-sm border p-6 lg:col-span-2">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <SimpleLineChart 
              data={distributions.weekly || []}
              title={`Évolution des enquêtes - ${selectedPeriod === 'week' ? 'Semaine' : selectedPeriod === 'month' ? 'Mois' : 'Trimestre'}`}
            />
          )}
        </div>
      </div>

      {/* Métriques de performance */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Métriques de performance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Taux de satisfaction */}
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {summary.averageRatings ? 
                Object.values(summary.averageRatings)
                  .filter(v => v !== null)
                  .reduce((acc, val, _, arr) => acc + parseFloat(val) / arr.length, 0)
                  .toFixed(1)
                : 'N/A'
              }%
            </div>
            <div className="text-sm text-green-700">Satisfaction globale</div>
          </div>

          {/* Taux de réponse */}
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {summary.totalSurveys || 0}
            </div>
            <div className="text-sm text-blue-700">Enquêtes complétées</div>
          </div>

          {/* Croissance */}
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              +{distributions.weekly?.length || 0}
            </div>
            <div className="text-sm text-orange-700">Jours actifs cette semaine</div>
          </div>
        </div>
      </div>

      {/* Recommandations */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Target size={20} />
          <span>Recommandations</span>
        </h3>
        
        <div className="space-y-3">
          {ratingsChartData
            .filter(item => parseFloat(item.value) < 3.5)
            .map((item, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="text-yellow-600 text-xl">⚠️</span>
                <div>
                  <div className="font-medium text-yellow-800">
                    Amélioration nécessaire : {item.label}
                  </div>
                  <div className="text-sm text-yellow-700">
                    Note actuelle : {item.value}/5 - Focus sur cette catégorie recommandé
                  </div>
                </div>
              </div>
            ))}
          
          {ratingsChartData.every(item => parseFloat(item.value) >= 3.5) && (
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-green-600 text-xl">✅</span>
              <div>
                <div className="font-medium text-green-800">
                  Excellente performance globale !
                </div>
                <div className="text-sm text-green-700">
                  Toutes les catégories ont des scores satisfaisants
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyCharts;
