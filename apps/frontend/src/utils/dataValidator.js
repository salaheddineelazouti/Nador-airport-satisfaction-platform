/**
 * 🛡️ COUCHE DE VALIDATION FRONTEND
 * Validation des données avant envoi au backend
 */

// Définitions centralisées des valeurs acceptées
const VALIDATION_RULES = {
  LANGUAGES: ['fr', 'ar', 'en', 'am'],
  AGE_RANGES: ['18-25', '26-35', '36-50', '51-65', '65+'],
  TRAVEL_PURPOSES: ['tourisme', 'affaires', 'famille', 'autre'],
  FREQUENCIES: ['premiere', 'occasionnel', 'regulier', 'frequent'],
  
  // Catégories de ratings (sync avec backend)
  RATING_CATEGORIES: [
    // Accès terminal (6 questions)
    'acces_terminal_0', 'acces_terminal_1', 'acces_terminal_2',
    'acces_terminal_3', 'acces_terminal_4', 'acces_terminal_5',
    
    // Enregistrement et contrôles (9 questions)
    'enregistrement_controles_0', 'enregistrement_controles_1', 'enregistrement_controles_2',
    'enregistrement_controles_3', 'enregistrement_controles_4', 'enregistrement_controles_5',
    'enregistrement_controles_6', 'enregistrement_controles_7', 'enregistrement_controles_8',
    
    // Zones d'attente (4 questions)
    'zones_attente_0', 'zones_attente_1', 'zones_attente_2', 'zones_attente_3',
    
    // Services et commodités (6 questions)
    'services_commodites_0', 'services_commodites_1', 'services_commodites_2',
    'services_commodites_3', 'services_commodites_4', 'services_commodites_5',
    
    // Hygiène et infrastructure (4 questions)
    'hygiene_infrastructure_0', 'hygiene_infrastructure_1',
    'hygiene_infrastructure_2', 'hygiene_infrastructure_3',
    
    // Personnel et service (2 questions)
    'personnel_service_0', 'personnel_service_1'
  ],
  
  RATING_RANGE: { min: 1, max: 5 },
  NATIONALITY_MAX_LENGTH: 100,
  MIN_RATINGS_REQUIRED: 1
};

/**
 * Valide la langue sélectionnée
 */
export const validateLanguage = (language) => {
  const errors = [];
  
  if (!language) {
    errors.push({
      field: 'language',
      message: 'La langue est obligatoire',
      code: 'LANGUAGE_REQUIRED'
    });
  } else if (!VALIDATION_RULES.LANGUAGES.includes(language)) {
    errors.push({
      field: 'language',
      message: `Langue invalide. Valeurs acceptées: ${VALIDATION_RULES.LANGUAGES.join(', ')}`,
      code: 'LANGUAGE_INVALID'
    });
  }
  
  return errors;
};

/**
 * Valide les informations personnelles
 */
export const validatePersonalInfo = (personalInfo) => {
  const errors = [];
  
  if (!personalInfo) return errors;
  
  // Validation âge
  if (personalInfo.age && !VALIDATION_RULES.AGE_RANGES.includes(personalInfo.age)) {
    errors.push({
      field: 'personalInfo.age',
      message: `Tranche d'âge invalide. Valeurs acceptées: ${VALIDATION_RULES.AGE_RANGES.join(', ')}`,
      code: 'AGE_INVALID'
    });
  }
  
  // Validation nationalité
  if (personalInfo.nationality && personalInfo.nationality.length > VALIDATION_RULES.NATIONALITY_MAX_LENGTH) {
    errors.push({
      field: 'personalInfo.nationality',
      message: `Nationalité trop longue (max ${VALIDATION_RULES.NATIONALITY_MAX_LENGTH} caractères)`,
      code: 'NATIONALITY_TOO_LONG'
    });
  }
  
  // Validation motif de voyage
  if (personalInfo.travelPurpose && !VALIDATION_RULES.TRAVEL_PURPOSES.includes(personalInfo.travelPurpose)) {
    errors.push({
      field: 'personalInfo.travelPurpose',
      message: `Motif de voyage invalide. Valeurs acceptées: ${VALIDATION_RULES.TRAVEL_PURPOSES.join(', ')}`,
      code: 'TRAVEL_PURPOSE_INVALID'
    });
  }
  
  // Validation fréquence
  if (personalInfo.frequency && !VALIDATION_RULES.FREQUENCIES.includes(personalInfo.frequency)) {
    errors.push({
      field: 'personalInfo.frequency',
      message: `Fréquence invalide. Valeurs acceptées: ${VALIDATION_RULES.FREQUENCIES.join(', ')}`,
      code: 'FREQUENCY_INVALID'
    });
  }
  
  return errors;
};

