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
  
  const handleSubmit = async () => {
    try {
      // Préparation des données pour l'API
      const surveyData = {
        language: 'fr', // À récupérer du contexte de langue
        personalInfo: {
          age: personalInfo.age,
          nationality: personalInfo.nationality,
          travelPurpose: personalInfo.travelPurpose,
          frequency: personalInfo.frequency
        },
        ratings,
        comments
      };

      // Envoi vers l'API backend
      const response = await fetch('http://localhost:5000/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(surveyData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('Enquête soumise avec succès:', result.data);
        setSubmitted(true);
        setCurrentStep(3);
        
        // Optionnel: stocker l'ID de session pour référence
        localStorage.setItem('surveySessionId', result.data.sessionId);
      } else {
        throw new Error(result.message || 'Erreur lors de la soumission');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      // Gestion d'erreur - afficher un message à l'utilisateur
      alert('Erreur lors de la soumission de l\'enquête. Veuillez réessayer.');
    }
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
