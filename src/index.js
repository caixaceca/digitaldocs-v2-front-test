/* eslint-disable no-template-curly-in-string */
// highlight
import './utils/highlight';
// styles
import './style.css';

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
  mixed: { required: '${label} não pode ficar vazio', notType: 'Introduza ${label} válido' },
  string: {
    email: 'Introduza um email válido',
    min: '${label} deve conter no mínimo ${min} caracteres',
    max: '${label} deve conter no máximo ${max} caracteres',
  },
  number: {
    positive: '${label} deve ser maior que zero',
    integer: '${label} deve ser um número inteiro',
    min: '${label} deve ser igual ou maior a ${min}',
    max: '${label} deve ser igual ou menor a ${max}',
  },
  array: {
    required: '${label} é obrigatório',
    min: '${label} deve conter no mínimo ${min} item',
    max: '${label} deve conter no máximo ${max} item',
  },
  date: {
    min: '${path} deve ser posterior a ${min}',
    max: '${path} deve ser anterior a ${max}',
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
