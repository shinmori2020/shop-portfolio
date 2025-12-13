import React, { useState } from 'react';
import './BrandFilter.css';

interface BrandFilterProps {
  brands: string[];
  selectedBrands: string[];
  onBrandChange: (brands: string[]) => void;
}

export const BrandFilter: React.FC<BrandFilterProps> = ({
  brands,
  selectedBrands,
  onBrandChange
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCheckboxChange = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    onBrandChange(newBrands);
  };

  const clearAll = () => {
    onBrandChange([]);
  };

  return (
    <div className="brand-filter">
      <div className="brand-filter__header">
        <h3 className="brand-filter__title">ブランド</h3>
        <div className="brand-filter__actions">
          {selectedBrands.length > 0 && (
            <button
              className="brand-filter__clear"
              onClick={clearAll}
            >
              クリア
            </button>
          )}
          <button
            className="brand-filter__toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? '折りたたむ' : '展開する'}
          >
            <svg
              className={`brand-filter__arrow ${isExpanded ? 'brand-filter__arrow--expanded' : ''}`}
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
        <div className="brand-filter__options">
          {brands.map(brand => (
            <label key={brand} className="brand-filter__option">
              <input
                type="checkbox"
                className="brand-filter__checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => handleCheckboxChange(brand)}
              />
              <span className="brand-filter__label">{brand}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};