import PropTypes from 'prop-types';
// @mui
import {
  Box,
  Stack,
  Table,
  Avatar,
  Button,
  Drawer,
  Divider,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  Typography,
  IconButton,
  TableContainer,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CircleIcon from '@mui/icons-material/Circle';
import LockPersonIcon from '@mui/icons-material/LockPerson';
// utils
import { BASEURL } from '../../utils/axios';
import { ptDateTime, fDistance, fToNow } from '../../utils/formatTime';
// hooks
import useToggle from '../../hooks/useToggle';
// redux
import { useSelector } from '../../redux/store';
// components
import Scrollbar from '../../components/Scrollbar';

// ----------------------------------------------------------------------

HistoricoPrisoes.propTypes = { historico: PropTypes.array };

export default function HistoricoPrisoes({ historico }) {
  let soltoPeloSistema = 0;
  const { toggle: open, onOpen, onClose } = useToggle();
  const { colaboradores } = useSelector((state) => state.intranet);

  return (
    <>
      <Button
        size="large"
        variant="soft"
        color="inherit"
        onClick={onOpen}
        startIcon={<LockPersonIcon sx={{ width: 20 }} />}
      >
        Histórico de retenções
      </Button>

      <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: 1, md: 800 } } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
          <Typography variant="h6">Histórico de retenções</Typography>

          <IconButton onClick={onClose}>
            <CloseIcon sx={{ width: 20 }} />
          </IconButton>
        </Stack>

        <Divider />
        <Scrollbar sx={{ p: 1 }}>
          <TableContainer sx={{ minWidth: 650, position: 'relative', overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Colaborador</TableCell>
                  <TableCell align="center">Retido em</TableCell>
                  <TableCell align="center">Solto em</TableCell>
                  <TableCell align="right">Duração</TableCell>
                  <TableCell align="right"> </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historico?.map((item) => {
                  const colaborador = colaboradores?.find((row) => Number(row?.perfil_id) === Number(item?.perfil_id));
                  if (colaborador?.perfil?.mail?.toLowerCase() !== item.por?.toLowerCase()) {
                    soltoPeloSistema += 1;
                  }
                  return (
                    <TableRow key={item?.preso_em} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar
                            alt={colaborador?.perfil?.displayName || colaborador?.perfil?.displayName}
                            src={
                              colaborador?.foto_disk &&
                              `${BASEURL}/colaborador/file/colaborador/${colaborador?.foto_disk}`
                            }
                            sx={{ boxShadow: (theme) => theme.customShadows.z8 }}
                          />
                          <Box>
                            <Typography variant="subtitle2" noWrap>
                              {colaborador?.perfil?.displayName}
                            </Typography>
                            <Typography noWrap variant="body2" sx={{ color: 'text.secondary' }}>
                              {colaborador?.uo?.label}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">{item?.preso_em ? ptDateTime(item?.preso_em) : '--'}</TableCell>
                      <TableCell align="center">{item?.solto_em ? ptDateTime(item?.solto_em) : '--'}</TableCell>
                      <TableCell align="right">
                        {(item?.preso_em && item?.solto_em && fDistance(item?.preso_em, item?.solto_em)) ||
                          (item?.preso_em && !item?.solto_em && fToNow(item?.preso_em)) ||
                          '--'}
                      </TableCell>
                      <TableCell align="right">
                        {colaborador?.perfil?.mail?.toLowerCase() !== item.por?.toLowerCase() && (
                          <CircleIcon color="error" sx={{ width: 15, mt: 1.5 }} />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {soltoPeloSistema > 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Stack direction="row" justifyContent="right" alignItems="center" spacing={0.5}>
                        <CircleIcon color="error" sx={{ width: 15, mt: 0.25 }} />
                        <Typography variant="caption">Solto pelo sistema</Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
      </Drawer>
    </>
  );
}
