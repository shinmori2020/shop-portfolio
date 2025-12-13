import React, { useState } from 'react';
import './RatingFilter.css';

interface RatingFilterProps {
  selectedRating: number | null;
  minReviews: number;
  onRatingChange: (rating: number | null) => void;
  onMinReviewsChange: (count: number) => void;
}

export const RatingFilter: React.FC<RatingFilterProps> = ({
  selectedRating,
  minReviews,
  onRatingChange,
  onMinReviewsChange
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const ratingOptions = [
    { value: 4, label: '★★★★☆ 以上', stars: 4 },
    { value: 3, label: '★★★☆☆ 以上', stars: 3 },
    { value: 2, label: '★★☆☆☆ 以上', stars: 2 },
    { value: 1, label: '★☆☆☆☆ 以上', stars: 1 }
  ];

  const reviewCountOptions = [
    { value: 0, label: 'すべて' },
    { value: 5, label: '5件以上' },
    { value: 10, label: '10件以上' },
    { value: 20, label: '20件以上' },
    { value: 50, label: '50件以上' }
  ];

  const clearFilter = () => {
    onRatingChange(null);
    onMinReviewsChange(0);
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <span key={index} className={`rating-filter__star ${index < count ? 'rating-filter__star--filled' : ''}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="rating-filter">
      <div className={`rating-filter__header ${isExpanded ? 'rating-filter__header--expanded' : ''}`}>
        <h3 className="rating-filter__title">カスタマーレビュー</h3>
        <div className="rating-filter__actions">
          {(selectedRating !== null || minReviews > 0) && (
            <button
              className="rating-filter__clear"
              onClick={clearFilter}
            >
              クリア
            </button>
          )}
          <button
            className="rating-filter__toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? '折りたたむ' : '展開する'}
          >
            <svg
              className={`rating-filter__arrow ${isExpanded ? 'rating-filter__arrow--expanded' : ''}`}
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
            >
              <path
                d="M1 1L6 6L11 1"
                stroke="#666"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="rating-filter__content">
          <div className="rating-filter__section">
            <h4 className="rating-filter__section-title">評価</h4>
            <div className="rating-filter__rating-options">
              {ratingOptions.map(option => (
                <label key={option.value} className="rating-filter__option">
                  <input
                    type="radio"
                    name="rating"
                    className="rating-filter__radio"
                    checked={selectedRating === option.value}
                    onChange={() => onRatingChange(option.value)}
                  />
                  <div className="rating-filter__stars">
                    {renderStars(option.stars)}
                    <span className="rating-filter__label">以上</span>
                  </div>
                </label>
              ))}
              <label className="rating-filter__option">
                <input
                  type="radio"
                  name="rating"
                  className="rating-filter__radio"
                  checked={selectedRating === null}
                  onChange={() => onRatingChange(null)}
                />
                <span className="rating-filter__label">すべての評価</span>
              </label>
            </div>
          </div>

          <div className="rating-filter__section">
            <h4 className="rating-filter__section-title">レビュー数</h4>
            <div className="rating-filter__review-options">
              {reviewCountOptions.map(option => (
                <label key={option.value} className="rating-filter__option">
                  <input
                    type="radio"
                    name="reviewCount"
                    className="rating-filter__radio"
                    checked={minReviews === option.value}
                    onChange={() => onMinReviewsChange(option.value)}
                  />
                  <span className="rating-filter__label">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};