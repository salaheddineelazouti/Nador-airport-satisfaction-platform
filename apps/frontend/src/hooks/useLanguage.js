import { useState, useEffect, useMemo } from 'react';
import { languages, getCategoryTitles, getQuestionsByLanguage } from '../components/languageData';

/**
 * Hook pour gérer la langue et les textes associés
 * @returns {Object} Données et fonctions liées à la langue
 */
// Fonction pour détecter la langue du navigateur
const getDefaultLanguage = () => {
  // 1. Essayer localStorage
  const savedLanguage = localStorage.getItem('nador-airport-language');
  if (savedLanguage && ['fr', 'ar', 'en'].includes(savedLanguage)) {
    return savedLanguage;
  }
  
  // 2. Détecter langue navigateur
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang.startsWith('ar')) return 'ar';
  if (browserLang.startsWith('en')) return 'en';
  
  // 3. Défaut français
  return 'fr';
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
    setSelectedLanguage(language);
    
    // 💾 Sauvegarder dans localStorage
    localStorage.setItem('nador-airport-language', language);
    
    // 🌍 Appliquer direction et langue
    document.documentElement.lang = language;
    document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
    
    console.log('🌍 Langue changée et sauvegardée:', language);
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
    // 🗑️ Nettoyer localStorage
    localStorage.removeItem('nador-airport-language');
    
    // 🔄 Reset à français par défaut
    const defaultLang = 'fr';
    setSelectedLanguage(defaultLang);
    document.body.dir = 'ltr';
    document.documentElement.lang = defaultLang;
    
    console.log('🔄 Langue réinitialisée à:', defaultLang);
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
