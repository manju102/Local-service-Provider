import { useState } from 'react';
import { Star } from 'lucide-react';
import './StarRating.css';

const StarRating = ({ rating = 0, onRate, size = 18, count = 5 }) => {
  const [hovered, setHovered] = useState(0);
  const interactive = typeof onRate === 'function';

  return (
    <div className={`star-rating ${interactive ? 'interactive' : ''}`}>
      {Array.from({ length: count }, (_, i) => {
        const starIndex = i + 1;
        const filled = interactive
          ? starIndex <= (hovered || rating)
          : starIndex <= Math.round(rating);

        return (
          <button
            key={i}
            type="button"
            className={`star-btn ${filled ? 'filled' : 'empty'}`}
            onClick={() => interactive && onRate(starIndex)}
            onMouseEnter={() => interactive && setHovered(starIndex)}
            onMouseLeave={() => interactive && setHovered(0)}
            disabled={!interactive}
            aria-label={`Rate ${starIndex} star${starIndex > 1 ? 's' : ''}`}
          >
            <Star
              size={size}
              fill={filled ? 'var(--star-gold)' : 'none'}
              stroke={filled ? 'var(--star-gold)' : 'var(--star-empty)'}
              strokeWidth={2}
            />
          </button>
        );
      })}
      {!interactive && rating > 0 && (
        <span className="star-value">{Number(rating).toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating;
