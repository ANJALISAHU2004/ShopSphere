import { ImageOff } from 'lucide-react';
import { useEffect, useState } from 'react';

/** Shows a product image or a stable neutral placeholder. */
export default function ProductImage({ src, alt, name }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <span
        className="product-image product-image--placeholder"
        role="img"
        aria-label={alt}
      >
        <ImageOff aria-hidden="true" />
        <span>{name}</span>
      </span>
    );
  }

  return (
    <span className="product-image">
      <img src={src} alt={alt} onError={() => setFailed(true)} />
    </span>
  );
}
