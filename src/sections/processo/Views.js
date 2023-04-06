import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
// @mui
import {
  Box,
  Fab,
  Stack,
  Avatar,
  Drawer,
  Divider,
  Tooltip,
  Accordion,
  Typography,
  IconButton,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import PreviewOutlinedIcon from '@mui/icons-material/PreviewOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// utils
import { BASEURL } from '../../utils/axios';
import { fDateTime } from '../../utils/formatTime';
// hooks
import useToggle from '../../hooks/useToggle';
// redux
import { getAll } from '../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../redux/store';
// components
import Scrollbar from '../../components/Scrollbar';
import { SearchNotFoundSmall } from '../../components/table';

// ----------------------------------------------------------------------

Views.propTypes = { processoId: PropTypes.number };

export default function Views({ processoId }) {
  const dispatch = useDispatch();
  const [accord, setAccord] = useState(false);
  const { toggle: open, onOpen, onClose } = useToggle();
  const { visualizacoes } = useSelector((state) => state.digitaldocs);
  const { mail, colaboradores, currentColaborador } = useSelector((state) => state.intranet);
  const viewsGroupByColaborador = groupByColaborador(visualizacoes, 'perfil_id');

  const handleAccord = (panel) => (event, isExpanded) => {
    setAccord(isExpanded ? panel : false);
  };

  useEffect(() => {
    if (mail && processoId && currentColaborador?.perfil_id && open) {
      dispatch(getAll('visualizacoes', { mail, processoId, perfilId: currentColaborador?.perfil_id }));
    }
  }, [dispatch, processoId, mail, open, currentColaborador?.perfil_id]);

  return (
    <>
      <Tooltip title="VISUALIZAÇÕES" arrow>
        <Fab color="inherit" size="small" variant="soft" onClick={onOpen}>
          <PreviewOutlinedIcon />
        </Fab>
      </Tooltip>
      <Drawer
        open={open}
        anchor="right"
        onClose={onClose}
        BackdropProps={{ invisible: true }}
        PaperProps={{ sx: { width: { xs: 1, sm: 400 } } }}
        sx={{ backgroundColor: (theme) => alpha(theme.palette.grey[900], 0.8) }}
      >
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
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar
                          alt={colaborador?.perfil?.displayName || colaborador?.perfil?.mail}
                          src={`${BASEURL}/colaborador/file/colaborador/${colaborador?.foto_disk}`}
                        />
                        <Box>
                          <Typography variant="body1">{colaborador?.perfil?.displayName}</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {colaborador?.uo?.label}
                          </Typography>
                        </Box>
                      </Stack>
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
