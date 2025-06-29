// Global styles
import 'react-quill-new/dist/quill.snow.css';
import 'simplebar-react/dist/simplebar.min.css';
import 'react-lazy-load-image-component/src/effects/blur.css';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import 'react-lazy-load-image-component/src/effects/black-and-white.css';
// eslint-disable-next-line import/no-unresolved
import 'yet-another-react-lightbox/styles.css';
// pdf-viewer
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
// Highlight
import './utils/highlight';

import { setLocale } from 'yup';
import pt from 'date-fns/locale/pt';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Provider as ReduxProvider } from 'react-redux';
// @mui
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// redux
import { store } from './redux/store';
//
import App from './App';

// ---------------------------------------------------------------------------------------------------------------------

/* eslint-disable no-template-curly-in-string */
setLocale({
  mixed: {
    default: 'Valor inválido para ${label}',
    required: '${label} não pode ficar vazio',
    notType: 'Introduza um ${label} válido',
    oneOf: '${label} deve ser um dos seguintes valores: ${values}',
    notOneOf: '${label} não pode ser um dos seguintes valores: ${values}',
  },
  string: {
    email: 'Introduza um email válido',
    min: '${label} deve conter no mínimo ${min} caracteres',
    max: '${label} deve conter no máximo ${max} caracteres',
    matches: '${label} não está no formato esperado',
    url: 'Introduza uma URL válida para ${label}',
    uuid: 'Introduza um UUID válido para ${label}',
  },
  number: {
    positive: '${label} deve ser maior que zero',
    integer: '${label} deve ser um número inteiro',
    min: '${label} deve ser igual ou maior que ${min}',
    max: '${label} deve ser igual ou menor que ${max}',
    lessThan: '${label} deve ser menor que ${less}',
    moreThan: '${label} deve ser maior que ${more}',
    notType: 'Introduza um número válido para ${label}',
  },
  date: {
    min: '${label} deve ser posterior a ${min}',
    max: '${label} deve ser anterior a ${max}',
    notType: 'Introduza uma data válida para ${label}',
  },
  array: {
    required: '${label} é obrigatório',
    min: '${label} deve conter no mínimo ${min} ${min, plural, one {item} other {itens}}',
    max: '${label} deve conter no máximo ${max} ${max, plural, one {item} other {itens}}',
    notType: 'Introduza uma lista válida para ${label}',
  },
});

// ---------------------------------------------------------------------------------------------------------------------

const domNode = document.getElementById('root');
const root = createRoot(domNode);

root.render(
  <ReduxProvider store={store}>
    <BrowserRouter>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pt}>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </LocalizationProvider>
    </BrowserRouter>
  </ReduxProvider>
);
