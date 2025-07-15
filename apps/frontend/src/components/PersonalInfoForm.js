import React from 'react';
import { getFormLabels } from './languageData';

const PersonalInfoForm = ({ personalInfo, setPersonalInfo, t, selectedLanguage, onContinue }) => {
  const formLabels = getFormLabels(selectedLanguage);
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6" dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
        {t.personalInfo}
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6" dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
            {formLabels.ageGroup}
          </label>
          <select 
            value={personalInfo.age}
            onChange={(e) => setPersonalInfo(prev => ({...prev, age: e.target.value}))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
          >
            <option value="">{formLabels.select}</option>
            <option value="18-25">{formLabels.ages['18-25']}</option>
            <option value="26-35">{formLabels.ages['26-35']}</option>
            <option value="36-50">{formLabels.ages['36-50']}</option>
            <option value="51-65">{formLabels.ages['51-65']}</option>
            <option value="65+">{formLabels.ages['65+']}</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
            {formLabels.nationality}
          </label>
          <select 
            value={personalInfo.nationality}
            onChange={(e) => setPersonalInfo(prev => ({...prev, nationality: e.target.value}))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
          >
            <option value="">{formLabels.select}</option>
            <option value="marocaine">{formLabels.nationalities.marocaine}</option>
            <option value="francaise">{formLabels.nationalities.francaise}</option>
            <option value="espagnole">{formLabels.nationalities.espagnole}</option>
            <option value="allemande">{formLabels.nationalities.allemande}</option>
            <option value="autre">{formLabels.nationalities.autre}</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
            {formLabels.travelPurpose}
          </label>
          <select 
            value={personalInfo.travelPurpose}
            onChange={(e) => setPersonalInfo(prev => ({...prev, travelPurpose: e.target.value}))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
          >
            <option value="">{formLabels.select}</option>
            <option value="tourisme">{formLabels.purposes.tourisme}</option>
            <option value="affaires">{formLabels.purposes.affaires}</option>
            <option value="famille">{formLabels.purposes.famille}</option>
            <option value="autre">{formLabels.purposes.autre}</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
            {formLabels.frequency}
          </label>
          <select 
            value={personalInfo.frequency}
            onChange={(e) => setPersonalInfo(prev => ({...prev, frequency: e.target.value}))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
          >
            <option value="">{formLabels.select}</option>
            <option value="premiere">{formLabels.frequencies.premiere}</option>
            <option value="occasionnel">{formLabels.frequencies.occasionnel}</option>
            <option value="regulier">{formLabels.frequencies.regulier}</option>
            <option value="frequent">{formLabels.frequencies.frequent}</option>
          </select>
        </div>
      </div>
      
      <button 
        onClick={onContinue}
        className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
      >
        {t.continueEval}
      </button>
    </div>
  );
};

export default PersonalInfoForm;
