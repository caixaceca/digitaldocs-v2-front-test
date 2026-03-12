// Global styles
import 'react-quill-new/dist/quill.snow.css';
import 'yet-another-react-lightbox/styles.css';
import 'simplebar-react/dist/simplebar.min.css';
import 'react-lazy-load-image-component/src/effects/blur.css';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import 'react-lazy-load-image-component/src/effects/black-and-white.css';
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
// utils
import { store } from './redux/store';
import { msalInstance } from './config';
//
import App from './App';

// ---------------------------------------------------------------------------------------------------------------------

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
    min: '${label} deve conter no mínimo ${min} item',
    max: '${label} deve conter no máximo ${max} item',
    notType: 'Introduza uma lista válida para ${label}',
  },
});

if (import.meta.env.DEV) {
  import('./utils/devTools.js');
}

// ---------------------------------------------------------------------------------------------------------------------

const domNode = document.getElementById('root');
const root = createRoot(domNode);

if (window.opener && window.opener !== window) {
  msalInstance
    .initialize()
    .then(() => msalInstance.handleRedirectPromise())
    .then(() => {
      setTimeout(() => {
        if (!window.closed) window.close();
      }, 3000);
    })
    .catch((err) => {
      console.error('[popup] Erro:', err);
      setTimeout(() => {
        if (!window.closed) window.close();
      }, 1000);
    });
} else {
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
}
