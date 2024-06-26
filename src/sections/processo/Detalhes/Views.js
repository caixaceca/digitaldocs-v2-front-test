import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// utils
import { fDateTime } from '../../../utils/formatTime';
// redux
import { getFromCC } from '../../../redux/slices/cc';
import { getAll } from '../../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../../redux/store';
// components
import { SkeletonBar } from '../../../components/skeleton';
import { SearchNotFound } from '../../../components/table';
import { ColaboradorInfo } from '../../../components/Panel';

// ----------------------------------------------------------------------

Views.propTypes = { id: PropTypes.number, from: PropTypes.string, isLoading: PropTypes.bool };

export default function Views({ id, from = '', isLoading }) {
  const dispatch = useDispatch();
  const [accord, setAccord] = useState(false);
  const { pedidoCC } = useSelector((state) => state.cc);
  const { processo } = useSelector((state) => state.digitaldocs);
  const viewsGroupByColaborador = groupByColaborador(
    from === 'cc' ? pedidoCC?.hvisualizacoes || [] : processo?.hvisualizacoes || [],
    'perfil_id'
  );
  const { mail, cc, colaboradores } = useSelector((state) => state.intranet);

  const handleAccord = (panel) => (event, isExpanded) => {
    setAccord(isExpanded ? panel : false);
  };

  useEffect(() => {
    if (mail && id && from === 'cc') {
      dispatch(getFromCC('hvisualizacoes', { mail, id }));
    } else if (mail && id) {
      dispatch(getAll('hvisualizacoes', { mail, id, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, id, from, mail, cc?.perfil_id]);

  return (
    <CardContent>
      {isLoading ? (
        <SkeletonBar column={5} height={75} />
      ) : (
        <>
          {viewsGroupByColaborador?.length === 0 ? (
            <Stack sx={{ mt: 5 }}>
              <SearchNotFound message="Sem histórico de visualização disponível..." />
            </Stack>
          ) : (
            viewsGroupByColaborador?.map((row, index) => {
              const colaborador = colaboradores?.find((colab) => colab.perfil_id === row.perfilId);
              return (
                <Accordion
                  key={`view_${index}`}
                  expanded={accord === row.perfilId}
                  onChange={handleAccord(row.perfilId)}
                >
                  <AccordionSummary expandIcon={<KeyboardArrowDownIcon />}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ flexGrow: 1, pr: 2 }}
                    >
                      <ColaboradorInfo
                        foto={colaborador?.foto_disk}
                        label={colaborador?.uo?.label}
                        nome={colaborador?.perfil?.displayName || `Perfil: ${row.perfil_id}`}
                      />
                      <Typography variant="subtitle1">{row?.views?.length}</Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    {row?.views?.map((view, index) => (
                      <Typography key={`view_${view?.visto_em}_${index}`} variant="body2">
                        {(view?.visto_em || view?.data_leitura) && fDateTime(view?.visto_em || view?.data_leitura)}
                      </Typography>
                    ))}
                  </AccordionDetails>
                </Accordion>
              );
            })
          )}
        </>
      )}
    </CardContent>
  );
}

// ----------------------------------------------------------------------

function groupByColaborador(dados, item) {
  const _dados = [];
  dados.reduce((res, value) => {
    if (!res[value[item]]) {
      res[value[item]] = { perfilId: value[item], views: [] };
      _dados.push(res[value[item]]);
    }
    res[value[item]].views.push(value);
    return res;
  }, {});

  return _dados;
}
