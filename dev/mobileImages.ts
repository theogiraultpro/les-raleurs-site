// À la construction du site : crée une version allégée (WebP, 960 px de large)
// de chaque image JPG/PNG, dans assets/m/. Les téléphones la reçoivent à la
// place de l'original ; les ordinateurs gardent l'image d'origine.
import type { Plugin } from 'vite';
import sharp from 'sharp';

const WIDTH = 960;
const QUALITY = 72;

export function mobileImages(): Plugin {
  return {
    name: 'les-raleurs:mobile-images',
    apply: 'build',
    async generateBundle(_options, bundle) {
      const assets = Object.values(bundle).filter(
        (file) => file.type === 'asset' && /^assets\/[^/]+\.(jpe?g|png)$/i.test(file.fileName),
      );

      const queue = [...assets];
      const worker = async () => {
        for (let file = queue.shift(); file; file = queue.shift()) {
          if (file.type !== 'asset') continue;
          const base = file.fileName.slice('assets/'.length).replace(/\.(jpe?g|png)$/i, '');
          const source = await sharp(Buffer.from(file.source as Uint8Array))
            .rotate()
            .resize({ width: WIDTH, withoutEnlargement: true })
            .webp({ quality: QUALITY })
            .toBuffer();
          this.emitFile({ type: 'asset', fileName: `assets/m/${base}.webp`, source });
        }
      };
      await Promise.all(Array.from({ length: 4 }, worker));
    },
  };
}
