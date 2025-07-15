import React from 'react';
import { getPlaceholders } from './languageData';
import StarRating from './StarRating';

const CategoryEvaluation = ({ 
  category, 
  ratings, 
  handleRatingChange, 
  comments, 
  handleCommentChange, 
  selectedLanguage, 
  t, 
  questions
}) => {
  const placeholders = getPlaceholders(selectedLanguage);
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-500 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className={`p-3 ${category.color} rounded-xl`}>
          <div className={category.iconColor}>
            {category.icon}
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800" dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
            {category.title}
          </h3>
          <p className="text-sm text-gray-500" dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
            {questions.length} {
              selectedLanguage === 'fr' ? 'critères à évaluer' : 
              selectedLanguage === 'ar' ? 'معايير للتقييم' : 
              'criteria to evaluate'
            }
          </p>
        </div>
      </div>
      
      <div className="space-y-6">
        {questions.map((question, questionIndex) => {
          const questionId = `${category.id}_${questionIndex}`;
          return (
            <div key={questionId} className="border-b border-gray-100 pb-4 last:border-b-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <span className="text-gray-700 font-medium" dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
                  {question}
                </span>
                <StarRating 
                  value={ratings[questionId]}
                  onChange={handleRatingChange}
                  questionId={questionId}
                />
              </div>
            </div>
          );
        })}
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2" dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
            {t.comments}
          </label>
          <textarea
            value={comments[category.id] || ''}
            onChange={(e) => handleCommentChange(category.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
            placeholder={placeholders.suggestions}
            dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default CategoryEvaluation;
