import React from 'react';
import './Card.css';

export interface CardProps {
  children: React.ReactNode;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large';
  hoverable?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'medium',
  shadow = 'small',
  hoverable = false,
  className = '',
  onClick,
}) => {
  const classNames = [
    'card',
    `card--padding-${padding}`,
    `card--shadow-${shadow}`,
    hoverable && 'card--hoverable',
    onClick && 'card--clickable',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} onClick={onClick}>
      {children}
    </div>
  );
};
