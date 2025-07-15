import React, { useState } from 'react';
import { Star } from 'lucide-react';
import PropTypes from 'prop-types';
import './StarRating.css';

/**
 * Composant de notation par étoiles avec animation et feedback
 * @param {number} value - Valeur actuelle de la notation (1-5)
 * @param {function} onChange - Fonction appelée lors du changement de note
 * @param {string} questionId - Identifiant de la question associée
 * @returns {JSX.Element} Composant StarRating
 */
const StarRating = ({ value, onChange, questionId }) => {
  // État pour gérer l'animation pop sur l'étoile sélectionnée
  const [animatedStar, setAnimatedStar] = useState(null);
  
  // État pour gérer l'effet de survol
  const [hoveredStar, setHoveredStar] = useState(null);

  // Gestion du clic sur une étoile
  const handleStarClick = (star) => {
    onChange(questionId, star);
    setAnimatedStar(star);
    
    // Réinitialiser l'animation après 300ms
    setTimeout(() => {
      setAnimatedStar(null);
    }, 300);
  };

  // Style CSS pour l'animation pop
  const popAnimation = `
    @keyframes pop {
      0% { transform: scale(1); }
      50% { transform: scale(1.3); }
      100% { transform: scale(1); }
    }
    .star-pop {
      animation: pop 0.3s ease-in-out;
    }
  `;

  return (
    <div className="relative">
      {/* Style pour l'animation pop */}
      <style>{popAnimation}</style>
      
      {/* Composant d'étoiles */}
      <div className="flex space-x-2 star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
            className="focus:outline-none transition-all duration-150 transform hover:-translate-y-1"
            aria-label={`Noter ${star} étoiles`}
          >
            <Star
              className={`w-7 h-7 transition-all duration-200 ${animatedStar === star ? 'star-pop' : ''} ${
                star <= (value || 0)
                  ? 'text-yellow-400 fill-current'
                  : hoveredStar && star <= hoveredStar
                    ? 'text-yellow-300 fill-current'
                    : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

StarRating.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  questionId: PropTypes.string.isRequired
};

export default StarRating;
