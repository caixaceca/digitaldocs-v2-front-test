import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { PDFViewer } from '@react-pdf/renderer';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import AddCircleIcon from '@mui/icons-material/AddCircle';
// utils
import { newLineText } from '../../utils/normalizeText';
import { colorLabel } from '../../utils/getColorPresets';
import { ptDate, ptDateTime } from '../../utils/formatTime';
import { getFileThumb, b64toBlob } from '../../utils/getFileFormat';
// hooks
import useToggle from '../../hooks/useToggle';
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
import { ColaboradorInfo } from '../../components/Panel';
import DialogConfirmar from '../../components/DialogConfirmar';
import { DefaultAction, Fechar } from '../../components/Actions';
//
import ParecerExport from './ParecerExport';
import { ParecerForm } from './IntervencaoForm';

// ----------------------------------------------------------------------

Pareceres.propTypes = { pareceres: PropTypes.array, id: PropTypes.number, assunto: PropTypes.string };

export default function Pareceres({ pareceres, id, assunto }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, cc, colaboradores } = useSelector((state) => state.intranet);
  const { meusAmbientes } = useSelector((state) => state.parametrizacao);
  const { anexoParecer, isOpenModal, itemSelected, isOpenParecer, done, isSaving } = useSelector(
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
      onClose();
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
    formData.append('parecerID', itemSelected.id);
    formData.append('parecer', itemSelected.parecer);
    formData.append('descricao', itemSelected.parecer_obs);
    formData.append('perfilID', cc?.perfil_id);
    dispatch(updateItem('parecer', formData, { mail, id: itemSelected.id, processoId: id, msg: 'parecer validado' }));
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
                    <Typography variant="subtitle1">{row?.nome?.replace(' - P/S/P', '')}</Typography>
                    {row?.parecer && (
                      <Label variant="ghost" sx={{ typography: 'subtitle2' }} color={colorLabel(row?.parecer)}>
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
                      <ColaboradorInfo
                        foto={criador?.foto_disk}
                        label={row?.data_parecer ? ptDateTime(row.data_parecer) : ''}
                        nome={`${criador?.perfil?.displayName} (${criador?.uo?.label})`}
                      />
                      {podeDarParecer(row?.estado_id) && !row?.validado && (
                        <Stack direction="row" spacing={1}>
                          <DefaultAction label="VALIDAR" handleClick={() => handleValidar(row)} />
                          <DialogConfirmar
                            open={open}
                            color="success"
                            onClose={onClose}
                            isSaving={isSaving}
                            title="Validar parecer"
                            desc="validar este parecer"
                            handleOk={handleConfirmValidar}
                          />
                          <DefaultAction label="EDITAR" color="warning" handleClick={() => handleEditar(row)} />
                        </Stack>
                      )}
                    </Stack>
                    {row?.parecer_obs && (
                      <Typography sx={{ my: 2, mx: 0.5, textAlign: 'justify' }}>
                        {newLineText(row.parecer_obs)}
                      </Typography>
                    )}
                    {row?.validado && (
                      <>
                        <Button
                          fullWidth
                          size="small"
                          color="inherit"
                          onClick={() => handleValidar(row)}
                          startIcon={getFileThumb(false, null, 'Minuta do parecer.pdf')}
                          sx={{ justifyContent: 'left', textAlign: 'left', py: 2.25 }}
                        >
                          Minuta do parecer.pdf
                        </Button>
                      </>
                    )}
                    {row?.anexos
                      ?.filter((item) => item?.is_ativo)
                      .map(
                        (anexo) =>
                          anexo?.nome && (
                            <Button
                              fullWidth
                              size="small"
                              color="inherit"
                              key={anexo?.anexo}
                              onClick={() => handleAnexo(anexo)}
                              startIcon={getFileThumb(false, null, anexo.nome)}
                              sx={{ justifyContent: 'left', textAlign: 'left', py: 2.25 }}
                            >
                              {anexo?.nome}
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
                      <Button
                        variant="soft"
                        color="success"
                        startIcon={<AddCircleIcon />}
                        onClick={() => handleEditar(row)}
                      >
                        Adicionar
                      </Button>
                    )}
                  </Stack>
                )}
              </Stack>
            </Paper>
          );
        })}
      </Stack>
      <ParecerForm open={isOpenModal} onCancel={handleClose} processoId={id} />

      <Dialog fullScreen open={isOpenParecer}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3}>
          <DialogTitle sx={{ pb: 2 }}>Minuta do parecer</DialogTitle>
          <Stack sx={{ pr: 1 }}>
            <Fechar handleClick={handleCloseValidar} large />
          </Stack>
        </Stack>
        <Box sx={{ flexGrow: 1, height: '100%', overflow: 'hidden' }}>
          <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
            <ParecerExport
              dados={{
                assunto,
                parecer: itemSelected,
                nome: itemSelected?.validado
                  ? colaboradores?.find((_row) => _row?.perfil?.id === itemSelected?.parecer_perfil_id)?.perfil
                      ?.displayName
                  : cc?.perfil?.displayName,
              }}
            />
          </PDFViewer>
        </Box>
        {!itemSelected?.validado && (
          <DialogActions sx={{ justifyContent: 'center', p: '12px !important' }}>
            <Button variant="contained" size="large" onClick={onOpen}>
              VALIDAR
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
}
