import { useMemo } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
// utils
import { calcValorPrestacao } from './calculos';
import { setModal } from '@/redux/slices/intranet';
import { useDispatch, useSelector } from '@/redux/store';
//
import Ficha from './conteudos';
import FormFicha from './form-ficha';
import { SearchEntidade } from './procurar';
import { DefaultAction } from '@/components/Actions';
import SearchNotFound from '@/components/table/SearchNotFound';

// ---------------------------------------------------------------------------------------------------------------------

export default function FichaAnalise() {
  const dispatch = useDispatch();
  const { processo } = useSelector((state) => state.digitaldocs);
  const { fichaInformativa, modalIntranet, isLoading } = useSelector((state) => state.intranet);

  const { entidade = '', titular = '', cliente = '', credito = null } = processo || {};
  const entidades = useMemo(() => entidade?.split(';')?.map((row) => row) || [], [entidade]);
  const valorPrestacao = useMemo(
    () =>
      credito?.gaji9_metadados?.valor_prestacao ||
      calcValorPrestacao({
        componente: credito?.componente,
        taxa: fichaInformativa?.proposta?.taxa_juro || credito?.taxa_juro,
        taxa_equivalente: fichaInformativa?.proposta?.modo_taxa_equivalente,
        montante: fichaInformativa?.proposta?.montante || credito?.montante_solicitado,
        prazo: fichaInformativa?.proposta?.prazo_amortizacao || credito?.prazo_amortizacao,
      }),
    [credito, fichaInformativa]
  );

  const actionModal = ({ modal = '' }) => dispatch(setModal({ modal }));

  return (
    <>
      <Stack
        useFlexGap
        spacing={1}
        sx={{ mb: 3 }}
        direction="row"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          Ficha de Análise e Parecer
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          {fichaInformativa && (
            <DefaultAction
              button
              icon="adicionar"
              label="Info. adicional"
              onClick={() => actionModal({ modal: 'form-ficha' })}
            />
          )}
          <SearchEntidade entidades={entidades} />
        </Stack>
      </Stack>
      {isLoading ? (
        <Stack spacing={3}>
          {[...Array(3)].map((z, y) => (
            <Skeleton key={y} variant="text" height={220} sx={{ transform: 'scale(1)' }} />
          ))}
        </Stack>
      ) : (
        <>
          {fichaInformativa?.entidade ? (
            <Ficha
              cliente={cliente}
              ficha={fichaInformativa}
              actionModal={actionModal}
              modalIntranet={modalIntranet}
              valorPrestacao={valorPrestacao}
              credito={{ titular, ...credito }}
              estadoId={processo?.estado?.estado_id}
            />
          ) : (
            <SearchNotFound message="Informação da entidade não encontrada..." />
          )}

          {modalIntranet === 'form-ficha' && (
            <FormFicha credito={credito} ficha={fichaInformativa} onClose={() => actionModal({ modal: '' })} />
          )}
        </>
      )}
    </>
  );
}
