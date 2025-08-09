import React from 'react';
import PropTypes from 'prop-types';

/**
 * Composant affichant la progression du questionnaire
 * @param {Object} props - Propriétés du composant
 * @returns {JSX.Element} Composant ProgressIndicator
 */
const ProgressIndicator = ({ progress }) => {
  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      {/* Version ultra-compacte pour mobile */}
      <div className="sm:hidden flex items-center space-x-1">
        <div className="w-4 h-4 rounded-full border-2 border-gray-200 relative">
          <div 
            className="absolute inset-0 rounded-full border-2 border-blue-600 border-r-transparent transition-transform duration-500"
            style={{ transform: `rotate(${(progress / 100) * 360}deg)` }}
          />
        </div>
        <span className="text-xs text-gray-600 font-medium">{progress}%</span>
      </div>
      
      {/* Version normale pour desktop */}
      <div className="hidden sm:flex items-center space-x-2">
        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
          {progress}%
        </span>
      </div>
    </div>
  );
};

ProgressIndicator.propTypes = {
  progress: PropTypes.number.isRequired
};

export default ProgressIndicator;
