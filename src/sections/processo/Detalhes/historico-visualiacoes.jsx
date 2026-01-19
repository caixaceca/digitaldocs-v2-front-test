import { useState, useEffect, useMemo } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
// utils
import { ptDateTime } from '../../../utils/formatTime';
// redux
import { useDispatch, useSelector } from '../../../redux/store';
import { getInfoProcesso } from '../../../redux/slices/digitaldocs';
// components
import Label from '../../../components/Label';
import { SkeletonBar } from '../../../components/skeleton';
import { SearchNotFound } from '../../../components/table';
import { ColaboradorInfo } from '../../../components/Panel';

// ---------------------------------------------------------------------------------------------------------------------

export default function Views() {
  const dispatch = useDispatch();
  const [accord, setAccord] = useState(false);
  const { colaboradores } = useSelector((state) => state.intranet);
  const { processo, isLoading } = useSelector((state) => state.digitaldocs);
  const viewsGroupByColaborador = useMemo(
    () => groupByColaborador(processo?.hvisualizacoes || [], 'perfil_id'),
    [processo?.hvisualizacoes]
  );

  const handleAccord = (panel) => (event, isExpanded) => {
    setAccord(isExpanded ? panel : false);
  };

  useEffect(() => {
    dispatch(getInfoProcesso('hvisualizacoes', { id: processo?.id }));
  }, [dispatch, processo?.id]);

  return (
    <Stack spacing={{ xs: 1, sm: 2 }} sx={{ p: { xs: 1, sm: 2 } }}>
      {isLoading ? (
        <SkeletonBar column={5} height={75} />
      ) : (
        <>
          {viewsGroupByColaborador?.length === 0 ? (
            <SearchNotFound message="Sem histórico de visualização disponível..." />
          ) : (
            viewsGroupByColaborador?.map(({ perfilId, views }, index) => {
              const colaborador = colaboradores?.find(({ perfil_id: pid }) => pid === perfilId);
              return (
                <Accordion expanded={accord === perfilId} onChange={handleAccord(perfilId)} key={`vw_${index}`}>
                  <AccordionSummary>
                    <Stack direction="row" alignItems="center" sx={{ flexGrow: 1 }} justifyContent="space-between">
                      <ColaboradorInfo
                        label={colaborador?.uo_label}
                        foto={colaborador?.foto_anexo}
                        presence={colaborador?.presence}
                        nome={colaborador?.nome || `Perfil: ${perfilId}`}
                      />
                      <Stack direction="row" alignItems="end" sx={{ pr: 2 }} spacing={0.5}>
                        <Typography variant="subtitle1">{views?.length}</Typography>
                        <Typography variant="body2">visualizaç{views?.length > 1 ? 'ões' : 'ão'}</Typography>
                      </Stack>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack useFlexGap flexWrap="wrap" direction="row" spacing={2} sx={{ pt: 1 }}>
                      {views?.map(({ visto_em: visto, data_leitura: leitura }, index) => (
                        <Label key={`view_${visto || leitura}_${index}`} sx={{ flexGrow: 1 }}>
                          {ptDateTime(visto || leitura)}
                        </Label>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              );
            })
          )}
        </>
      )}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function groupByColaborador(dados, item) {
  const dadosList = [];
  dados
    ?.filter(({ data_leitura: leitura, visto_em: visto }) => leitura || visto)
    ?.reduce((res, value) => {
      if (!res[value[item]]) {
        res[value[item]] = { perfilId: value[item], views: [] };
        dadosList.push(res[value[item]]);
      }
      res[value[item]].views.push(value);
      return res;
    }, {});

  return dadosList;
}
