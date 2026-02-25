import { useEffect, useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
//
import { usePermissao } from '@/hooks/useAcesso';
// redux
import { useDispatch, useSelector } from '@/redux/store';
import { getFromGaji9, getInfoGaji } from '@/redux/slices/gaji9';
// guards
import { LoadingPanel } from '@/components/LoadingScreen';
import RoleBasedGuard from '@/guards/RoleBasedGuard';

// ---------------------------------------------------------------------------------------------------------------------

export default function AcessoGaji9({ children, item }) {
  const dispatch = useDispatch();
  const { temPermissao, isGerente } = usePermissao();

  const { cc } = useSelector((state) => state.intranet);
  const { isLoading, utilizador } = useSelector((state) => state.gaji9);

  const temAcesso = useMemo(
    () =>
      (item === 'gestao' && utilizador) ||
      (item === 'minuta' && temPermissao(['READ_MINUTA'])) ||
      (item === 'clausula' && temPermissao(['READ_CLAUSULA'])) ||
      (item === 'credito' && (isGerente || temPermissao(['READ_CREDITO']))),
    [item, temPermissao, isGerente, utilizador]
  );

  useEffect(() => {
    if (!utilizador && cc?.ad_id) dispatch(getFromGaji9('utilizador', { id: cc?.ad_id }));
  }, [dispatch, utilizador, cc?.ad_id]);

  useEffect(() => {
    if (temAcesso && item !== 'minuta') dispatch(getInfoGaji(item));
  }, [dispatch, item, temAcesso]);

  return isLoading && !utilizador ? (
    <Card sx={{ p: 3, height: { xs: 400, md: 600 }, alignItems: 'center' }}>
      <LoadingPanel msg="Validando acesso..." />
    </Card>
  ) : (
    <>{temAcesso ? children : <RoleBasedGuard hasContent roles={['xxxxx']} />}</>
  );
}
