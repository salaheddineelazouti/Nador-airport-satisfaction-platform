import React from 'react';
import {
  CheckCircle2,
  Languages
} from 'lucide-react';
import airportsOfMoroccoLogo from '../assets/images/airports-of-morocco.png';

import { useLanguage, useSurveyState, useProgressCalculation, useCategoriesWithIcons, useNotifications } from '../hooks';
import LanguageSelector from './LanguageSelector';
import PersonalInfoForm from './PersonalInfoForm';
import CategoryEvaluation from './CategoryEvaluation';
import FlightRadar from './FlightRadar';
import LanguageSwitcher from './LanguageSwitcher';
import ProgressIndicator from './ProgressIndicator';
import LiveFlights from './LiveFlights';
import NotificationSystem from './NotificationSystem';

/**
 * Composant principal du questionnaire de satisfaction
 * @returns {JSX.Element} Composant SatisfactionSurvey
 */
const SatisfactionSurvey = () => {
  // Utilisation des hooks personnalisés
  const {
    selectedLanguage,
    texts: t,
    categories,
    categoryQuestions,
    handleLanguageSelect,
    resetLanguage,
    isRTL
  } = useLanguage();
  
  // Système de notification
  const {
    notifications,
    removeNotification,
    notifyError,
    notifySuccess
  } = useNotifications();
  
  const {
    currentStep,
    setCurrentStep,
    submitted,
    ratings,
    comments,
    personalInfo,
    showFlightRadar,
    setPersonalInfo,
    handleRatingChange,
    handleCommentChange,
    handleContinueToEvaluation,
    handleSubmit,
    toggleFlightRadar,
    resetSurvey
  } = useSurveyState(selectedLanguage, notifyError);
  
  // Le header reste maintenant toujours visible - pas de logique de scroll
  
  // Utilisation du hook pour les catégories avec icônes
  const categoriesWithIcons = useCategoriesWithIcons(categories);
  
  // Calcul du progrès
  const progress = useProgressCalculation(currentStep, submitted, ratings, categoryQuestions);
  
  // Fonction pour gérer la sélection de langue et le changement d'étape
  const handleLanguageSelection = (language) => {
    handleLanguageSelect(language);
    setCurrentStep(1);
  };
  
  // Fonction pour recommencer le questionnaire
  const handleStartOver = () => {
    resetSurvey();
    resetLanguage();
  };
  
  // Fonction personnalisée de soumission avec notification
  const handleSubmitWithNotification = async () => {
    try {
      await handleSubmit();
      // Si la soumission réussit, une notification de succès sera affichée
      if (submitted) {
        notifySuccess(t.thankYouText || 'Votre enquête a été soumise avec succès !', t.thankYou || 'Merci !');
      }
    } catch (error) {
      // Les erreurs sont déjà gérées par useSurveyState avec notifyError
    }
  };

  // Render conditionnel selon l'étape
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <LanguageSelector onLanguageSelect={handleLanguageSelection} />;
        
      case 1:
        return (
          <div className="space-y-8">
            {/* Widget de vols en temps réel */}
            <LiveFlights 
              t={t} 
              isRTL={isRTL} 
            />
            
            {/* Formulaire d'informations personnelles */}
            <PersonalInfoForm 
              personalInfo={personalInfo}
              setPersonalInfo={setPersonalInfo}
              t={t}
              selectedLanguage={selectedLanguage}
              onContinue={handleContinueToEvaluation}
            />
          </div>
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
                onClick={handleSubmitWithNotification}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-all transform hover:scale-105"
                dir={isRTL ? 'rtl' : 'ltr'}
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
            
            <h2 className="text-2xl font-bold mb-4" dir={isRTL ? 'rtl' : 'ltr'}>
              {t.thankYou}
            </h2>
            
            <p className="text-gray-600 mb-8" dir={isRTL ? 'rtl' : 'ltr'}>
              {t.thankYouText}
            </p>
            
            <button
              onClick={handleStartOver}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
            >
              <Languages className="w-5 h-5 mr-2" />
              {t.newEvaluation}
            </button>
          </div>
        );
        
      default:
        return null;
    }
  };

  /**
   * Render du composant principal
   */
  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden ${isRTL ? 'rtl-survey' : ''}`}>
      {/* Système de notification */}
      <NotificationSystem 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
      {/* Header avec barre de progression - affiché uniquement après la sélection de la langue */}
      {selectedLanguage && (
        <header 
          className="fixed-header w-full max-w-full overflow-x-hidden bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-100/50 py-3 px-4 sm:px-6 z-50"
        >
          <div className="container mx-auto max-w-full">
            {/* Ligne principale: Logo + Titre + Langues */}
            <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-4 relative">
              {/* Effet de lueur créatif en arrière-plan */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-green-50/30 rounded-lg opacity-50"></div>
              
              <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 relative z-10">
                <div className="relative">
                  {/* Effet de pulsation sur le logo */}
                  <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-pulse"></div>
                  <img src={airportsOfMoroccoLogo} alt="Airports of Morocco Logo" className="h-8 sm:h-10 mr-2 sm:mr-3 flex-shrink-0 relative z-10 drop-shadow-md" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-bold text-sm sm:text-lg bg-gradient-to-r from-gray-800 to-blue-700 bg-clip-text text-transparent truncate" dir={isRTL ? 'rtl' : 'ltr'}>
                    {t.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 truncate font-medium" dir={isRTL ? 'rtl' : 'ltr'}>
                    {t.subtitle}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0 relative z-10">
                {/* Sélecteur de langue avec effet hover */}
                <div className="flex-shrink-0 transform transition-transform hover:scale-105">
                  <LanguageSwitcher 
                    selectedLanguage={selectedLanguage} 
                    onLanguageSelect={handleLanguageSelect} 
                  />
                </div>
                
                {/* Affichage du progrès avec effet glow */}
                {!submitted && (
                  <div className="flex-shrink-0 relative">
                    <div className="absolute inset-0 bg-green-400/10 rounded-full blur-sm"></div>
                    <ProgressIndicator progress={progress} />
                  </div>
                )}
              </div>
            </div>
            

          </div>
        </header>
      )}
      

      
      {/* Contenu principal */}
      <main className={`container mx-auto px-4 sm:px-6 lg:px-8 pb-12 max-w-full overflow-x-hidden ${
        selectedLanguage 
          ? 'header-fixed-spacing' // Espacement uniforme pour header fixe sur toutes tailles
          : ''
      }`}>
        <div className="max-w-full">
          {renderStep()}
        </div>
      </main>
      
      {/* Footer - affiché uniquement après la sélection de la langue */}
      {selectedLanguage && (
        <footer className="bg-gray-100 py-6">
          <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
            <p dir={isRTL ? 'rtl' : 'ltr'}>
              &copy; 2025 {t.title}
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default SatisfactionSurvey;
