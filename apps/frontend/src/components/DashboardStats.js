import React from 'react';

const DashboardStats = ({ data }) => {
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
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
  const allRatings = Object.values(avgRatings).filter(val => val !== null && val !== undefined);
  const overallAverage = allRatings.length > 0 
    ? (allRatings.reduce((sum, val) => sum + parseFloat(val), 0) / allRatings.length).toFixed(1)
    : 'N/A';

  // Calcul du taux de croissance hebdomadaire
  const weeklyData = distributions.weekly || [];
  const growthRate = weeklyData.length >= 2 
    ? ((weeklyData[weeklyData.length - 1]?.count - weeklyData[0]?.count) / weeklyData[0]?.count * 100).toFixed(1)
    : 0;

  // Langue la plus utilisée
  const topLanguage = distributions.languages?.reduce((prev, current) => 
    (prev.count > current.count) ? prev : current
  );

  const stats = [
    {
      title: 'Total des enquêtes',
      value: summary.totalSurveys || 0,
      icon: '📊',
      color: 'blue',
      trend: `+${Math.abs(growthRate)}%`,
      trendDirection: growthRate >= 0 ? 'up' : 'down'
    },
    {
      title: 'Satisfaction moyenne',
      value: `${overallAverage}/5`,
      icon: '⭐',
      color: 'green',
      trend: overallAverage >= 4 ? 'Excellente' : overallAverage >= 3 ? 'Bonne' : 'À améliorer',
      trendDirection: overallAverage >= 4 ? 'up' : overallAverage >= 3 ? 'stable' : 'down'
    },
    {
      title: 'Langue principale',
      value: topLanguage ? topLanguage.language.toUpperCase() : 'N/A',
      icon: '🌐',
      color: 'purple',
      trend: topLanguage ? `${topLanguage.count} réponses` : '0 réponses',
      trendDirection: 'stable'
    },
    {
      title: 'Cette semaine',
      value: weeklyData.reduce((sum, day) => sum + parseInt(day.count || 0), 0),
      icon: '📈',
      color: 'orange',
      trend: `${weeklyData.length} jours actifs`,
      trendDirection: 'up'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200'
    };
    return colors[color] || colors.blue;
  };

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '➡️';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </p>
                <div className="flex items-center space-x-1 text-sm">
                  <span>{getTrendIcon(stat.trendDirection)}</span>
                  <span className="text-gray-600">{stat.trend}</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(stat.color)}`}>
                <span className="text-xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Ratings */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Évaluations par catégorie
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(avgRatings).map(([category, rating]) => {
            const categoryNames = {
              avg_accueil: 'Accueil',
              avg_securite: 'Sécurité',
              avg_confort: 'Confort',
              avg_services: 'Services',
              avg_restauration: 'Restauration',
              avg_boutiques: 'Boutiques',
              avg_proprete: 'Propreté',
              avg_signalisation: 'Signalisation'
            };

            const displayName = categoryNames[category] || category;
            const ratingValue = rating ? parseFloat(rating).toFixed(1) : 'N/A';
            const percentage = rating ? (parseFloat(rating) / 5 * 100) : 0;

            return (
              <div key={category} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {displayName}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {ratingValue}/5
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      percentage >= 80 ? 'bg-green-500' :
                      percentage >= 60 ? 'bg-yellow-500' :
                      percentage >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{width: `${percentage}%`}}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Language Distribution */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Distribution par langue
        </h3>
        
        <div className="space-y-3">
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
              <div key={lang.language} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium">
                    {languageNames[lang.language] || lang.language}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{width: `${percentage}%`}}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right">
                    {lang.count} ({percentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Activité récente (7 derniers jours)
        </h3>
        
        <div className="space-y-2">
          {weeklyData.map((day, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">
                {new Date(day.date).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </span>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${Math.max(weeklyData) > 0 ? (day.count / Math.max(...weeklyData.map(d => d.count)) * 100) : 0}%`
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">
                  {day.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
