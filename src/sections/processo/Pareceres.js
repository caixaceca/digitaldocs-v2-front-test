import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { PDFViewer } from '@react-pdf/renderer';
// @mui
import {
  Box,
  Fab,
  Stack,
  Paper,
  Dialog,
  Button,
  Avatar,
  Drawer,
  Tooltip,
  Divider,
  IconButton,
  Typography,
  DialogTitle,
  DialogActions,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import SpellcheckOutlinedIcon from '@mui/icons-material/SpellcheckOutlined';
// utils
import { BASEURL } from '../../utils/axios';
import { newLineText } from '../../utils/normalizeText';
import { ptDate, ptDateTime } from '../../utils/formatTime';
import { getFileThumb, b64toBlob } from '../../utils/getFileFormat';
// hooks
import useToggle, { useToggle1 } from '../../hooks/useToggle';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import {
  getAnexo,
  resetAnexo,
  selectItem,
  closeModal,
  updateItem,
  closeParecer,
  selectParecer,
} from '../../redux/slices/digitaldocs';
// components
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import SvgIconStyle from '../../components/SvgIconStyle';
import DialogConfirmar from '../../components/DialogConfirmar';
//
import ParecerExport from './ParecerExport';
import { ParecerForm } from './IntervencaoForm';

// ----------------------------------------------------------------------

Pareceres.propTypes = { pareceres: PropTypes.array, processoId: PropTypes.number };

export default function Pareceres({ pareceres, processoId }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { toggle1: open1, onOpen1, onClose1 } = useToggle1();
  const { mail, currentColaborador, colaboradores } = useSelector((state) => state.intranet);
  const { anexoParecer, meusAmbientes, isOpenModal, selectedParecer, isOpenParecer, done, isSaving } = useSelector(
    (state) => state.digitaldocs
  );

  useEffect(() => {
    if (anexoParecer?.ficheiro) {
      const blob = b64toBlob(anexoParecer?.ficheiro, anexoParecer?.anexo?.conteudo);
      const link = document.createElement('a');
      link.download = anexoParecer?.anexo?.nome;
      link.href = window.URL.createObjectURL(blob);
      dispatch(resetAnexo());
      link.click();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anexoParecer?.ficheiro]);

  useEffect(() => {
    if (done === 'parecer validado') {
      enqueueSnackbar('Parecer validado com sucesso', { variant: 'success' });
      onClose1();
      dispatch(closeParecer());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const handleAnexo = (anexo) => {
    dispatch(getAnexo('anexoParecer', anexo, '', mail));
  };

  const handleEditar = (item) => {
    dispatch(selectItem(item));
  };

  const handleValidar = (item) => {
    dispatch(selectParecer(item));
  };

  const handleCloseValidar = () => {
    dispatch(closeParecer());
  };

  const handleClose = () => {
    dispatch(closeModal());
  };

  const handleConfirmValidar = () => {
    const formData = new FormData();
    formData.append('validado', true);
    formData.append('parecerID', selectedParecer.id);
    formData.append('parecer', selectedParecer.parecer);
    formData.append('descricao', selectedParecer.descricao);
    formData.append('perfilID', currentColaborador?.perfil_id);
    dispatch(
      updateItem('parecer', formData, { mail, id: selectedParecer.id, processoId, mensagem: 'parecer validado' })
    );
  };

  const podeDarParecer = (estadoId) => {
    let i = 0;
    while (i < meusAmbientes?.length) {
      if (meusAmbientes[i]?.id === estadoId) {
        return true;
      }
      i += 1;
    }
    return false;
  };

  return (
    <>
      <Button
        size="large"
        variant="soft"
        color="inherit"
        onClick={onOpen}
        sx={{ justifyContent: 'left' }}
        startIcon={<ChatOutlinedIcon sx={{ width: 20 }} />}
      >
        Pareceres
      </Button>

      <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: 1, md: 800 } } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
          <Typography variant="h6">Pareceres</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon sx={{ width: 20 }} />
          </IconButton>
        </Stack>

        <Divider />

        <Scrollbar>
          <Stack spacing={2} sx={{ p: 2 }}>
            {pareceres.map((row) => {
              const key = `parecer_${row.id}`;
              const criador = colaboradores?.find((_row) => _row?.perfil?.id === row?.parecer_perfil_id);
              return (
                <Paper key={key} sx={{ bgcolor: 'background.neutral' }}>
                  <Paper
                    key={key}
                    sx={{
                      p: 2,
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                      bgcolor: 'background.neutral',
                      borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle1">{row?.nome}</Typography>
                        {row?.parecer && (
                          <Label
                            variant="ghost"
                            sx={{ typography: 'subtitle2' }}
                            color={
                              (row?.parecer === 'Favorável' && 'success') ||
                              (row?.parecer === 'Não favorável' && 'error') ||
                              'warning'
                            }
                          >
                            {row?.parecer}
                          </Label>
                        )}
                      </Stack>
                      {row.data_limite && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Data limite:
                          </Typography>
                          <Typography variant="body2">{ptDate(row.data_limite)}</Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Paper>
                  <Stack sx={{ p: 2 }}>
                    {row?.parecer ? (
                      <>
                        <Stack spacing={3} direction="row" alignItems="center" justifyContent="space-between">
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar
                              alt={criador?.perfil?.displayName}
                              src={`${BASEURL}/colaborador/file/colaborador/${criador?.foto_disk}`}
                            />
                            <Box>
                              <Typography variant="body2" noWrap>
                                {criador?.perfil?.displayName} ({criador?.uo?.label})
                              </Typography>
                              {row?.data_parecer && (
                                <Typography variant="body2" sx={{ color: 'text.secondary', typography: 'body2' }}>
                                  {ptDateTime(row.data_parecer)}
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                          {podeDarParecer(row?.estado_id) && !row?.validado && (
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="VALIDAR" arrow>
                                <Fab size="small" variant="soft" color="success" onClick={() => handleValidar(row)}>
                                  <SpellcheckOutlinedIcon />
                                </Fab>
                              </Tooltip>
                              <DialogConfirmar
                                open={open1}
                                color="success"
                                onClose={onClose1}
                                isLoading={isSaving}
                                title="Validar parecer"
                                desc="validar este parecer"
                                handleOk={handleConfirmValidar}
                              />
                              <Dialog fullScreen open={isOpenParecer}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3}>
                                  <DialogTitle sx={{ pb: 2 }}>Validação de parecer</DialogTitle>
                                  <Stack sx={{ pr: 1 }}>
                                    <Tooltip title="Fechar">
                                      <IconButton color="inherit" onClick={handleCloseValidar}>
                                        <CloseIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                </Stack>
                                <Box sx={{ flexGrow: 1, height: '100%', overflow: 'hidden' }}>
                                  <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                                    <ParecerExport
                                      dados={{
                                        data: new Date(),
                                        estado: selectedParecer?.nome,
                                        parecer: selectedParecer?.parecer,
                                        descricao: selectedParecer?.descricao,
                                        data_limite: selectedParecer?.data_limite,
                                        nome: currentColaborador?.perfil?.displayName,
                                      }}
                                    />
                                  </PDFViewer>
                                </Box>
                                <DialogActions sx={{ justifyContent: 'center', p: '12px !important' }}>
                                  <Button variant="contained" size="large" onClick={onOpen1}>
                                    VALIDAR
                                  </Button>
                                </DialogActions>
                              </Dialog>
                              <Tooltip title="EDITAR" arrow>
                                <Fab size="small" variant="soft" color="warning" onClick={() => handleEditar(row)}>
                                  <SvgIconStyle src="/assets/icons/editar.svg" />
                                </Fab>
                              </Tooltip>
                            </Stack>
                          )}
                        </Stack>
                        {row?.descricao && (
                          <Typography sx={{ my: 2, mx: 0.5 }}>{newLineText(row.descricao)}</Typography>
                        )}
                        {row?.validado && (
                          <>
                            <Button
                              fullWidth
                              size="small"
                              color="inherit"
                              onClick={() => handleValidar(row)}
                              startIcon={getFileThumb('Minuta parecer.pdf')}
                              sx={{ justifyContent: 'left', textAlign: 'left', py: 2.25 }}
                            >
                              Minuta parecer
                            </Button>
                            <Dialog fullScreen open={isOpenParecer}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3}>
                                <DialogTitle sx={{ pb: 2 }}>Minuta parecer</DialogTitle>
                                <Stack sx={{ pr: 1 }}>
                                  <Tooltip title="Fechar">
                                    <IconButton color="inherit" onClick={handleCloseValidar}>
                                      <CloseIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </Stack>
                              <Box sx={{ flexGrow: 1, height: '100%', overflow: 'hidden' }}>
                                <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                                  <ParecerExport
                                    dados={{
                                      estado: selectedParecer?.nome,
                                      parecer: selectedParecer?.parecer,
                                      nome: criador?.perfil?.displayName,
                                      data: selectedParecer?.data_parecer,
                                      descricao: selectedParecer?.descricao,
                                      data_limite: selectedParecer?.data_limite,
                                    }}
                                  />
                                </PDFViewer>
                              </Box>
                            </Dialog>
                          </>
                        )}
                        {row?.anexos
                          ?.filter((item) => item?.is_ativo)
                          .map(
                            (_row) =>
                              _row?.nome && (
                                <Button
                                  fullWidth
                                  size="small"
                                  color="inherit"
                                  key={_row?.anexo}
                                  onClick={() => handleAnexo(_row)}
                                  startIcon={getFileThumb(_row.nome)}
                                  sx={{ justifyContent: 'left', textAlign: 'left', py: 2.25 }}
                                >
                                  {_row?.nome}
                                </Button>
                              )
                          )}
                      </>
                    ) : (
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3}>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                          Ainda não foi adicionado o parecer...
                        </Typography>
                        {podeDarParecer(row?.estado_id) && !row?.validado && (
                          <Tooltip title="EDITAR" arrow>
                            <Button
                              variant="soft"
                              color="success"
                              onClick={() => handleEditar(row)}
                              startIcon={<AddCircleIcon />}
                            >
                              Adicionar
                            </Button>
                          </Tooltip>
                        )}
                      </Stack>
                    )}
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        </Scrollbar>
        <ParecerForm open={isOpenModal} onCancel={handleClose} processoId={processoId} />
      </Drawer>
    </>
  );
}
