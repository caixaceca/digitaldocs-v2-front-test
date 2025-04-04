import PropTypes from 'prop-types';
import { useEffect, useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
// utils
import { acessoGaji9, gestaoContrato } from '../../utils/validarAcesso';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromGaji9, getInfoGaji } from '../../redux/slices/gaji9';
// guards
import { LoadingPanel } from '../../components/LoadingScreen';
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

AcessoGaji9.propTypes = { item: PropTypes.string, children: PropTypes.node };

export default function AcessoGaji9({ children, item }) {
  const dispatch = useDispatch();
  const { cc } = useSelector((state) => state.intranet);
  const { isLoading, adminGaji9, utilizador } = useSelector((state) => state.gaji9);
  const temAcesso = useMemo(
    () =>
      (item === 'gestao' && utilizador) ||
      (item === 'minuta' && (adminGaji9 || acessoGaji9(utilizador?.acessos, ['READ_MINUTA']))) ||
      (item === 'credito' && (gestaoContrato(utilizador?._role) || acessoGaji9(utilizador?.acessos, ['READ_CREDITO']))),
    [item, adminGaji9, utilizador]
  );

  useEffect(() => {
    if (!utilizador && cc?.perfil?.id_aad) dispatch(getFromGaji9('utilizador', { id: cc?.perfil?.id_aad }));
  }, [dispatch, utilizador, cc?.perfil?.id_aad]);

  useEffect(() => {
    if (temAcesso) dispatch(getInfoGaji(item));
  }, [dispatch, item, temAcesso]);

  return isLoading && !utilizador ? (
    <Card sx={{ p: 3, height: { xs: 400, md: 600 }, alignItems: 'center' }}>
      <LoadingPanel msg="Validando acesso..." />
    </Card>
  ) : (
    <>{temAcesso ? children : <RoleBasedGuard hasContent roles={['xxxxx']} />}</>
  );
}
