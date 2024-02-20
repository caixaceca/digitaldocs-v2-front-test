// @mui
import Grid from '@mui/material/Grid';
import CardContent from '@mui/material/CardContent';
// redux
import { useSelector } from '../../redux/store';
// components
import { SearchNotFound404 } from '../../components/table';
import { SkeletonProcesso } from '../../components/skeleton';
//
import Anexos from './Anexos';
import NotaProcesso from './NotaProcesso';
import DetalhesProcesso from './DetalhesProcesso';

// ----------------------------------------------------------------------

export default function DadosGerais() {
  const { processo, isLoadingP } = useSelector((state) => state.digitaldocs);
  const hasAnexos = processo?.anexos && processo?.anexos?.length > 0;
  const isPS =
    processo?.assunto === 'Diário' ||
    processo?.assunto === 'Preçário' ||
    processo?.assunto === 'Produtos e Serviços' ||
    processo?.assunto === 'Receção de Cartões - DOP';

  return (
    <CardContent sx={{ pt: 1 }}>
      {isLoadingP ? (
        <SkeletonProcesso />
      ) : (
        <>
          {processo ? (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={hasAnexos && 5} id="card_detail">
                {!isPS && processo?.nota && <NotaProcesso nota={processo?.nota} segmento={processo?.segcliente} />}
                <DetalhesProcesso isPS={isPS} />
              </Grid>
              {hasAnexos && (
                <Grid item xs={12} lg={7}>
                  <Anexos anexos={processo?.anexos} />
                </Grid>
              )}
            </Grid>
          ) : (
            <SearchNotFound404 message="Pedido de crédito não encontrada..." noShadow />
          )}
        </>
      )}
    </CardContent>
  );
}
