import { useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
// utils
import { useDispatch, useSelector } from '../../redux/store';
import { getInSuporte } from '../../redux/slices/suporte-cliente';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';
import { LoadingPanel } from '../../components/LoadingScreen';

// ---------------------------------------------------------------------------------------------------------------------

export default function AcessoSuporte({ children }) {
  const dispatch = useDispatch();
  const { cc } = useSelector((state) => state.intranet);
  const { utilizador, isLoading } = useSelector((state) => state.suporte);

  useEffect(() => {
    if (cc?.id) dispatch(getInSuporte('utilizador', { id: 1 }));
  }, [cc?.id, dispatch]);

  useEffect(() => {
    if (utilizador) {
      dispatch(getInSuporte('assuntos'));
      dispatch(getInSuporte('utilizadores'));
      dispatch(getInSuporte('departamentos'));
    }
  }, [dispatch, utilizador]);

  return isLoading && !utilizador ? (
    <Card sx={{ p: 3, height: { xs: 400, md: 600 }, alignItems: 'center' }}>
      <LoadingPanel msg="Validando acesso..." />
    </Card>
  ) : (
    <>{utilizador ? children : <RoleBasedGuard hasContent roles={['xxxxx']} />}</>
  );
}
