import { useState } from 'react';

const FALLBACK = '/favicon.svg';

const CategoryImage = ({ category, className, title }) => {
  const original = category?.imagen;
  const [src, setSrc] = useState(() =>
    original ? original.replace(/\.png$/i, '.webp') : FALLBACK
  );

  const handleError = () => {
    if (src === FALLBACK) return;
    setSrc(original && original !== src ? original : FALLBACK);
  };

  return (
    <img
      src={src}
      alt={category?.nombre || ''}
      title={title}
      className={className}
      decoding="async"
      onError={handleError}
    />
  );
};

export default CategoryImage;
