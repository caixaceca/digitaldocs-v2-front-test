import PropTypes from 'prop-types';
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

// ----------------------------------------------------------------------

Views.propTypes = { id: PropTypes.number, isLoading: PropTypes.bool };

export default function Views({ id, isLoading }) {
  const dispatch = useDispatch();
  const [accord, setAccord] = useState(false);
  const { processo } = useSelector((state) => state.digitaldocs);
  const { colaboradores } = useSelector((state) => state.intranet);
  const viewsGroupByColaborador = useMemo(
    () => groupByColaborador(processo?.hvisualizacoes || [], 'perfil_id'),
    [processo?.hvisualizacoes]
  );

  const handleAccord = (panel) => (event, isExpanded) => {
    setAccord(isExpanded ? panel : false);
  };

  useEffect(() => {
    if (id) dispatch(getInfoProcesso('hvisualizacoes', { id }));
  }, [dispatch, id]);

  return (
    <Stack spacing={{ xs: 1, sm: 2 }} sx={{ p: { xs: 1, sm: 2 } }}>
      {isLoading ? (
        <SkeletonBar column={5} height={75} />
      ) : (
        <>
          {viewsGroupByColaborador?.length === 0 ? (
            <SearchNotFound message="Sem histórico de visualização disponível..." />
          ) : (
            viewsGroupByColaborador?.map((row, index) => {
              const colaborador = colaboradores?.find((colab) => colab.perfil_id === row.perfilId);
              return (
                <Accordion expanded={accord === row.perfilId} onChange={handleAccord(row.perfilId)} key={`vw_${index}`}>
                  <AccordionSummary>
                    <Stack direction="row" alignItems="center" sx={{ flexGrow: 1 }} justifyContent="space-between">
                      <ColaboradorInfo
                        id={colaborador?.id}
                        foto={colaborador?.foto_disk}
                        label={colaborador?.uo?.label}
                        nome={colaborador?.perfil?.displayName || `Perfil: ${row.perfil_id}`}
                      />
                      <Stack direction="row" alignItems="end" sx={{ pr: 2 }} spacing={0.5}>
                        <Typography variant="subtitle1">{row?.views?.length}</Typography>
                        <Typography variant="body2">visualizaç{row?.views?.length > 1 ? 'ões' : 'ão'}</Typography>
                      </Stack>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack useFlexGap flexWrap="wrap" direction="row" spacing={2} sx={{ pt: 1 }}>
                      {row?.views?.map((view, index) => (
                        <Label key={`view_${view?.visto_em}_${index}`}>
                          {ptDateTime(view?.visto_em || view?.data_leitura)}
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

// ----------------------------------------------------------------------

function groupByColaborador(dados, item) {
  const dadosList = [];
  dados
    ?.filter((row) => row?.data_leitura || row?.visto_em)
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
