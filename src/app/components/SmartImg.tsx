import type { ImgHTMLAttributes } from 'react';
import { isPhone, mobileSrc, PHONE_QUERY } from '../lib/mobile';

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  /** Sur téléphone : ne charger l'image qu'à l'approche de l'écran. */
  lazy?: boolean;
};

/**
 * Image normale sur ordinateur ; sur téléphone, sert la version allégée
 * (WebP 960 px) quand elle existe. Aucun changement de mise en page.
 */
export function SmartImg({ lazy, src, ...rest }: Props) {
  const small = mobileSrc(src);
  const img = (
    <img
      src={src}
      {...rest}
      loading={lazy && isPhone ? 'lazy' : rest.loading}
      decoding={isPhone ? 'async' : rest.decoding}
    />
  );
  if (!small) return img;
  return (
    <picture style={{ display: 'contents' }}>
      <source media={PHONE_QUERY} srcSet={small} type="image/webp" />
      {img}
    </picture>
  );
}
