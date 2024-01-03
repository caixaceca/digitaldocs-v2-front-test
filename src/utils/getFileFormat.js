// @mui
import Box from '@mui/material/Box';
// components
import Image from '../components/Image';

// ----------------------------------------------------------------------

const FORMAT_IMG = ['jpg', 'jpeg', 'gif', 'bmp', 'png'];
const FORMAT_VIDEO = ['m4v', 'avi', 'mpg', 'mp4', 'webm'];
const FORMAT_WORD = ['doc', 'docx'];
const FORMAT_EXCEL = ['xls', 'xlsx'];
const FORMAT_POWERPOINT = ['ppt', 'pptx'];
const FORMAT_PDF = ['pdf', 'PDF'];
const FORMAT_PHOTOSHOP = ['psd'];
const FORMAT_ILLUSTRATOR = ['ai', 'esp'];

export function getFileType(fileUrl = '') {
  return (fileUrl && fileUrl.split('.').pop()) || '';
}

export function getFileName(fileUrl) {
  return fileUrl.substring(fileUrl.lastIndexOf('/') + 1).replace(/\.[^/.]+$/, '');
}

export function getFileFullName(fileUrl) {
  return fileUrl.split('/').pop();
}

export function getFileFormat(fileUrl = '') {
  let format;
  if (fileUrl) {
    switch (fileUrl.includes(getFileType(fileUrl))) {
      case FORMAT_IMG.includes(getFileType(fileUrl.toLowerCase())):
        format = 'image';
        break;
      case FORMAT_VIDEO.includes(getFileType(fileUrl.toLowerCase())):
        format = 'video';
        break;
      case FORMAT_WORD.includes(getFileType(fileUrl.toLowerCase())):
        format = 'word';
        break;
      case FORMAT_EXCEL.includes(getFileType(fileUrl.toLowerCase())):
        format = 'excel';
        break;
      case FORMAT_POWERPOINT.includes(getFileType(fileUrl.toLowerCase())):
        format = 'powerpoint';
        break;
      case FORMAT_PDF.includes(getFileType(fileUrl.toLowerCase())):
        format = 'pdf';
        break;
      case FORMAT_PHOTOSHOP.includes(getFileType(fileUrl.toLowerCase())):
        format = 'photoshop';
        break;
      case FORMAT_ILLUSTRATOR.includes(getFileType(fileUrl.toLowerCase())):
        format = 'illustrator';
        break;
      default:
        format = getFileType(fileUrl.toLowerCase());
    }
  }

  return format;
}

export function getFileFormatDisctint(fileUrl) {
  let format;

  switch (fileUrl.includes(getFileType(fileUrl))) {
    case 'xls':
      format = 'xls';
      break;
    case 'xlsx':
      format = 'xlsx';
      break;
    case 'doc':
      format = 'doc';
      break;
    case 'docx':
      format = 'docx';
      break;
    default:
      format = getFileType(fileUrl);
  }

  return format;
}

const getIcon = (name, thumbp, sx) =>
  thumbp ? (
    <Box component="img" src={`/assets/icons/file_format/${name}.svg`} sx={{ flexShrink: 0, ...sx }} />
  ) : (
    <Image src={`/assets/icons/file_format/${name}.svg`} alt={name} sx={{ width: 24, height: 24 }} {...sx} />
  );

export function getFileThumb(thumbp, sx, fileUrl = '') {
  let thumb;
  switch (getFileFormat(fileUrl)) {
    case 'video':
      thumb = getIcon('format_video', thumbp, sx);
      break;
    case 'word':
      thumb = getIcon('format_word', thumbp, sx);
      break;
    case 'excel':
      thumb = getIcon('format_excel', thumbp, sx);
      break;
    case 'powerpoint':
      thumb = getIcon('format_powerpoint', thumbp, sx);
      break;
    case 'pdf':
      thumb = getIcon('format_pdf', thumbp, sx);
      break;
    case 'photoshop':
      thumb = getIcon('format_photoshop', thumbp, sx);
      break;
    case 'illustrator':
      thumb = getIcon('format_ai', thumbp, sx);
      break;
    case 'image':
      thumb = getIcon('format_image', thumbp, sx);
      break;
    case 'txt':
      thumb = getIcon('format_txt', thumbp, sx);
      break;
    default:
      thumb = getIcon('file', thumbp, sx);
  }
  return thumb;
}

export const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};
