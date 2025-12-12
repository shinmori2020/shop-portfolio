import React, { useState, useEffect } from 'react';
import ReactSlider from 'react-slider';
import './PriceFilter.css';

interface PriceFilterProps {
  min: number;
  max: number;
  currentMin?: number;
  currentMax?: number;
  onPriceChange: (min: number, max: number) => void;
}

export const PriceFilter: React.FC<PriceFilterProps> = ({
  min,
  max,
  currentMin,
  currentMax,
  onPriceChange
}) => {
  const [values, setValues] = useState([currentMin || min, currentMax || max]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setValues([currentMin || min, currentMax || max]);
  }, [currentMin, currentMax, min, max]);

  const handleSliderChange = (newValues: number[]) => {
    setValues(newValues);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= min && value <= values[1]) {
      setValues([value, values[1]]);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= values[0] && value <= max) {
      setValues([values[0], value]);
    }
  };

  const handleApply = () => {
    onPriceChange(values[0], values[1]);
  };

  const handleReset = () => {
    setValues([min, max]);
    onPriceChange(min, max);
  };

  const isFiltered = values[0] !== min || values[1] !== max;

  return (
    <div className="price-filter">
      <button
        className={`price-filter__toggle ${isExpanded ? 'price-filter__toggle--expanded' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>価格帯</span>
        {isFiltered && (
          <span className="price-filter__badge">
            ¥{values[0].toLocaleString()} - ¥{values[1].toLocaleString()}
          </span>
        )}
        <svg
          className="price-filter__arrow"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
        >
          <path
            d="M1 1L6 6L11 1"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="price-filter__content">
          <div className="price-filter__slider-container">
            <ReactSlider
              className="price-filter__react-slider"
              thumbClassName="price-filter__thumb"
              trackClassName="price-filter__track"
              value={values}
              onChange={handleSliderChange}
              min={min}
              max={max}
              step={1000}
              minDistance={1000}
              pearling
              withTracks
            />
          </div>

          <div className="price-filter__inputs">
            <div className="price-filter__input-group">
              <label htmlFor="min-price">最小</label>
              <div className="price-filter__input-wrapper">
                <span>¥</span>
                <input
                  id="min-price"
                  type="number"
                  value={values[0]}
                  onChange={handleMinInputChange}
                  min={min}
                  max={values[1]}
                  step={1000}
                />
              </div>
            </div>
            <span className="price-filter__separator">-</span>
            <div className="price-filter__input-group">
              <label htmlFor="max-price">最大</label>
              <div className="price-filter__input-wrapper">
                <span>¥</span>
                <input
                  id="max-price"
                  type="number"
                  value={values[1]}
                  onChange={handleMaxInputChange}
                  min={values[0]}
                  max={max}
                  step={1000}
                />
              </div>
            </div>
          </div>

          <div className="price-filter__actions">
            <button
              className="price-filter__reset"
              onClick={handleReset}
              disabled={!isFiltered}
            >
              リセット
            </button>
            <button
              className="price-filter__apply"
              onClick={handleApply}
            >
              適用
            </button>
          </div>
        </div>
      )}
    </div>
  );
};