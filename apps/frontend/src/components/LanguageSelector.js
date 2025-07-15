import React from 'react';
import { Globe, Plane } from 'lucide-react';
import { languages } from './languageData';

const LanguageSelector = ({ onLanguageSelect }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Globe className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Bienvenue / مرحباً / Welcome
          </h2>
          <p className="text-gray-600">
            Veuillez sélectionner votre langue / يرجى اختيار لغتكم / Please select your language
          </p>
        </div>
        
        <div className="space-y-3">
          {Object.values(languages).map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageSelect(lang.code)}
              className="w-full flex items-center space-x-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
            >
              <span className="text-3xl">{lang.flag}</span>
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-800 group-hover:text-blue-600">
                  {lang.name}
                </div>
                <div className="text-sm text-gray-500">
                  {lang.title}
                </div>
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-blue-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-blue-500"></div>
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Plane className="w-4 h-4" />
            <span>Aéroport Al Aroui - Nador</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
