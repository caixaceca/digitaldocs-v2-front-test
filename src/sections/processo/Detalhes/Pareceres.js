import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
// utils
import { newLineText } from '../../../utils/formatText';
import { colorLabel } from '../../../utils/getColorPresets';
import { padraoDate, ptDate, ptDateTime, fDistance, dataMaior } from '../../../utils/formatTime';
// hooks
import useToggle from '../../../hooks/useToggle';
import { getComparator, applySort } from '../../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../../redux/store';
import { getAnexo, selectItem, closeModal, updateItem, selectParecer } from '../../../redux/slices/digitaldocs';
// components
import Label from '../../../components/Label';
import DialogConfirmar from '../../../components/DialogConfirmar';
import { ColaboradorInfo, Criado } from '../../../components/Panel';
import { DefaultAction, Fechar } from '../../../components/Actions';
//
import { AnexoItem } from './Anexos';
import ParecerExport from './ParecerExport';
import { ParecerForm } from '../form/IntervencaoForm';
// guards
import RoleBasedGuard from '../../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

export default function Pareceres() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [accord, setAccord] = useState(false);
  const { toggle: open, onOpen, onClose } = useToggle();
  const { meusAmbientes } = useSelector((state) => state.parametrizacao);
  const { mail, cc, colaboradores } = useSelector((state) => state.intranet);
  const { processo, isOpenModal, parecerSelected, done, isSaving } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    if (done === 'parecer validado') {
      enqueueSnackbar('Parecer validado com sucesso', { variant: 'success' });
      onClose();
      dispatch(selectParecer(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const viewAnexo = (anexo) => {
    dispatch(getAnexo('fileDownload', { mail, perfilId: cc?.perfil_id, anexo }));
  };

  const handleEditar = (item) => {
    dispatch(selectItem(item));
  };

  const handleValidar = (item) => {
    dispatch(selectParecer(item));
  };

  const handleClose = () => {
    dispatch(closeModal());
  };

  const handleAccord = (panel) => (event, isExpanded) => {
    setAccord(isExpanded ? panel : false);
  };

  const handleConfirmValidar = () => {
    const formData = new FormData();
    formData.append('validado', true);
    formData.append('descritivo', parecerSelected.parecer_obs);
    formData.append('parecer_favoravel ', parecerSelected?.parecer === 'Favorável');
    dispatch(
      updateItem('parecer', formData, {
        mail,
        msg: 'Parecer enviado',
        id: parecerSelected.id,
        perfilId: cc?.perfil_id,
        processoId: processo?.id,
      })
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
    <Box sx={{ pb: 3 }}>
      {applySort(processo?.pareceres_estado, getComparator('desc', 'id')).map((row) => {
        const criador = colaboradores?.find((item) => item?.perfil_id === row?.perfil_id);
        const anexosAtivos = row?.anexos?.filter((item) => item?.ativo);
        const anexosInativos = row?.anexos?.filter((item) => !item?.ativo);
        return (
          <Stack key={row?.id} sx={{ px: { xs: 1, sm: 3 }, pt: 2 }}>
            <Accordion expanded={accord === row?.id} onChange={handleAccord(row?.id)}>
              <AccordionSummary sx={{ py: accord !== row?.id && 1 }}>
                <Stack
                  spacing={1}
                  alignItems="center"
                  sx={{ flexGrow: 1, pr: 3 }}
                  justifyContent="space-between"
                  direction={{ xs: 'column', sm: 'row' }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant="subtitle1">{row?.nome}</Typography>
                    {row?.parecer && (
                      <Box>
                        <Label variant="ghost" sx={{ typography: 'subtitle2' }} color={colorLabel(row?.parecer)}>
                          {row?.parecer}
                        </Label>
                        {!row?.validado && (
                          <Criado caption tipo="warning" value="Parecer não validado" sx={{ color: 'warning.main' }} />
                        )}
                      </Box>
                    )}
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={3}>
                    {podeDarParecer(row?.estado_id) && (
                      <>
                        {!row?.parecer && (
                          <DefaultAction button label="Adicionar" handleClick={() => handleEditar(row)} />
                        )}
                        {row?.parecer && !row?.validado && (
                          <Stack direction="row" spacing={0.75}>
                            <DefaultAction label="VALIDAR" handleClick={() => handleValidar(row)} />
                            <DefaultAction label="EDITAR" color="warning" handleClick={() => handleEditar(row)} />
                          </Stack>
                        )}
                      </>
                    )}
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Data limite:
                        </Typography>
                        <Typography variant="body2">{ptDate(row?.data_limite)}</Typography>
                      </Stack>
                      {(!row?.parecer || (row?.parecer && !row?.validado)) && (
                        <Criado
                          caption
                          tipo="time"
                          value={
                            dataMaior(row?.data_limite, padraoDate(new Date()))
                              ? fDistance(new Date(), row?.data_limite)
                              : `${fDistance(row?.data_limite, new Date())} (Atrasado)`
                          }
                          sx={{
                            color: dataMaior(row?.data_limite, padraoDate(new Date())) ? 'success.main' : 'error.main',
                          }}
                        />
                      )}
                    </Box>
                  </Stack>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack sx={{ p: { sm: 1 } }}>
                  {row?.parecer ? (
                    <>
                      {criador && (
                        <ColaboradorInfo
                          foto={criador?.foto_disk}
                          nome={`${criador?.perfil?.displayName} (${criador?.uo?.label})`}
                          label={row?.data_parecer ? `Data parecer: ${ptDateTime(row?.data_parecer)}` : ''}
                        />
                      )}
                      {row?.parecer_obs && (
                        <Typography sx={{ my: 2, mx: 0.5, textAlign: 'justify' }}>
                          {newLineText(row.parecer_obs)}
                        </Typography>
                      )}
                      {row?.validado && (
                        <AnexoItem
                          parecer
                          viewAnexo={() => handleValidar(row)}
                          anexo={{
                            criado_em: row?.data_parecer,
                            nome: 'Minuta de parecer.pdf',
                            anexo: 'Minuta de parecer.pdf',
                            criador: criador?.perfil?.mail,
                          }}
                        />
                      )}
                      {anexosAtivos?.map((item) => (
                        <AnexoItem parecer anexo={item} key={item?.anexo} viewAnexo={viewAnexo} />
                      ))}
                      {anexosInativos?.length > 0 && (
                        <RoleBasedGuard roles={['Todo-111']}>
                          <Divider sx={{ mt: 1 }}>
                            <Typography variant="subtitle1">Anexos eliminados</Typography>
                          </Divider>
                          {anexosInativos?.map((item) => (
                            <AnexoItem eliminado anexo={item} key={item?.anexo} viewAnexo={viewAnexo} />
                          ))}
                        </RoleBasedGuard>
                      )}
                    </>
                  ) : (
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                      Ainda não foi adicionado o parecer...
                    </Typography>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>
        );
      })}
      <ParecerForm openModal={isOpenModal} onCancel={handleClose} processoId={processo?.id} />

      <Dialog fullScreen open={!!parecerSelected}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ pr: 1.5, py: 0.5 }}>
          <DialogTitle sx={{ pb: 2 }}>Minuta do parecer</DialogTitle>
          {!parecerSelected?.validado && (
            <>
              <Button variant="contained" size="large" onClick={onOpen}>
                VALIDAR PARECER
              </Button>
              <DialogConfirmar
                open={open}
                color="success"
                onClose={onClose}
                isSaving={isSaving}
                title="Validar parecer"
                desc="validar este parecer"
                handleOk={handleConfirmValidar}
              />
            </>
          )}
          <Fechar handleClick={dispatch(selectParecer(null))} large />
        </Stack>
        <Box sx={{ flexGrow: 1, height: '100%', overflow: 'hidden' }}>
          <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
            <ParecerExport
              dados={{
                parecer: parecerSelected,
                assunto: processo?.titular,
                nome: parecerSelected?.validado
                  ? colaboradores?.find((row) => row?.perfil?.id === parecerSelected?.perfil_id)?.perfil?.displayName
                  : cc?.perfil?.displayName,
              }}
            />
          </PDFViewer>
        </Box>
      </Dialog>
    </Box>
  );
}
