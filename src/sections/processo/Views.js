import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// utils
import { fDateTime } from '../../utils/formatTime';
// hooks
import useToggle from '../../hooks/useToggle';
// redux
import { getAll } from '../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../redux/store';
// components
import Scrollbar from '../../components/Scrollbar';
import { DefaultAction } from '../../components/Actions';
import { ColaboradorInfo } from '../../components/Panel';
import { SearchNotFoundSmall } from '../../components/table';

// ----------------------------------------------------------------------

Views.propTypes = { processoId: PropTypes.number };

export default function Views({ processoId }) {
  const dispatch = useDispatch();
  const [accord, setAccord] = useState(false);
  const { toggle: open, onOpen, onClose } = useToggle();
  const { visualizacoes } = useSelector((state) => state.digitaldocs);
  const { mail, colaboradores, cc } = useSelector((state) => state.intranet);
  const viewsGroupByColaborador = groupByColaborador(visualizacoes, 'perfil_id');

  const handleAccord = (panel) => (event, isExpanded) => {
    setAccord(isExpanded ? panel : false);
  };

  useEffect(() => {
    if (mail && processoId && cc?.perfil_id && open) {
      dispatch(getAll('visualizacoes', { mail, processoId, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, processoId, mail, open, cc?.perfil_id]);

  return (
    <>
      <DefaultAction icon="views" color="inherit" label="VISUALIZAÇÕES" handleClick={onOpen} />
      <Drawer open={open} anchor="right" onClose={onClose} PaperProps={{ sx: { width: { xs: 1, sm: 400 } } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
          <Typography variant="h6">Visualizações</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon sx={{ width: 20 }} />
          </IconButton>
        </Stack>

        <Divider />

        {viewsGroupByColaborador?.length === 0 ? (
          <Stack sx={{ mt: 5 }}>
            <SearchNotFoundSmall message="Sem histórico de visualização disponível..." />
          </Stack>
        ) : (
          <Scrollbar sx={{ p: 3 }}>
            {viewsGroupByColaborador?.map((row) => {
              const colaborador = colaboradores?.find((_row) => _row.perfil_id === row.perfilId);
              return (
                <Accordion key={row.perfilId} expanded={accord === row.perfilId} onChange={handleAccord(row.perfilId)}>
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
                      <Typography sx={{ color: 'text.secondary' }}>{row?.views?.length}</Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    {row?.views?.map((view) => (
                      <Typography key={view?.data_leitura} variant="body2" sx={{ textAlign: 'center' }}>
                        {fDateTime(view?.data_leitura)}
                      </Typography>
                    ))}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Scrollbar>
        )}
      </Drawer>
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
