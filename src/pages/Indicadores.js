import { useEffect } from 'react';
// @mui
import { Container } from '@mui/material';
// redux
import { getAll } from '../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../redux/store';
// hooks
import useSettings from '../hooks/useSettings';
// components
import Page from '../components/Page';
// sections
import IndicadoresGerais from '../sections/digitaldocs/IndicadoresGerais';

// ----------------------------------------------------------------------

export default function Indicadores() {
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);

  useEffect(() => {
    if (mail && currentColaborador?.perfil_id) {
      dispatch(getAll('ambientes', { mail, perfilId: currentColaborador?.perfil_id }));
    }
  }, [dispatch, currentColaborador, mail]);

  return (
    <Page title="Indicadores | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <IndicadoresGerais />
      </Container>
    </Page>
  );
}
