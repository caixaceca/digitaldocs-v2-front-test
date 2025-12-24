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
import NotaProcesso from './nota';
import DetalhesProcesso from './detalhes';
import Anexos from './anexos/anexos-dados-gerais';
import GridItem from '../../../components/GridItem';

// ---------------------------------------------------------------------------------------------------------------------

export default function DadosGerais({ processo }) {
  const { isLoadingP } = useSelector((state) => state.digitaldocs);
  const anexosAtivos = useMemo(() => processo?.anexos?.filter(({ ativo }) => ativo) || [], [processo?.anexos]);
  const isPS = useMemo(
    () => fluxosGmkt(processo?.fluxo) || processo?.fluxo === 'Diário' || processo?.fluxo === 'Receção de Cartões - DOP',
    [processo?.fluxo]
  );

  return (
    <Stack sx={{ p: { xs: 1, sm: 3 }, mt: { xs: 0, sm: -2 } }}>
      {isLoadingP ? (
        <SkeletonProcesso />
      ) : (
        <>
          {processo ? (
            <Grid container spacing={3}>
              <GridItem lg={anexosAtivos?.length ? 5 : 12}>
                <Stack id="detalhes">
                  {!isPS && processo?.nota && <NotaProcesso nota={processo?.nota} segmento={processo?.segmento} />}
                  <DetalhesProcesso isPS={isPS} processo={processo} />
                </Stack>
              </GridItem>
              {!!anexosAtivos?.length && (
                <GridItem lg={7}>
                  <Anexos anexos={applySort(anexosAtivos, getComparator('asc', 'id'))} />
                </GridItem>
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
