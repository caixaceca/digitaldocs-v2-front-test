/* eslint-disable no-template-curly-in-string */
// highlight
import './utils/highlight';

// scroll bar
import 'simplebar-react/dist/simplebar.min.css';

// lightbox
import 'react-18-image-lightbox/style.css';

// editor
import 'react-quill/dist/quill.snow.css';

// pdf-viewer
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

// lazy image
import 'react-lazy-load-image-component/src/effects/blur.css';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import 'react-lazy-load-image-component/src/effects/black-and-white.css';

import { setLocale } from 'yup';
import pt from 'date-fns/locale/pt';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Provider as ReduxProvider } from 'react-redux';
// @mui
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// redux
import { store } from './redux/store';
// contexts
import { SettingsProvider } from './contexts/SettingsContext';
import { CollapseDrawerProvider } from './contexts/CollapseDrawerContext';

//
import App from './App';

// ----------------------------------------------------------------------

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

const domNode = document.getElementById('root');
const root = createRoot(domNode);

root.render(
  <HelmetProvider>
    <ReduxProvider store={store}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pt}>
        <SettingsProvider>
          <CollapseDrawerProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </CollapseDrawerProvider>
        </SettingsProvider>
      </LocalizationProvider>
    </ReduxProvider>
  </HelmetProvider>
);
