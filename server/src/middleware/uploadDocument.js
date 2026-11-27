const multer = require('multer');
const AppError = require('../utils/AppError');

const MAX_BYTES = 5 * 1024 * 1024; // matches ck_documents_size

// The type is decided by the extension AND the first bytes of the file,
// never by the Content-Type the browser sends.
const FILE_TYPES = {
  pdf: { mime: 'application/pdf', magic: Buffer.from('%PDF-') },
  doc: { mime: 'application/msword', magic: Buffer.from('d0cf11e0a1b11ae1', 'hex') },
  docx: {
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    magic: Buffer.from('504b0304', 'hex'),
  },
};

const fileError = (code, message) => AppError.validation(code, message, { file: message });

const parser = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1, fields: 10, fieldSize: 1024 },
  defParamCharset: 'utf8', // keeps names like "Résumé.pdf" intact
}).single('file');

function uploadDocument(req, res, next) {
  parser(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(fileError('file_too_large', 'File is too large. The limit is 5 MB.'));
      }
      return next(fileError('invalid_upload', 'The upload could not be read. Choose one file and try again.'));
    }

    const file = req.file;
    if (!file || file.size === 0) return next(fileError('file_required', 'Choose a file to upload.'));

    const ext = file.originalname.split('.').pop().toLowerCase();
    const type = Object.hasOwn(FILE_TYPES, ext) ? FILE_TYPES[ext] : null;
    if (!type || !file.buffer.subarray(0, type.magic.length).equals(type.magic)) {
      return next(fileError('invalid_file_type', 'Wrong file type. Upload a PDF, DOC, or DOCX file.'));
    }

    // Keep the extension when shortening a very long name.
    const name = file.originalname.length > 255
      ? `${file.originalname.slice(0, 254 - ext.length)}.${ext}`
      : file.originalname;

    req.document = { buffer: file.buffer, size: file.size, name, ext, mime: type.mime };
    next();
  });
}

module.exports = { uploadDocument, FILE_TYPES, MAX_BYTES };