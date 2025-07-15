import { useState, useEffect, useMemo } from 'react';
import { languages, getCategoryTitles, getQuestionsByLanguage } from '../components/languageData';

/**
 * Hook pour gérer la langue et les textes associés
 * @returns {Object} Données et fonctions liées à la langue
 */
export const useLanguage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('');

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
    document.documentElement.lang = language;
    document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
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
    document.body.dir = 'ltr';
    document.documentElement.lang = 'fr';
    setSelectedLanguage('');
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
