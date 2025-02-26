// utils
import { BASEURL } from './apisUrl';

// ----------------------------------------------------------------------

export function getFile(item, file = '') {
  let path = item === 'colaborador' ? '' : '/assets/Shape.svg';
  if (file) {
    switch (item) {
      case 'colaborador':
        path = `${BASEURL}/colaborador/file/colaborador/${file}`;
        break;

      default:
        break;
    }
  }
  return path;
}
