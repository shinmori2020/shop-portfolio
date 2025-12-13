import React from 'react';
import './StockFilter.css';

interface StockFilterProps {
  selectedOptions: string[];
  onFilterChange: (options: string[]) => void;
}

export const StockFilter: React.FC<StockFilterProps> = ({
  selectedOptions,
  onFilterChange
}) => {
  const stockOptions = [
    { id: 'in-stock', label: '在庫あり', value: 'in-stock' },
    { id: 'ready-to-ship', label: '即日発送可能', value: 'ready-to-ship' },
    { id: 'low-stock', label: '残りわずか', value: 'low-stock' },
    { id: 'include-out-of-stock', label: '在庫切れを含む', value: 'include-out-of-stock' }
  ];

  const handleRadioChange = (value: string) => {
    // 在庫フィルターはラジオボタン（単一選択）
    onFilterChange([value]);
  };

  const clearFilter = () => {
    onFilterChange([]);
  };

  return (
    <div className="stock-filter">
      <div className="stock-filter__header">
        <h3 className="stock-filter__title">在庫状況</h3>
        {selectedOptions.length > 0 && (
          <button
            className="stock-filter__clear"
            onClick={clearFilter}
          >
            クリア
          </button>
        )}
      </div>

      <div className="stock-filter__options">
        {stockOptions.map(option => (
          <label key={option.id} className="stock-filter__option">
            <input
              type="radio"
              name="stock-filter"
              className="stock-filter__radio"
              checked={selectedOptions.includes(option.value)}
              onChange={() => handleRadioChange(option.value)}
            />
            <span className="stock-filter__label">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};