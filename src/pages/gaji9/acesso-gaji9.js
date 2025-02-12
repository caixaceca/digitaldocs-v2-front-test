import PropTypes from 'prop-types';
import { useEffect, useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
// utils
import { acessoGaji9, gestaoContrato } from '../../utils/validarAcesso';
// redux
import { getFromGaji9 } from '../../redux/slices/gaji9';
import { useDispatch, useSelector } from '../../redux/store';
// guards
import { LoadingPanel } from '../../components/LoadingScreen';
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

AcessoGaji9.propTypes = { item: PropTypes.string, children: PropTypes.node };

export default function AcessoGaji9({ children, item }) {
  const dispatch = useDispatch();
  const { cc } = useSelector((state) => state.intranet);
  const { isLoading, utilizador } = useSelector((state) => state.gaji9);
  const temAcesso = useMemo(
    () =>
      (item === 'gestao' && utilizador) ||
      (item === 'minuta' && (utilizador?._role === 'ADMIN' || acessoGaji9(utilizador?.acessos, ['READ_MINUTA']))) ||
      (item === 'credito' && (gestaoContrato(utilizador?._role) || acessoGaji9(utilizador?.acessos, ['READ_CREDITO']))),
    [item, utilizador]
  );

  useEffect(() => {
    if (!utilizador && cc?.perfil?.id_aad) dispatch(getFromGaji9('utilizador', { id: cc?.perfil?.id_aad }));
  }, [dispatch, utilizador, cc?.perfil?.id_aad]);

  useEffect(() => {
    if (temAcesso) {
      dispatch(getFromGaji9('funcoes'));
      dispatch(getFromGaji9('componentes'));
      dispatch(getFromGaji9('tiposTitulares'));
      dispatch(getFromGaji9('tiposGarantias'));
    }
  }, [dispatch, temAcesso]);

  return isLoading && !utilizador ? (
    <Card sx={{ p: 3, height: { xs: 400, md: 600 }, alignItems: 'center' }}>
      <LoadingPanel msg="Validando acesso..." />
    </Card>
  ) : (
    <>{temAcesso ? children : <RoleBasedGuard hasContent roles={['xxxxx']} />}</>
  );
}
