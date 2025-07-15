import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ value, onChange, questionId }) => {
  return (
    <div className="flex space-x-1 star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(questionId, star)}
          className="focus:outline-none transition-colors duration-150"
        >
          <Star
            className={`w-6 h-6 ${
              star <= (value || 0)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
