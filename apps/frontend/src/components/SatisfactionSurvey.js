import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plane, 
  GanttChart, 
  UserCheck, 
  Coffee, 
  ShoppingBag, 
  Wifi, 
  HelpCircle, 
  // UserCheck2, // Unused import
  // ArrowLeft,  // Unused import
  // ArrowRight, // Unused import
  CheckCircle2,
  Languages
} from 'lucide-react';

// Composants personnalisés
import LanguageSelector from './LanguageSelector';
import PersonalInfoForm from './PersonalInfoForm';
import CategoryEvaluation from './CategoryEvaluation';
import FlightRadar from './FlightRadar';

// Données de langue
import { 
  getQuestionsByLanguage, 
  getCategoryTitles, 
  // getFormLabels, // Unused import
  // getPlaceholders, // Unused import
  languages 
} from './languageData';

const SatisfactionSurvey = () => {
  // États pour la gestion de la langue et des étapes
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  
  // États pour les données du questionnaire
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [personalInfo, setPersonalInfo] = useState({
    age: '',
    nationality: '',
    travelPurpose: '',
    frequency: '',
  });
  
  // États pour les fonctionnalités additionnelles
  const [showFlightRadar, setShowFlightRadar] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Récupérer les textes, questions et catégories selon la langue sélectionnée
  const t = useMemo(() => languages[selectedLanguage] || languages.fr, [selectedLanguage]);
  const categoryQuestions = useMemo(() => {
    const categories = getCategoryTitles(selectedLanguage);
    if (!categories) return {};
    
    const result = {};
    Object.keys(categories).forEach(categoryId => {
      result[categoryId] = getQuestionsByLanguage(categoryId, selectedLanguage);
    });
    return result;
  }, [selectedLanguage]);
  const categories = useMemo(() => getCategoryTitles(selectedLanguage), [selectedLanguage]);
  
  // Gérer les catégories avec icônes
  const categoriesWithIcons = useMemo(() => {
    if (!categories) return [];
    
    const icons = [
      { icon: <Plane className="w-6 h-6" />, color: 'bg-blue-100', iconColor: 'text-blue-600' },
      { icon: <GanttChart className="w-6 h-6" />, color: 'bg-purple-100', iconColor: 'text-purple-600' },
      { icon: <UserCheck className="w-6 h-6" />, color: 'bg-green-100', iconColor: 'text-green-600' },
      { icon: <Coffee className="w-6 h-6" />, color: 'bg-yellow-100', iconColor: 'text-yellow-600' },
      { icon: <ShoppingBag className="w-6 h-6" />, color: 'bg-pink-100', iconColor: 'text-pink-600' },
      { icon: <Wifi className="w-6 h-6" />, color: 'bg-indigo-100', iconColor: 'text-indigo-600' },
      { icon: <HelpCircle className="w-6 h-6" />, color: 'bg-red-100', iconColor: 'text-red-600' },
    ];
    
    return Object.entries(categories).map(([id, title], index) => ({
      id,
      title,
      ...icons[index % icons.length]
    }));
  }, [categories]);
  
  // Calculer le progrès du questionnaire
  const calculateProgress = () => {
    if (currentStep === 0) return 0;
    if (currentStep === 1) return 20;
    if (submitted) return 100;
    
    const totalQuestions = Object.values(categoryQuestions).flat().length;
    const answeredQuestions = Object.keys(ratings).length;
    
    const progress = Math.min(
      95,
      20 + Math.round((answeredQuestions / totalQuestions) * 75)
    );
    
    return progress;
  };
  
  // Gestionnaires d'événements
  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setCurrentStep(1);
    document.documentElement.lang = language;
    document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
  };
  
  const handleRatingChange = (questionId, value) => {
    setRatings(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  const handleCommentChange = (categoryId, value) => {
    setComments(prev => ({
      ...prev,
      [categoryId]: value
    }));
  };
  
  const handleContinueToEvaluation = () => {
    setCurrentStep(2);
  };
  
  const handleSubmit = () => {
    // Ici on pourrait envoyer les données à un backend
    console.log('Submission data:', {
      personalInfo,
      ratings,
      comments
    });
    
    setSubmitted(true);
    setCurrentStep(3);
  };
  
  const toggleFlightRadar = () => {
    setShowFlightRadar(prev => !prev);
  };
  
  const handleStartOver = () => {
    setSubmitted(false);
    setCurrentStep(0);
    setSelectedLanguage('');
    setRatings({});
    setComments({});
    setPersonalInfo({
      age: '',
      nationality: '',
      travelPurpose: '',
      frequency: '',
    });
    setShowFlightRadar(false);
    document.body.dir = 'ltr';
    document.documentElement.lang = 'fr';
  };

  // Effet pour gérer le sens de lecture selon la langue
  useEffect(() => {
    if (selectedLanguage) {
      document.documentElement.lang = selectedLanguage;
      document.body.dir = selectedLanguage === 'ar' ? 'rtl' : 'ltr';
    }
  }, [selectedLanguage]);

  // Render conditionnel selon l'étape
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <LanguageSelector onLanguageSelect={handleLanguageSelect} />;
        
      case 1:
        return (
          <PersonalInfoForm 
            personalInfo={personalInfo}
            setPersonalInfo={setPersonalInfo}
            t={t}
            selectedLanguage={selectedLanguage}
            onContinue={handleContinueToEvaluation}
          />
        );
        
      case 2:
        return (
          <div className="space-y-8">
            {/* Composant FlightRadar */}
            <FlightRadar 
              showFlightRadar={showFlightRadar}
              toggleFlightRadar={toggleFlightRadar}
              t={t}
              selectedLanguage={selectedLanguage}
            />
            
            {/* Mapping des catégories pour l'évaluation */}
            {categoriesWithIcons.map(category => (
              <CategoryEvaluation
                key={category.id}
                category={category}
                ratings={ratings}
                handleRatingChange={handleRatingChange}
                comments={comments}
                handleCommentChange={handleCommentChange}
                selectedLanguage={selectedLanguage}
                t={t}
                questions={categoryQuestions[category.id] || []}
              />
            ))}
            
            {/* Bouton de soumission */}
            <div className="flex justify-center mt-8 mb-16">
              <button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-all transform hover:scale-105"
                dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
              >
                {t.submit}
              </button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto text-center my-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold mb-4" dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
              {t.thankYou}
            </h2>
            
            <p className="text-gray-600 mb-8" dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
              {t.feedbackReceived}
            </p>
            
            <button
              onClick={handleStartOver}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
            >
              <Languages className="w-5 h-5 mr-2" />
              {t.startOver}
            </button>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${selectedLanguage === 'ar' ? 'rtl-survey' : ''}`}>
      {/* Header avec barre de progression - affiché uniquement après la sélection de la langue */}
      {selectedLanguage && (
        <header className="bg-white shadow-md py-4 px-6 mb-6 sticky top-0 z-10">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Plane className={`w-6 h-6 text-blue-600 ${selectedLanguage === 'ar' ? 'ml-3' : 'mr-3'}`} />
                <div>
                  <h1 className="font-bold text-lg text-gray-800" dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
                    {t.title}
                  </h1>
                  <p className="text-sm text-gray-500" dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
                    {t.subtitle}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Sélecteur de langue */}
                <div className="flex space-x-2">
                  {Object.entries(languages).map(([code, lang]) => (
                    <button
                      key={code}
                      onClick={() => setSelectedLanguage(code)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        selectedLanguage === code 
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                    >
                      <span>{lang.flag}</span>
                    </button>
                  ))}
                </div>
                
                {/* Affichage du progrès */}
                {!submitted && (
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${calculateProgress()}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{calculateProgress()}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      )}
      
      {/* Contenu principal */}
      <main className="container mx-auto px-4 pb-12">
        {renderStep()}
      </main>
      
      {/* Footer - affiché uniquement après la sélection de la langue */}
      {selectedLanguage && (
        <footer className="bg-gray-100 py-6">
          <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
            <p dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
              {t.footer} &copy; 2023 {t.airportName}
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default SatisfactionSurvey;
