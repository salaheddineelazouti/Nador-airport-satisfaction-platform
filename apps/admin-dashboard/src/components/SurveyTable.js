import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

const SurveyTable = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    language: '',
    dateFrom: '',
    dateTo: '',
    minRating: '',
    maxRating: ''
  });
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  const surveysPerPage = 10;

  useEffect(() => {
    fetchSurveys();
  }, [currentPage, filters]);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      
      // Construction des paramètres de requête
      const params = new URLSearchParams({
        page: currentPage,
        limit: surveysPerPage,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/surveys?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setSurveys(result.data.surveys || []);
        setTotalPages(Math.ceil((result.data.total || 0) / surveysPerPage));
      } else {
        setError('Erreur lors du chargement des enquêtes');
      }
    } catch (error) {
      console.error('Erreur API:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset à la première page lors du filtrage
  };

  const clearFilters = () => {
    setFilters({
      language: '',
      dateFrom: '',
      dateTo: '',
      minRating: '',
      maxRating: ''
    });
  };

  const calculateAverageRating = (ratings) => {
    if (!ratings || typeof ratings !== 'object') return 'N/A';
    
    const values = Object.values(ratings).filter(val => val !== null && val !== undefined);
    if (values.length === 0) return 'N/A';
    
    const average = values.reduce((sum, val) => sum + parseFloat(val), 0) / values.length;
    return average.toFixed(1);
  };

  const getLanguageFlag = (language) => {
    const flags = {
      fr: '🇫🇷',
      ar: '🇲🇦',
      en: '🇬🇧'
    };
    return flags[language] || <Globe size={16} className="inline" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSatisfactionColor = (rating) => {
    const numRating = parseFloat(rating);
    if (numRating >= 4) return 'text-green-600 bg-green-50';
    if (numRating >= 3) return 'text-yellow-600 bg-yellow-50';
    if (numRating >= 2) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading && surveys.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Filtres de recherche
          </h2>
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Effacer les filtres
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Langue
            </label>
            <select
              value={filters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="ar">🇲🇦 العربية</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date début
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date fin
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note min
            </label>
            <select
              value={filters.minRating}
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note max
            </label>
            <select
              value={filters.maxRating}
              onChange={(e) => handleFilterChange('maxRating', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes</option>
              <option value="5">≤5</option>
              <option value="4">≤4</option>
              <option value="3">≤3</option>
              <option value="2">≤2</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Enquêtes de satisfaction ({surveys.length} résultats)
          </h2>
        </div>

        {error ? (
          <div className="p-6 text-center text-red-600">
            <p>{error}</p>
            <button
              onClick={fetchSurveys}
              className="mt-2 text-blue-600 hover:text-blue-800 underline"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID / Session
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Langue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Satisfaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profil
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {surveys.map((survey) => {
                    const avgRating = calculateAverageRating(survey.ratings);
                    
                    return (
                      <tr key={survey.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {survey.id?.slice(0, 8)}...
                            </div>
                            <div className="text-gray-500 text-xs">
                              {survey.session_id?.slice(-8)}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(survey.submitted_at)}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="flex items-center space-x-1">
                            <span>{getLanguageFlag(survey.language)}</span>
                            <span className="text-sm font-medium">
                              {survey.language?.toUpperCase()}
                            </span>
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSatisfactionColor(avgRating)}`}>
                            ⭐ {avgRating}/5
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            {survey.age_range && (
                              <div className="text-xs">{survey.age_range} ans</div>
                            )}
                            {survey.travel_purpose && (
                              <div className="text-xs">{survey.travel_purpose}</div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setSelectedSurvey(survey)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Voir détails
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
              
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> sur{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      ‹
                    </button>
                    
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      ›
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de détails */}
      {selectedSurvey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Détails de l'enquête</h3>
                <button
                  onClick={() => setSelectedSurvey(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>ID:</strong> {selectedSurvey.id}
                  </div>
                  <div>
                    <strong>Date:</strong> {formatDate(selectedSurvey.submitted_at)}
                  </div>
                  <div>
                    <strong>Langue:</strong> {getLanguageFlag(selectedSurvey.language)} {selectedSurvey.language}
                  </div>
                  <div>
                    <strong>Satisfaction:</strong> {calculateAverageRating(selectedSurvey.ratings)}/5
                  </div>
                </div>
                
                {selectedSurvey.ratings && (
                  <div>
                    <strong>Évaluations détaillées:</strong>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {Object.entries(selectedSurvey.ratings).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span>{key}:</span>
                          <span>{value}/5</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedSurvey.comments && Object.keys(selectedSurvey.comments).length > 0 && (
                  <div>
                    <strong>Commentaires:</strong>
                    <div className="mt-2 space-y-2">
                      {Object.entries(selectedSurvey.comments).map(([key, comment]) => (
                        comment && (
                          <div key={key} className="p-2 bg-gray-50 rounded text-sm">
                            <strong>{key}:</strong> {comment}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyTable;
