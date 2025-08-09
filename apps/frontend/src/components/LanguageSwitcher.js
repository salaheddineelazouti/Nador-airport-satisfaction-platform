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
    <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
      {Object.entries(languages).map(([code, lang]) => (
        <button
          key={code}
          onClick={() => onLanguageSelect(code)}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
            selectedLanguage === code 
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          }`}
          aria-label={`Changer la langue en ${lang.name}`}
        >
          <span className="text-sm sm:text-base">{lang.flag}</span>
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
