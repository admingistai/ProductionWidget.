import React from 'react';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export const Image: React.FC<ImageProps> = ({ 
  src, 
  alt = '', 
  fallback = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24"%3E%3Crect width="24" height="24" fill="%23ddd"/%3E%3C/svg%3E',
  onError,
  ...props 
}) => {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (fallback && e.currentTarget.src !== fallback) {
      e.currentTarget.src = fallback;
    }
    if (onError) {
      onError(e);
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
};