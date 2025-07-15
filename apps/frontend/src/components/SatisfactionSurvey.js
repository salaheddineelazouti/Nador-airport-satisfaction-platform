import React from 'react';
import {
  Plane,
  CheckCircle2,
  Languages
} from 'lucide-react';

import { useLanguage, useSurveyState, useProgressCalculation, useCategoriesWithIcons } from '../hooks';
import LanguageSelector from './LanguageSelector';
import PersonalInfoForm from './PersonalInfoForm';
import CategoryEvaluation from './CategoryEvaluation';
import FlightRadar from './FlightRadar';
import LanguageSwitcher from './LanguageSwitcher';
import ProgressIndicator from './ProgressIndicator';

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
  } = useSurveyState();
  
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

  // Render conditionnel selon l'étape
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <LanguageSelector onLanguageSelect={handleLanguageSelection} />;
        
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
    <div className={`min-h-screen ${isRTL ? 'rtl-survey' : ''}`}>
      {/* Header avec barre de progression - affiché uniquement après la sélection de la langue */}
      {selectedLanguage && (
        <header className="bg-white shadow-md py-4 px-6 mb-6 sticky top-0 z-10">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Plane className={`w-6 h-6 text-blue-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                <div>
                  <h1 className="font-bold text-lg text-gray-800" dir={isRTL ? 'rtl' : 'ltr'}>
                    {t.title}
                  </h1>
                  <p className="text-sm text-gray-500" dir={isRTL ? 'rtl' : 'ltr'}>
                    {t.subtitle}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Sélecteur de langue */}
                <LanguageSwitcher 
                  selectedLanguage={selectedLanguage} 
                  onLanguageSelect={handleLanguageSelect} 
                />
                
                {/* Affichage du progrès */}
                {!submitted && <ProgressIndicator progress={progress} />}
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
