import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// @mui
import {
  Fab,
  Box,
  Stack,
  Drawer,
  Avatar,
  Divider,
  Tooltip,
  Accordion,
  Typography,
  IconButton,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// utils
import { BASEURL } from '../../utils/axios';
import { fDateTime } from '../../utils/formatTime';
// hooks
import useToggle from '../../hooks/useToggle';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAll } from '../../redux/slices/digitaldocs';
// components
import Scrollbar from '../../components/Scrollbar';
import { SearchNotFound } from '../../components/table';
//
import DetalhesProcesso from './DetalhesProcesso';

// ----------------------------------------------------------------------

Versoes.propTypes = { processoId: PropTypes.number };

export default function Versoes({ processoId }) {
  const dispatch = useDispatch();
  const [accord, setAccord] = useState(false);
  const { toggle: open, onOpen, onClose } = useToggle();
  const { versoes, processo } = useSelector((state) => state.digitaldocs);
  const { mail, colaboradores, cc } = useSelector((state) => state.intranet);

  const handleAccord = (panel) => (event, isExpanded) => {
    setAccord(isExpanded ? panel : false);
  };

  useEffect(() => {
    if (versoes?.length > 0) {
      setAccord(versoes?.[0]?.updated_in);
    }
  }, [dispatch, versoes]);

  useEffect(() => {
    if (mail && processoId && cc?.perfil_id && open) {
      dispatch(getAll('versoes', { mail, processoId, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, processoId, mail, open, cc?.perfil_id]);

  return (
    <>
      <Tooltip title="VERSÕES" arrow>
        <Fab color="inherit" size="small" variant="soft" onClick={onOpen}>
          <HistoryIcon />
        </Fab>
      </Tooltip>

      <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: 1, md: 800 } } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
          <Typography variant="h6">Versões anteriores do processo</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon sx={{ width: 20 }} />
          </IconButton>
        </Stack>

        <Divider />

        {versoes?.length === 0 ? (
          <SearchNotFound message="O processo ainda não foi modificado..." />
        ) : (
          <Scrollbar sx={{ p: 3 }}>
            {versoes?.map((row, index) => {
              const colaborador = colaboradores?.find((_row) => _row.perfil_id === row?.updated_by);

              const getNew = (newObj, oldObj) => {
                if (Object.keys(oldObj).length === 0 && Object.keys(newObj).length > 0) return newObj;
                const diff = {};
                // eslint-disable-next-line no-restricted-syntax
                for (const key in oldObj) {
                  if (newObj[key] && oldObj[key] !== newObj[key]) {
                    diff[key] = newObj[key];
                  }
                }
                if (Object.keys(diff).length > 0) return diff;

                return oldObj;
              };
              return (
                <Accordion
                  key={row?.updated_in}
                  expanded={accord === row?.updated_in}
                  onChange={handleAccord(row?.updated_in)}
                >
                  <AccordionSummary expandIcon={<KeyboardArrowDownIcon />}>
                    <Stack spacing={0.5} direction="row" alignItems="center" sx={{ flexGrow: 1, pr: 2 }}>
                      <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                        ALTERADO EM:
                      </Typography>
                      <Typography variant="subtitle1">{row?.updated_in ? fDateTime(row?.updated_in) : ''}</Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5}>
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
                    <DetalhesProcesso
                      processo={index === 0 ? getNew(row, processo) : getNew(versoes[index - 1], row)}
                    />
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
