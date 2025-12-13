import React from 'react';
import './DiscountFilter.css';

interface DiscountFilterProps {
  selectedDiscounts: string[];
  onDiscountChange: (options: string[]) => void;
}

export const DiscountFilter: React.FC<DiscountFilterProps> = ({
  selectedDiscounts,
  onDiscountChange
}) => {
  const discountOptions = [
    { id: 'timesale', label: '本日のタイムセール', value: 'timesale' },
    { id: 'discount-10', label: '10%以上OFF', value: 'discount-10' },
    { id: 'discount-20', label: '20%以上OFF', value: 'discount-20' },
    { id: 'discount-30', label: '30%以上OFF', value: 'discount-30' },
    { id: 'all-discounts', label: 'すべての割引商品', value: 'all-discounts' }
  ];

  const handleCheckboxChange = (value: string) => {
    const newOptions = selectedDiscounts.includes(value)
      ? selectedDiscounts.filter(opt => opt !== value)
      : [...selectedDiscounts, value];
    onDiscountChange(newOptions);
  };

  const clearAll = () => {
    onDiscountChange([]);
  };

  return (
    <div className="discount-filter">
      <div className="discount-filter__header">
        <h3 className="discount-filter__title">お買い得品&割引</h3>
        {selectedDiscounts.length > 0 && (
          <button
            className="discount-filter__clear"
            onClick={clearAll}
          >
            クリア
          </button>
        )}
      </div>

      <div className="discount-filter__options">
        {discountOptions.map(option => (
          <label key={option.id} className="discount-filter__option">
            <input
              type="checkbox"
              className="discount-filter__checkbox"
              checked={selectedDiscounts.includes(option.value)}
              onChange={() => handleCheckboxChange(option.value)}
            />
            <span className="discount-filter__label">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};