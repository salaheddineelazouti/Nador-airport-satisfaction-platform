import React from 'react';
import PropTypes from 'prop-types';
import { languages } from './languageData';

/**
 * Composant pour changer la langue du questionnaire
 * @param {Object} props - Propriétés du composant
 * @returns {JSX.Element} Composant LanguageSwitcher
 */
const LanguageSwitcher = ({ selectedLanguage, onLanguageSelect }) => {
  return (
    <div className="flex space-x-2">
      {Object.entries(languages).map(([code, lang]) => (
        <button
          key={code}
          onClick={() => onLanguageSelect(code)}
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            selectedLanguage === code 
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          }`}
          aria-label={`Changer la langue en ${lang.name}`}
        >
          <span>{lang.flag}</span>
        </button>
      ))}
    </div>
  );
};

LanguageSwitcher.propTypes = {
  selectedLanguage: PropTypes.string.isRequired,
  onLanguageSelect: PropTypes.func.isRequired
};

export default LanguageSwitcher;
