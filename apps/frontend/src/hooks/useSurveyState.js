import { useState } from 'react';
import { apiRequest } from '../config/api';
import { validateSurveyData, validateSecurityConstraints } from '../utils/dataValidator';

/**
 * Hook pour gérer l'état du questionnaire
 * @returns {Object} État et fonctions pour gérer le questionnaire
 */
export const useSurveyState = (selectedLanguage = 'fr') => {
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
        language: selectedLanguage || 'fr', // Récupération de la langue sélectionnée
        personalInfo: {
          age: personalInfo.age,
          nationality: personalInfo.nationality,
          travelPurpose: personalInfo.travelPurpose,
          frequency: personalInfo.frequency
        },
        ratings,
        comments
      };

      // Validation et nettoyage des données
      const cleanSurveyData = {
        language: surveyData.language,
        personalInfo: {
          age: surveyData.personalInfo.age || undefined,
          nationality: surveyData.personalInfo.nationality || undefined,
          travelPurpose: surveyData.personalInfo.travelPurpose || undefined,
          frequency: surveyData.personalInfo.frequency || undefined
        },
        ratings: Object.fromEntries(
          Object.entries(surveyData.ratings).filter(([key, value]) => 
            value !== null && value !== undefined && value >= 1 && value <= 5
          )
        ),
        comments: surveyData.comments || {}
      };

      console.log('📤 Données préparées pour envoi:', cleanSurveyData);
      
      // 🛡️ COUCHE 1 : VALIDATION CÔTÉ FRONTEND
      const validation = validateSurveyData(cleanSurveyData);
      
      if (!validation.isValid) {
        console.error('❌ Validation côté frontend échouée:', validation.errors);
        throw new Error(`Erreurs de validation : ${validation.errors.map(e => e.message).join(', ')}`);
      }
      
      // 🔒 COUCHE 2 : VALIDATION DE SÉCURITÉ
      const securityErrors = validateSecurityConstraints(cleanSurveyData);
      
      if (securityErrors.length > 0) {
        console.error('🚨 Erreurs de sécurité détectées:', securityErrors);
        throw new Error(`Erreurs de sécurité : ${securityErrors.map(e => e.message).join(', ')}`);
      }
      
      console.log('✅ Toutes les validations côté frontend réussies');

      // 📤 ENVOI VERS L'API BACKEND
      const result = await apiRequest('/api/surveys', {
        method: 'POST',
        body: JSON.stringify(cleanSurveyData)
      });

      if (result.success) {
        console.log('Enquête soumise avec succès:', result.data);
        setSubmitted(true);
        setCurrentStep(3);
        
        // Stocker l'ID de session pour référence
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
