import React, { useState } from 'react';
import './TrendingFilter.css';

interface TrendingFilterProps {
  selectedOption: string;
  onFilterChange: (option: string) => void;
}

export const TrendingFilter: React.FC<TrendingFilterProps> = ({
  selectedOption,
  onFilterChange
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const trendingOptions = [
    { id: 'none', label: 'すべて', value: 'none' },
    { id: 'new-7days', label: '新着商品（過去7日間）', value: 'new-7days' },
    { id: 'new-30days', label: '新着商品（過去30日間）', value: 'new-30days' },
    { id: 'bestseller', label: '売れ筋ランキングTOP10', value: 'bestseller' },
    { id: 'trending', label: '急上昇中の商品', value: 'trending' },
    { id: 'restocked', label: '再入荷商品', value: 'restocked' },
    { id: 'limited', label: '限定商品', value: 'limited' }
  ];

  const handleRadioChange = (value: string) => {
    onFilterChange(value);
  };

  const clearFilter = () => {
    onFilterChange('none');
  };

  const isFiltered = selectedOption !== 'none';

  return (
    <div className="trending-filter">
      <div className={`trending-filter__header ${isExpanded ? 'trending-filter__header--expanded' : ''}`}>
        <h3 className="trending-filter__title">新着・人気</h3>
        <div className="trending-filter__actions">
          {isFiltered && (
            <button
              className="trending-filter__clear"
              onClick={clearFilter}
            >
              クリア
            </button>
          )}
          <button
            className="trending-filter__toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? '折りたたむ' : '展開する'}
          >
            <svg
              className={`trending-filter__arrow ${isExpanded ? 'trending-filter__arrow--expanded' : ''}`}
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

      <div className={`trending-filter__content ${isExpanded ? 'trending-filter__content--expanded' : ''}`}>
        <div className="trending-filter__options">
          {trendingOptions.map(option => (
            <label key={option.id} className="trending-filter__option">
              <input
                type="radio"
                name="trending"
                className="trending-filter__radio"
                value={option.value}
                checked={selectedOption === option.value}
                onChange={() => handleRadioChange(option.value)}
              />
              <span className="trending-filter__label">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};