import React from 'react';
import { BarChart3, Star, Globe, TrendingUp, Clipboard, Earth, Calendar, Target } from 'lucide-react';

// Fonction pour convertir les clés techniques en labels lisibles (TOUJOURS EN FRANÇAIS POUR L'ADMIN)
const getCategoryLabel = (key, language = 'fr') => {
  const categoryLabels = {
    fr: {
      // Catégories principales
      'acces_terminal': 'Accès et Terminal',
      'enregistrement_controles': 'Enregistrement & Contrôles',
      'zones_attente': 'Zones d\'Attente & Embarquement',
      'services_commodites': 'Services & Commodités',
      'hygiene_infrastructure': 'Hygiène & Infrastructure',
      'personnel_service': 'Personnel & Service Global',
      
      // Questions détaillées
      'acces_terminal_0': 'Facilité de se rendre à l\'aéroport',
      'acces_terminal_1': 'Options de transport terrestre',
      'acces_terminal_2': 'Signalisation pour accéder à l\'aérogate',
      'acces_terminal_3': 'Distance à parcourir à pied dans le terminal',
      'acces_terminal_4': 'Facilité à s\'orienter dans l\'aéroport',
      'acces_terminal_5': 'Ambiance générale de l\'aéroport',
      'enregistrement_controles_0': 'Facilité à trouver la zone d\'enregistrement',
      'enregistrement_controles_1': 'Temps d\'attente à l\'enregistrement',
      'enregistrement_controles_2': 'Courtoisie et serviabilité du personnel enregistrement',
      'enregistrement_controles_3': 'Facilité à passer le contrôle de sécurité',
      'enregistrement_controles_4': 'Rapidité/efficacité du contrôle de sécurité',
      'enregistrement_controles_5': 'Temps d\'attente au contrôle de sécurité',
      'enregistrement_controles_6': 'Courtoisie et serviabilité du personnel de sécurité',
      'enregistrement_controles_7': 'Temps d\'attente au contrôle des passeports',
      'enregistrement_controles_8': 'Courtoisie et serviabilité du personnel de contrôle des passeports',
      'zones_attente_0': 'Disponibilité des sièges dans les zones d\'embarquement',
      'zones_attente_1': 'Confort des salles d\'attente dans les zones d\'embarquement',
      'zones_attente_2': 'Disponibilité de l\'information sur les vols',
      'zones_attente_3': 'Facilité de correspondance',
      'services_commodites_0': 'Restaurants, Bars, Cafés',
      'services_commodites_1': 'Rapport qualité/prix Restaurants, Bars, Cafés',
      'services_commodites_2': 'Boutiques',
      'services_commodites_3': 'Rapport qualité/prix des boutiques',
      'services_commodites_4': 'Courtoisie et serviabilité du personnel des boutiques et restaurants',
      'services_commodites_5': 'Qualité du service WiFi',
      'hygiene_infrastructure_0': 'Propreté du terminal de l\'aéroport',
      'hygiene_infrastructure_1': 'Propreté des toilettes',
      'hygiene_infrastructure_2': 'Disponibilité des toilettes',
      'hygiene_infrastructure_3': 'Sécurité sanitaire',
      'personnel_service_0': 'Courtoisie et serviabilité du personnel de l\'aéroport',
      'personnel_service_1': 'Disponibilité de la borne de retouche'
    }
  };
  
  // TOUJOURS retourner le label français pour l'admin
  if (categoryLabels.fr[key]) {
    return categoryLabels.fr[key];
  }
  
  // Si pas trouvé, retourner la clé formatée
  return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const DashboardStats = ({ data }) => {
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-admin p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const { summary, distributions } = data;
  
  // Calcul de la satisfaction moyenne générale
  const avgRatings = summary.averageRatings || {};
  
  // Mapping des nouvelles clés de l'API vers les anciennes pour compatibilité
  const mappedRatings = {
    'avg_acces_terminal': avgRatings.avg_acces_terminal,
    'avg_enregistrement_controles': avgRatings.avg_enregistrement_controles,
    'avg_zones_attente': avgRatings.avg_zones_attente,
    'avg_services_commodites': avgRatings.avg_services_commodites,
    'avg_hygiene_infrastructure': avgRatings.avg_hygiene_infrastructure,
    'avg_personnel_service': avgRatings.avg_personnel_service
  };
  
  const allRatings = Object.values(mappedRatings).filter(val => val !== null && val !== undefined);
  const overallAverage = allRatings.length > 0 
    ? (allRatings.reduce((sum, val) => sum + parseFloat(val), 0) / allRatings.length).toFixed(1)
    : 'N/A';
  
  // Utiliser les nouvelles clés pour l'affichage
  const displayRatings = mappedRatings;

  // Calcul du taux de croissance hebdomadaire
  const weeklyData = distributions.weekly || [];
  const growthRate = weeklyData.length >= 2 
    ? ((weeklyData[weeklyData.length - 1]?.count - weeklyData[0]?.count) / weeklyData[0]?.count * 100).toFixed(1)
    : 0;

  // Langue la plus utilisée
  const languagesList = distributions.languages || [];
  const topLanguage = languagesList.length > 0
    ? languagesList.reduce((prev, current) => 
        (prev.count > current.count) ? prev : current
      )
    : null;

  const stats = [
    {
      title: 'Total des enquêtes',
      value: summary.totalSurveys || 0,
      icon: BarChart3,
      color: 'admin-primary',
      trend: `+${Math.abs(growthRate)}%`,
      trendDirection: growthRate >= 0 ? 'up' : 'down'
    },
    {
      title: 'Satisfaction moyenne',
      value: `${overallAverage}/5`,
      icon: Star,
      color: 'admin-success',
      trend: overallAverage >= 4 ? 'Excellente' : overallAverage >= 3 ? 'Bonne' : 'À améliorer',
      trendDirection: overallAverage >= 4 ? 'up' : overallAverage >= 3 ? 'stable' : 'down'
    },
    {
      title: 'Langue principale',
      value: topLanguage ? topLanguage.language.toUpperCase() : 'N/A',
      icon: Globe,
      color: 'admin-accent',
      trend: topLanguage ? `${topLanguage.count} réponses` : '0 réponses',
      trendDirection: 'stable'
    },
    {
      title: 'Cette semaine',
      value: weeklyData.reduce((sum, day) => sum + parseInt(day.count || 0), 0),
      icon: TrendingUp,
      color: 'admin-warning',
      trend: `${weeklyData.length} jours actifs`,
      trendDirection: 'up'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      'admin-primary': 'bg-blue-50 text-blue-600 border-blue-200',
      'admin-success': 'bg-green-50 text-green-600 border-green-200',
      'admin-accent': 'bg-cyan-50 text-cyan-600 border-cyan-200',
      'admin-warning': 'bg-orange-50 text-orange-600 border-orange-200'
    };
    return colors[color] || colors['admin-primary'];
  };

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '➡️';
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-admin border p-6 hover:shadow-admin-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </p>
                <div className="flex items-center space-x-1 text-sm">
                  <span>{getTrendIcon(stat.trendDirection)}</span>
                  <span className="text-gray-600">{stat.trend}</span>
                </div>
              </div>
              <div className={`w-14 h-14 rounded-lg flex items-center justify-center border ${getColorClasses(stat.color)}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Ratings */}
      <div className="bg-white rounded-lg shadow-admin border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Clipboard size={24} />
          <span>Détail des évaluations</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(displayRatings).map(([category, rating]) => {
            const displayName = getCategoryLabel(category, 'fr');
            const ratingValue = rating ? parseFloat(rating).toFixed(1) : 'N/A';
            const percentage = rating ? (parseFloat(rating) / 5 * 100) : 0;

            return (
              <div key={category} className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    {displayName}
                  </span>
                  <span className="text-sm font-bold text-gray-900 bg-white px-2 py-1 rounded">
                    {ratingValue}/5
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      percentage >= 80 ? 'bg-green-500' :
                      percentage >= 60 ? 'bg-yellow-500' :
                      percentage >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{width: `${percentage}%`}}
                  ></div>
                </div>
                
                <div className="text-xs text-gray-600 mt-1 text-center">
                  {percentage.toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Language Distribution */}
        <div className="bg-white rounded-lg shadow-admin border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Earth size={20} />
            <span>Répartition par langue</span>
          </h4>
          
          <div className="space-y-4">
            {distributions.languages?.map((lang) => {
              const percentage = summary.totalSurveys > 0 
                ? (lang.count / summary.totalSurveys * 100).toFixed(1)
                : 0;

              const languageNames = {
                fr: '🇫🇷 Français',
                ar: '🇲🇦 العربية',
                en: '🇬🇧 English'
              };

              return (
                <div key={lang.language} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <span className="text-base font-medium">
                      {languageNames[lang.language] || lang.language}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-admin-primary h-3 rounded-full transition-all duration-500"
                        style={{width: `${percentage}%`}}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-20 text-right">
                      {lang.count} ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-admin border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Calendar size={20} />
            <span>Activité récente</span>
          </h4>
          
          <div className="space-y-3">
            {weeklyData.map((day, index) => {
              const maxCount = Math.max(...weeklyData.map(d => d.count));
              const percentage = maxCount > 0 ? (day.count / maxCount * 100) : 0;
              
              return (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-700 w-24">
                    {new Date(day.date).toLocaleDateString('fr-FR', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </span>
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-3 mx-3">
                      <div 
                        className="bg-admin-success h-3 rounded-full transition-all duration-300"
                        style={{width: `${percentage}%`}}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-8 text-right">
                      {day.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-8 text-white shadow-xl">
        <h3 className="text-2xl font-bold text-white mb-8 flex items-center space-x-3">
          <div className="bg-white/20 p-3 rounded-lg">
            <Target size={28} className="text-white" />
          </div>
          <span>Synthèse des performances</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
            <div className="text-4xl font-bold mb-3 text-white">
              {overallAverage !== 'N/A' ? (parseFloat(overallAverage) * 20).toFixed(0) : 0}%
            </div>
            <div className="text-blue-100 text-lg">Satisfaction globale</div>
            <div className="mt-3 w-full bg-blue-900/30 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-1000" 
                style={{width: `${overallAverage !== 'N/A' ? (parseFloat(overallAverage) * 20) : 0}%`}}
              ></div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
            <div className="text-4xl font-bold mb-3 text-white">
              {summary.totalSurveys || 0}
            </div>
            <div className="text-blue-100 text-lg">Enquêtes complétées</div>
            <div className="text-sm text-blue-200 mt-2">
              {weeklyData.reduce((sum, day) => sum + parseInt(day.count || 0), 0)} cette semaine
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
            <div className="text-4xl font-bold mb-3 text-white">
              {weeklyData.length}
            </div>
            <div className="text-blue-100 text-lg">Jours actifs</div>
            <div className="text-sm text-blue-200 mt-2">
              {weeklyData.length > 0 ? 'Cette semaine' : 'Aucune activité'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
