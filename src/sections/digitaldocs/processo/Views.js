import { useState } from 'react';
import PropTypes from 'prop-types';
// @mui
import {
  Box,
  Fab,
  Stack,
  Avatar,
  Dialog,
  Tooltip,
  Accordion,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  CircularProgress,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';
// utils
import { BASEURL } from '../../../utils/axios';
import { fDateTime } from '../../../utils/formatTime';
// redux
import { useDispatch, useSelector } from '../../../redux/store';
import { getAll, closeModal } from '../../../redux/slices/digitaldocs';
// components
import SvgIconStyle from '../../../components/SvgIconStyle';

// ----------------------------------------------------------------------

Views.propTypes = { processoId: PropTypes.number };

export default function Views({ processoId }) {
  const dispatch = useDispatch();
  const [colabViews, setColabViews] = useState(false);
  const { mail, colaboradores, currentColaborador } = useSelector((state) => state.colaborador);
  const { visualizacoes, isLoading, isOpenModalViews } = useSelector((state) => state.digitaldocs);
  const viewsGroupByColaborador = groupByColaborador(visualizacoes, 'perfil_id');

  const handleColabViews = (panel) => (event, isExpanded) => {
    setColabViews(isExpanded ? panel : false);
  };

  const handleViews = () => {
    if (mail && processoId && currentColaborador?.perfil_id) {
      dispatch(getAll('visualizacoes', { mail, processoId, perfilId: currentColaborador?.perfil_id }));
    }
  };

  const handleClose = () => {
    dispatch(closeModal());
  };

  return (
    <>
      <Tooltip title="VISUALIZAÇÕES" arrow>
        <Fab color="inherit" size="small" variant="soft" onClick={handleViews}>
          {isLoading ? <CircularProgress color="inherit" /> : <SvgIconStyle src="/assets/icons/eye.svg" />}
        </Fab>
      </Tooltip>
      <Dialog open={isOpenModalViews} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
            Visualizações
            <Tooltip title="Fechar" arrow>
              <IconButton onClick={handleClose}>
                <SvgIconStyle src="/assets/icons/close.svg" sx={{ width: 20, opacity: 0.75 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ mb: 2, pb: 2 }}>
          {viewsGroupByColaborador?.map((row) => {
            const colaborador = colaboradores?.find((_row) => _row.perfil_id === row.perfilId);
            return (
              <Accordion
                key={row.perfilId}
                expanded={colabViews === row.perfilId}
                onChange={handleColabViews(row.perfilId)}
              >
                <AccordionSummary expandIcon={<SvgIconStyle src="/assets/icons/arrow-ios-downward.svg" />}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flexGrow: 1, pr: 2 }}>
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
        </DialogContent>
      </Dialog>
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
