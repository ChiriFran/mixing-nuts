import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const DIRS = ['public/images/categories'];
const SIZE = 400;
const QUALITY = 80;

const kb = (bytes) => `${Math.round(bytes / 1024)}KB`;

for (const dir of DIRS) {
  const files = (await readdir(dir)).filter((f) => f.endsWith('.png'));

  for (const file of files) {
    const input = path.join(dir, file);
    const output = path.join(dir, file.replace(/\.png$/i, '.webp'));

    const before = (await stat(input)).size;
    await sharp(input)
      .resize(SIZE, SIZE, { fit: 'inside' })
      .webp({ quality: QUALITY })
      .toFile(output);
    const after = (await stat(output)).size;

    console.log(`${file} -> ${path.basename(output)}  ${kb(before)} -> ${kb(after)}`);
  }
}
