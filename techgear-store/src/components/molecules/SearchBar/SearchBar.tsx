import React, { useState, useEffect } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  debounceTime?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '商品を検索...',
  value = '',
  onSearch,
  onClear,
  debounceTime = 300
}) => {
  const [searchQuery, setSearchQuery] = useState(value);
  const [isTyping, setIsTyping] = useState(false);

  // デバウンス処理
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== value) {
        onSearch(searchQuery);
      }
      setIsTyping(false);
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceTime]);

  // 外部からの値の変更に対応
  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsTyping(true);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
    if (onClear) {
      onClear();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setIsTyping(false);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-bar__container">
        <div className="search-bar__icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
              stroke="currentColor"
              strokeWidth="1.66667"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <input
          type="text"
          className="search-bar__input"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleChange}
          aria-label="検索"
        />
        {searchQuery && (
          <button
            type="button"
            className="search-bar__clear"
            onClick={handleClear}
            aria-label="クリア"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        {isTyping && (
          <div className="search-bar__spinner">
            <div className="search-bar__spinner-dot"></div>
            <div className="search-bar__spinner-dot"></div>
            <div className="search-bar__spinner-dot"></div>
          </div>
        )}
      </div>
    </form>
  );
};