import React from 'react';
import PropTypes from 'prop-types';

/**
 * Composant affichant la progression du questionnaire
 * @param {Object} props - Propriétés du composant
 * @returns {JSX.Element} Composant ProgressIndicator
 */
const ProgressIndicator = ({ progress }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-sm text-gray-600 font-medium">{progress}%</span>
    </div>
  );
};

ProgressIndicator.propTypes = {
  progress: PropTypes.number.isRequired
};

export default ProgressIndicator;
