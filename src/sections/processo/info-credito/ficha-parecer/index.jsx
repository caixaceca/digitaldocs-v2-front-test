import { useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
// utils
import { setModal } from '@/redux/slices/intranet';
import { useDispatch, useSelector } from '@/redux/store';
//
import Ficha from './conteudos';
import { SearchEntidade } from './procurar';
import SearchNotFound from '@/components/table/SearchNotFound';

// ---------------------------------------------------------------------------------------------------------------------

export default function FichaAnalise() {
  const dispatch = useDispatch();
  const processo = useSelector((state) => state.digitaldocs.processo);
  const { fichaInformativa, modalIntranet, isLoading } = useSelector((state) => state.intranet);

  const { entidade = '', titular = '', cliente = '', credito = null } = processo || {};
  const entidades = useMemo(() => entidade?.split(';')?.map((row) => row) || [], [entidade]);

  const actionModal = ({ modal = '' }) => dispatch(setModal({ modal }));

  return (
    <Card sx={{ p: 1, pb: 2 }}>
      <Stack useFlexGap spacing={1} direction="row" flexWrap="wrap" sx={{ mb: 2, p: 1 }} justifyContent="space-between">
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          Ficha de Análise e Parecer
        </Typography>
        {!!credito?.gaji9_metadados && (
          <SearchEntidade entidades={entidades} actionModal={actionModal} credito={credito} />
        )}
      </Stack>
      {isLoading && !fichaInformativa ? (
        <Stack spacing={3}>
          {[...Array(3)].map((z, y) => (
            <Skeleton key={y} variant="text" height={220} sx={{ transform: 'scale(1)' }} />
          ))}
        </Stack>
      ) : (
        <>
          {fichaInformativa ? (
            <Ficha
              cliente={cliente}
              ficha={fichaInformativa}
              actionModal={actionModal}
              modalIntranet={modalIntranet}
              credito={{ titular, ...credito }}
              montante={credito?.montante_solicitado}
              valorPrestacao={credito?.gaji9_metadados?.valor_prestacao}
            />
          ) : (
            <SearchNotFound
              message={
                credito?.gaji9_metadados
                  ? 'Informação da entidade não encontrada...'
                  : 'Preencha primeiro os dados de Condições Financeiras'
              }
            />
          )}
        </>
      )}
    </Card>
  );
}