/**
 * Valide les évaluations (ratings)
 */
export const validateRatings = (ratings) => {
  const errors = [];
  
  if (!ratings || typeof ratings !== 'object') {
    errors.push({
      field: 'ratings',
      message: 'Les évaluations sont obligatoires et doivent être un objet',
      code: 'RATINGS_REQUIRED'
    });
    return errors;
  }
  
  const ratingKeys = Object.keys(ratings);
  
  // Vérifier qu'il y a au moins une évaluation
  if (ratingKeys.length < VALIDATION_RULES.MIN_RATINGS_REQUIRED) {
    errors.push({
      field: 'ratings',
      message: `Au moins ${VALIDATION_RULES.MIN_RATINGS_REQUIRED} évaluation est requise`,
      code: 'RATINGS_MIN_REQUIRED'
    });
  }
  
  // Valider chaque évaluation
  ratingKeys.forEach(category => {
    // Vérifier que la catégorie est valide
    if (!VALIDATION_RULES.RATING_CATEGORIES.includes(category)) {
      errors.push({
        field: `ratings.${category}`,
        message: `Catégorie d'évaluation invalide: ${category}`,
        code: 'RATING_CATEGORY_INVALID'
      });
    }
    
    const rating = ratings[category];
    const numRating = Number(rating);
    
    // Vérifier que la note est un nombre entier entre 1 et 5
    if (!Number.isInteger(numRating) || numRating < VALIDATION_RULES.RATING_RANGE.min || numRating > VALIDATION_RULES.RATING_RANGE.max) {
      errors.push({
        field: `ratings.${category}`,
        message: `Note invalide pour ${category}: doit être un entier entre ${VALIDATION_RULES.RATING_RANGE.min} et ${VALIDATION_RULES.RATING_RANGE.max}`,
        code: 'RATING_VALUE_INVALID'
      });
    }
  });
  
  return errors;
};

/**
 * Valide les commentaires
 */
export const validateComments = (comments) => {
  const errors = [];
  
  if (comments && typeof comments !== 'object') {
    errors.push({
      field: 'comments',
      message: 'Les commentaires doivent être un objet',
      code: 'COMMENTS_INVALID_TYPE'
    });
  }
  
  return errors;
};

/**
 * 🛡️ VALIDATION COMPLÈTE DES DONNÉES D'ENQUÊTE
 */
export const validateSurveyData = (surveyData) => {
  console.log('🛡️ Validation côté frontend des données:', surveyData);
  
  const allErrors = [
    ...validateLanguage(surveyData.language),
    ...validatePersonalInfo(surveyData.personalInfo),
    ...validateRatings(surveyData.ratings),
    ...validateComments(surveyData.comments)
  ];
  
  const isValid = allErrors.length === 0;
  
  const result = {
    isValid,
    errors: allErrors,
    summary: {
      totalErrors: allErrors.length,
      errorsByField: allErrors.reduce((acc, error) => {
        acc[error.field] = (acc[error.field] || 0) + 1;
        return acc;
      }, {})
    }
  };
  
  if (!isValid) {
    console.warn('❌ Validation côté frontend échouée:', result);
  } else {
    console.log('✅ Validation côté frontend réussie');
  }
  
  return result;
};

/**
 * 🔒 VALIDATION DE SÉCURITÉ SUPPLÉMENTAIRE
 */
export const validateSecurityConstraints = (surveyData) => {
  const errors = [];
  
  // Anti-spam : vérifier les patterns suspects
  if (surveyData.comments) {
    Object.values(surveyData.comments).forEach(comment => {
      if (typeof comment === 'string') {
        // Détecter du contenu potentiellement malveillant
        const suspiciousPatterns = [
          /<script/i,
          /javascript:/i,
          /on\w+\s*=/i,
          /\beval\s*\(/i
        ];
        
        if (suspiciousPatterns.some(pattern => pattern.test(comment))) {
          errors.push({
            field: 'comments',
            message: 'Contenu suspect détecté dans les commentaires',
            code: 'SECURITY_SUSPICIOUS_CONTENT'
          });
        }
        
        // Limiter la longueur des commentaires
        if (comment.length > 2000) {
          errors.push({
            field: 'comments',
            message: 'Commentaire trop long (max 2000 caractères)',
            code: 'COMMENT_TOO_LONG'
          });
        }
      }
    });
  }
  
  return errors;
};

const dataValidator = {
  validateSurveyData,
  validateSecurityConstraints,
  VALIDATION_RULES
};

export default dataValidator;
