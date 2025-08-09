import { useState, useEffect, useMemo } from 'react';
import { languages, getCategoryTitles, getQuestionsByLanguage } from '../components/languageData';
import { logger } from '../utils/logger';

/**
 * Hook pour gérer la langue et les textes associés
 * @returns {Object} Données et fonctions liées à la langue
 */
// Fonction pour détecter la langue du navigateur avec gestion d'erreurs
const getDefaultLanguage = () => {
  const supportedLanguages = ['fr', 'ar', 'en'];
  
  try {
    // 1. Essayer localStorage avec validation stricte
    const savedLanguage = localStorage.getItem('nador-airport-language');
    if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
      logger.language('Langue récupérée depuis localStorage:', savedLanguage);
      return savedLanguage;
    }
    
    // 2. Détecter langue navigateur avec fallback sécurisé
    const browserLang = navigator.language || navigator.userLanguage || 'fr';
    logger.debug('Langue détectée du navigateur:', browserLang);
    
    if (browserLang.toLowerCase().startsWith('ar')) {
      logger.language('Langue arabe détectée depuis le navigateur');
      return 'ar';
    }
    if (browserLang.toLowerCase().startsWith('en')) {
      logger.language('Langue anglaise détectée depuis le navigateur');
      return 'en';
    }
    
    // 3. Défaut français avec log
    logger.language('Utilisation de la langue par défaut: français');
    return 'fr';
    
  } catch (error) {
    // 4. Fallback total en cas d'erreur
    logger.error('Erreur lors de la détection de langue, utilisation du français par défaut', error);
    return 'fr';
  }
};

export const useLanguage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(getDefaultLanguage);

  // Textes selon la langue sélectionnée
  const texts = useMemo(() => 
    languages[selectedLanguage] || languages.fr, 
    [selectedLanguage]
  );

  // Catégories selon la langue sélectionnée
  const categories = useMemo(() => 
    getCategoryTitles(selectedLanguage), 
    [selectedLanguage]
  );

  // Questions par catégorie selon la langue sélectionnée
  const categoryQuestions = useMemo(() => {
    if (!categories) return {};
    
    const result = {};
    Object.keys(categories).forEach(categoryId => {
      result[categoryId] = getQuestionsByLanguage(categoryId, selectedLanguage);
    });
    return result;
  }, [selectedLanguage, categories]);

  // Mise à jour de la direction du texte selon la langue
  const handleLanguageSelect = (language) => {
    try {
      setSelectedLanguage(language);
      
      // 💾 Sauvegarder dans localStorage avec vérification
      localStorage.setItem('nador-airport-language', language);
      
      // 🌍 Appliquer direction et langue
      document.documentElement.lang = language;
      document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
      
      logger.language('Langue changée et sauvegardée:', language);
    } catch (error) {
      logger.error('Erreur lors du changement de langue', error);
    }
  };

  // Effet pour gérer le sens de lecture selon la langue
  useEffect(() => {
    if (selectedLanguage) {
      document.documentElement.lang = selectedLanguage;
      document.body.dir = selectedLanguage === 'ar' ? 'rtl' : 'ltr';
    }
  }, [selectedLanguage]);

  // Réinitialiser la langue
  const resetLanguage = () => {
    try {
      // 🗑️ Nettoyer localStorage
      localStorage.removeItem('nador-airport-language');
      
      // 🔄 Reset à français par défaut
      const defaultLang = 'fr';
      setSelectedLanguage(defaultLang);
      document.body.dir = 'ltr';
      document.documentElement.lang = defaultLang;
      
      logger.language('Langue réinitialisée à:', defaultLang);
    } catch (error) {
      logger.error('Erreur lors de la réinitialisation de la langue', error);
    }
  };

  return {
    selectedLanguage,
    texts,
    categories,
    categoryQuestions,
    handleLanguageSelect,
    resetLanguage,
    isRTL: selectedLanguage === 'ar'
  };
};
