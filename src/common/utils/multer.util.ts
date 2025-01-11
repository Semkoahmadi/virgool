import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { mkdirSync } from 'fs';
import { extname, join } from 'path';

export type CallbackDistination = (error: Error, destination: string) => void;
export type CallbackFilename = (error: Error, filename: string) => void;
export type MulterFile = Express.Multer.File;
export function multerDestination(fieldName: string) {
  return function (
    req: Request,
    file: MulterFile,
    callback: CallbackDistination
  ): void {
    let path = join('public', 'upload', fieldName);
    mkdirSync(path, { recursive: true });
    callback(null, path);
  };
}

export function multerFilename(
  req: Request,
  file: MulterFile,
  callback: CallbackFilename
): void {
  const ext = extname(file.originalname).toLowerCase();
  if (!isValidImageFormat(ext)) {
    callback(new BadRequestException('Veryy Very Gwat..!'), null);
  } else {
    const filename = `${Date.now()}${ext}`;
    callback(null, filename);
  }
}
function isValidImageFormat(ext: string) {
  return ['.png', '.jpeg', '.jpg'].includes(ext);
}
