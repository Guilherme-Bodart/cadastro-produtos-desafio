import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const uploadsFolder = path.resolve(__dirname, '..', '..', 'uploads');

export default {
  directory: uploadsFolder,
  storage: multer.diskStorage({
    destination: uploadsFolder,
    filename(request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('hex');
      const fileName = `${fileHash}-${file.originalname.replace(/\s+/g, '_')}`;

      return callback(null, fileName);
    },
  }),
};
