import { useEffect } from 'react';
import PropTypes from 'prop-types';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// redux
import { getFromGaji9 } from '../../redux/slices/gaji9';
import { useDispatch, useSelector } from '../../redux/store';
// guards
import { Loading } from '../../components/LoadingScreen';
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

AcessoGaji9.propTypes = { children: PropTypes.node };

export default function AcessoGaji9({ children }) {
  const dispatch = useDispatch();
  const { isLoading, utilizador } = useSelector((state) => state.gaji9);

  useEffect(() => {
    if (utilizador) {
      dispatch(getFromGaji9('funcoes'));
      dispatch(getFromGaji9('componentes'));
      dispatch(getFromGaji9('tiposTitulares'));
      dispatch(getFromGaji9('tiposGarantias'));
    }
  }, [dispatch, utilizador]);

  return (
    <>
      {isLoading && !utilizador ? (
        <Card sx={{ p: 3, height: { xs: 400, md: 600 }, alignItems: 'center' }}>
          <Stack direction="column" alignItems="center" justifyContent="center" sx={{ height: 1 }}>
            <Loading />
            <Typography sx={{ color: 'text.secondary', mt: 3 }}>Validando acesso...</Typography>
          </Stack>
        </Card>
      ) : (
        <>{utilizador ? children : <RoleBasedGuard hasContent roles={['xxxxx']} />}</>
      )}
    </>
  );
}
