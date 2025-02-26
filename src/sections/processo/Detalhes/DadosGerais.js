import { useMemo } from 'react';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
// utils
import { fluxosGmkt } from '../../../utils/validarAcesso';
// redux
import { useSelector } from '../../../redux/store';
// hooks
import { getComparator, applySort } from '../../../hooks/useTable';
// components
import { SearchNotFound404 } from '../../../components/table';
import { SkeletonProcesso } from '../../../components/skeleton';
//
import Anexos from './Anexos';
import NotaProcesso from './NotaProcesso';
import DetalhesProcesso from './DetalhesProcesso';

// ----------------------------------------------------------------------

export default function DadosGerais() {
  const { isLoadingP, processo } = useSelector((state) => state.digitaldocs);
  const hasAnexos = useMemo(() => processo?.anexos && processo?.anexos?.length > 0, [processo?.anexos]);
  const isPS = useMemo(
    () =>
      fluxosGmkt(processo?.assunto) ||
      processo?.assunto === 'Diário' ||
      processo?.assunto === 'Receção de Cartões - DOP',
    [processo?.assunto]
  );

  return (
    <Stack sx={{ p: { xs: 1, sm: 3 }, mt: { xs: 0, sm: -2 } }}>
      {isLoadingP ? (
        <SkeletonProcesso />
      ) : (
        <>
          {processo ? (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={hasAnexos && 5}>
                <Stack id="detalhes">
                  {!isPS && processo?.nota && <NotaProcesso nota={processo?.nota} segmento={processo?.segmento} />}
                  <DetalhesProcesso isPS={isPS} processo={processo} />
                </Stack>
              </Grid>
              {hasAnexos && (
                <Grid item xs={12} lg={7}>
                  <Anexos anexos={applySort(processo?.anexos, getComparator('asc', 'id'))} />
                </Grid>
              )}
            </Grid>
          ) : (
            <SearchNotFound404 message="Processo não encontrado ou não tens acesso..." noShadow />
          )}
        </>
      )}
    </Stack>
  );
}
