import { useMemo } from 'react';

/**
 * Hook pour calculer le progrès du questionnaire
 * @param {number} currentStep - Étape actuelle du questionnaire
 * @param {boolean} submitted - Si le questionnaire a été soumis
 * @param {Object} ratings - Évaluations données par l'utilisateur
 * @param {Object} categoryQuestions - Questions par catégorie
 * @returns {number} Pourcentage de progression
 */
export const useProgressCalculation = (currentStep, submitted, ratings, categoryQuestions) => {
  const progress = useMemo(() => {
    if (currentStep === 0) return 0;
    if (currentStep === 1) return 20;
    if (submitted) return 100;
    
    const totalQuestions = Object.values(categoryQuestions || {})
      .flat()
      .length;
    const answeredQuestions = Object.keys(ratings || {}).length;
    
    return Math.min(
      95,
      20 + Math.round((answeredQuestions / Math.max(totalQuestions, 1)) * 75)
    );
  }, [currentStep, submitted, ratings, categoryQuestions]);
  
  return progress;
};
