import React, { useState, useEffect } from 'react';

interface TypewriterDotsProps {
  className?: string;
}

export const TypewriterDots: React.FC<TypewriterDotsProps> = ({ className = '' }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '') return '.';
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '';
      });
    }, 500); // Change every 500ms for a smooth typewriter effect

    return () => clearInterval(interval);
  }, []);

  return (
    <span className={`inline-block w-6 text-left drop-shadow-md ${className}`}>
      {dots}
    </span>
  );
};
