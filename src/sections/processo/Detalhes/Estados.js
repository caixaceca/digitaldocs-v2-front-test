import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
// utils
import { newLineText, baralharString } from '../../../utils/normalizeText';
import { pertencoEstadoId, findColaboradores, temNomeacao } from '../../../utils/validarAcesso';
import { padraoDate, ptDate, ptDateTime, fDistance, dataMaior } from '../../../utils/formatTime';
// hooks
import { getComparator, applySort } from '../../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../../redux/store';
import { selectItem, closeModal } from '../../../redux/slices/digitaldocs';
// components
import { DefaultAction } from '../../../components/Actions';
import { ColaboradorInfo, Criado } from '../../../components/Panel';
//
import { Abandonar, ParecerForm, AtribuirForm } from '../form/IntervencaoForm';

// ----------------------------------------------------------------------

Estados.propTypes = { handleAceitar: PropTypes.func };

export default function Estados({ handleAceitar }) {
  const dispatch = useDispatch();
  const [accord, setAccord] = useState(false);
  const { cc, colaboradores } = useSelector((state) => state.intranet);
  const { processo, isOpenModal, isSaving } = useSelector((state) => state.digitaldocs);
  const { meusAmbientes, colaboradoresEstado, isAdmin } = useSelector((state) => state.parametrizacao);
  const isResponsavel = temNomeacao(cc) || isAdmin;

  const colaboradoresList = useMemo(
    () => findColaboradores(colaboradores, colaboradoresEstado),
    [colaboradores, colaboradoresEstado]
  );

  const handleEditar = (item) => {
    dispatch(selectItem(item));
  };

  const handleClose = () => {
    dispatch(closeModal());
  };

  const handleAccord = (panel) => (event, isExpanded) => {
    setAccord(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ pb: { xs: 1, sm: 2 } }}>
      {applySort(processo?.estados, getComparator('desc', 'id')).map((row) => {
        const criador = colaboradores?.find((item) => item?.perfil_id === row?.perfil_id);
        const afeto = colaboradores?.find((item) => item?.perfil_id === row?.perfil_id);
        return (
          <Stack key={row?.id} sx={{ px: { xs: 1, sm: 2 }, pt: { xs: 1, sm: 2 } }}>
            <Box sx={{ position: 'absolute', right: 15, p: 2 }}>
              <Stack direction="row" justifyContent="right" alignItems="center" spacing={1} sx={{ zIndex: 2 }}>
                {pertencoEstadoId(meusAmbientes, row?.estado_id) && (
                  <>
                    {!row?._lock && (isResponsavel || isAdmin) && (
                      <AtribuirForm
                        colaboradoresList={colaboradoresList}
                        dados={{
                          estadoId: row?.estado_id,
                          processoId: processo?.id,
                          perfilId: row?.perfil_id,
                          fluxoId: processo?.fluxo_id,
                        }}
                      />
                    )}
                    {row?._lock && row?.perfil_id === cc?.perfil_id ? (
                      <>
                        {row?.parecer ? (
                          <DefaultAction label="EDITAR" color="warning" handleClick={() => handleEditar(row)} />
                        ) : (
                          <DefaultAction label="Adicionar" handleClick={() => handleEditar(row)} />
                        )}
                        <Abandonar
                          id={processo?.id}
                          isSaving={isSaving}
                          estadoId={row?.estado_id}
                          fluxoId={processo?.fluxo_id}
                        />
                      </>
                    ) : (
                      <DefaultAction label="ACEITAR" handleClick={() => handleAceitar(row?.estado_id, 'paralelo')} />
                    )}
                  </>
                )}
              </Stack>
            </Box>
            <Stack>
              <Accordion expanded={accord === row?.id} onChange={handleAccord(row?.id)}>
                <AccordionSummary sx={{ minHeight: '65px !important' }}>
                  <Stack>
                    <Typography variant="subtitle1">{row?.estado}</Typography>
                    {!!row?.parecer_data_limite && (
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Data limite:
                        </Typography>
                        <Typography variant="caption">{ptDate(row?.parecer_data_limite)}</Typography>
                        {!row?.parecer && (
                          <Criado
                            caption
                            tipo="time"
                            value={
                              dataMaior(row?.parecer_data_limite, padraoDate(new Date()))
                                ? fDistance(new Date(), row?.parecer_data_limite)
                                : `${fDistance(row?.parecer_data_limite, new Date())} (Atrasado)`
                            }
                            sx={{
                              color: dataMaior(row?.parecer_data_limite, padraoDate(new Date()))
                                ? 'success.main'
                                : 'error.main',
                            }}
                          />
                        )}
                      </Stack>
                    )}
                    {afeto && (
                      <Typography sx={{ typography: 'caption', color: 'info.main' }}>
                        {row?._lock ? '' : 'Este processo foi tribuído a '}
                        <Typography variant="spam" sx={{ fontWeight: 900 }}>
                          {baralharString(afeto?.perfil?.displayName)}
                        </Typography>
                        {row?._lock ? ' está trabalhando no processo' : ''} neste estado.
                      </Typography>
                    )}
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
          </Stack>
        );
      })}
      <ParecerForm open={isOpenModal} onCancel={handleClose} processoId={processo?.id} estado />
    </Box>
  );
}
