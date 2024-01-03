import { useState, useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// utils
import { getFile } from '../../../utils/getFile';
import { fDateTime } from '../../../utils/formatTime';
// redux
import { getFromCC } from '../../../redux/slices/cc';
import { useDispatch, useSelector } from '../../../redux/store';
// components
import MyAvatar from '../../../components/MyAvatar';
import Scrollbar from '../../../components/Scrollbar';
import { SearchNotFound } from '../../../components/table';

// ----------------------------------------------------------------------

export default function Views() {
  const dispatch = useDispatch();
  const [accord, setAccord] = useState(false);
  const { pedidoCC, visualizacoes } = useSelector((state) => state.cc);
  const { mail, colaboradores } = useSelector((state) => state.intranet);
  const viewsGroupByColaborador = groupByColaborador(visualizacoes, 'perfil_id');

  const handleAccord = (panel) => (event, isExpanded) => {
    setAccord(isExpanded ? panel : false);
  };

  useEffect(() => {
    if (mail && pedidoCC?.id) {
      dispatch(getFromCC('visualizacoes', { mail, id: pedidoCC?.id }));
    }
  }, [dispatch, pedidoCC?.id, mail]);

  return (
    <>
      {viewsGroupByColaborador?.length === 0 ? (
        <Stack sx={{ mt: 5 }}>
          <SearchNotFound message="Sem histórico de visualização disponível..." />
        </Stack>
      ) : (
        <Scrollbar sx={{ p: 3 }}>
          {viewsGroupByColaborador?.map((row, index) => {
            const colaborador = colaboradores?.find((colab) => colab.perfil_id === row.perfilId);
            return (
              <Accordion key={`view_${index}`} expanded={accord === row.perfilId} onChange={handleAccord(row.perfilId)}>
                <AccordionSummary expandIcon={<KeyboardArrowDownIcon />}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flexGrow: 1, pr: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <MyAvatar
                        alt={colaborador?.perfil?.displayName}
                        src={getFile('colaborador', colaborador?.foto_disk)}
                      />
                      <Box>
                        <Typography variant="body1">
                          {colaborador?.perfil?.displayName || `Perfil: ${row.perfilId}`}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {colaborador?.uo?.label}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography sx={{ color: 'text.secondary' }}>{row?.views?.length}</Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  {row?.views?.map((view, index) => (
                    <Typography key={`view_${view?.visto_em}_${index}`} variant="body2">
                      {fDateTime(view?.visto_em)}
                    </Typography>
                  ))}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Scrollbar>
      )}
    </>
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
