import { useState } from 'react';

/**
 * Hook pour gérer l'état du questionnaire
 * @returns {Object} État et fonctions pour gérer le questionnaire
 */
export const useSurveyState = () => {
  // États pour la gestion des étapes
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  
  // États pour les données du questionnaire
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [personalInfo, setPersonalInfo] = useState({
    age: '',
    nationality: '',
    travelPurpose: '',
    frequency: '',
  });
  
  // État pour les fonctionnalités additionnelles
  const [showFlightRadar, setShowFlightRadar] = useState(false);

  // Gestionnaires d'événements
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
  
  const resetSurvey = () => {
    setSubmitted(false);
    setCurrentStep(0);
    setRatings({});
    setComments({});
    setPersonalInfo({
      age: '',
      nationality: '',
      travelPurpose: '',
      frequency: '',
    });
    setShowFlightRadar(false);
  };

  return {
    // États
    currentStep,
    submitted,
    ratings,
    comments,
    personalInfo,
    showFlightRadar,
    
    // Actions
    setCurrentStep,
    setPersonalInfo,
    handleRatingChange,
    handleCommentChange,
    handleContinueToEvaluation,
    handleSubmit,
    toggleFlightRadar,
    resetSurvey
  };
};
