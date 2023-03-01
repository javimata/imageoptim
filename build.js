import { readdir, mkdir, writeFile } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import imagemin from 'imagemin';
import pngquant from 'imagemin-pngquant';
import mozjpeg from 'imagemin-mozjpeg';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
const argv = yargs(hideBin(process.argv)).argv;
import { partial } from "filesize";
const size = partial({base: 2, standard: "jedec"});
import fs from 'fs';

const inputDir = 'input';
const outputDir = 'output';

var widthImg = ( argv.width ) ? argv.width : "auto";
var qtyImg   = ( argv.qty ) ? argv.qty : 80;
var format   = ( argv.format ) ? argv.format : "auto";
var dpi      = ( argv.dpi ) ? argv.dpi : 72;
var qtyper   = qtyImg / 100;

// Lee todos los archivos en la carpeta de entrada
readdir(inputDir, (err, files) => {
  if (err) throw err;

  // Procesa cada archivo de imagen
  files.forEach(file => {
    const inputPath = join(inputDir, file);
    const outputPath = join(outputDir, file);
    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;

    if ( widthImg == "auto" ) {
      widthImg = widthImg.width
    }

    sharp(inputPath)
      .resize( widthImg )
      .withMetadata({ density: dpi })
      // .toFormat({ quality: qtyImg })
      .toBuffer((err, data, info) => {
        if (err) throw err;

        mkdir(outputDir, { recursive: true }, err => {
          if (err) throw err;
          writeFile(outputPath, data, err => {
            if (err) throw err;

            imagemin([outputPath], outputDir, {
              plugins: [
                pngquant({ quality: [0.6, 0.8] }),
                mozjpeg({ quality: qtyImg })
              ]
            }).then(() => {
              console.log('\x1B[34m' + file + '\x1b[0m optimized - Before \x1B[31m' + size(originalSize) + '\x1b[0m - Final size: \x1b[32m' + size(info.size) + '\x1b[0m - qtyImg= ' + qtyImg + '%');
            });
          });
        });

      });

  });
});
