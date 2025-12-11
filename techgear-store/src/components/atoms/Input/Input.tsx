import React, { InputHTMLAttributes } from 'react';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  return (
    <div className={`input-wrapper ${fullWidth ? 'input-wrapper--full-width' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="input__label">
          {label}
          {props.required && <span className="input__required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`input ${hasError ? 'input--error' : ''} ${className}`}
        aria-invalid={hasError}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className="input__error">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={`${inputId}-helper`} className="input__helper">
          {helperText}
        </span>
      )}
    </div>
  );
};
