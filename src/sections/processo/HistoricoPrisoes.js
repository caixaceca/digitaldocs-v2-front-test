import { useState } from 'react';
import PropTypes from 'prop-types';
// @mui
import {
  Box,
  Card,
  Stack,
  Table,
  Avatar,
  Collapse,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  Typography,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  TableContainer,
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// utils
import { BASEURL } from '../../utils/axios';
import { ptDateTime, fDistance, fToNow } from '../../utils/formatTime';
// redux
import { useSelector } from '../../redux/store';
// components
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';

// ----------------------------------------------------------------------

HistoricoPrisoes.propTypes = { historico: PropTypes.object };

export default function HistoricoPrisoes({ historico }) {
  const { colaboradores } = useSelector((state) => state.intranet);
  const [openHistoricoPrisoes, setOpenHistoricoPrisoes] = useState(false);

  const handleHistoricoPrisoes = () => {
    setOpenHistoricoPrisoes(!openHistoricoPrisoes);
  };

  return (
    <>
      <ListItemButton
        onClick={handleHistoricoPrisoes}
        sx={{
          py: 3,
          borderRadius: 1.5,
          boxShadow: (theme) => theme.customShadows.card,
          borderBottomLeftRadius: openHistoricoPrisoes && 0,
          borderBottomRightRadius: openHistoricoPrisoes && 0,
          background: (theme) => theme.palette.background.paper,
        }}
      >
        <ListItemIcon>{openHistoricoPrisoes ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}</ListItemIcon>
        <ListItemText primary="Histórico de retenções" />
      </ListItemButton>
      <Collapse in={openHistoricoPrisoes}>
        <Card sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, p: 2 }}>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 650, position: 'relative', overflow: 'hidden' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Colaborador</TableCell>
                    <TableCell align="center">Retido em</TableCell>
                    <TableCell align="center">Solto em</TableCell>
                    <TableCell align="center">Duração</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historico?.map((item) => {
                    const colaborador = colaboradores?.find(
                      (row) => Number(row?.perfil_id) === Number(item?.perfil_id)
                    );
                    return (
                      <TableRow key={item?.solto_em}>
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
                                {colaborador?.perfil?.displayName} - ({colaborador?.uo?.label})
                              </Typography>
                              <Typography noWrap variant="body2" sx={{ color: (theme) => theme.palette.text.disabled }}>
                                {colaborador?.perfil?.mail}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">{item?.preso_em ? ptDateTime(item?.preso_em) : '--'}</TableCell>
                        <TableCell align="center">
                          {item?.solto_em ? ptDateTime(item?.solto_em) : '--'}
                          {colaborador?.perfil?.mail?.toLowerCase() !== item.por?.toLowerCase() && (
                            <Typography>
                              <Label variant="outlined" color="error">
                                Pelo Sistema
                              </Label>
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {(item?.preso_em && item?.solto_em && fDistance(item?.preso_em, item?.solto_em)) ||
                            (item?.preso_em && !item?.solto_em && fToNow(item?.preso_em)) ||
                            '--'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        </Card>
      </Collapse>
    </>
  );
}
