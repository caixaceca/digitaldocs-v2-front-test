import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
// utils
import { getFile } from '../../../utils/getFile';
import { newLineText, baralharString } from '../../../utils/formatText';
import { pertencoEstadoId, findColaboradores, temNomeacao } from '../../../utils/validarAcesso';
import { padraoDate, ptDate, ptDateTime, fDistance, dataMaior } from '../../../utils/formatTime';
// hooks
import { getComparator, applySort } from '../../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../../redux/store';
import { getAnexo, selectItem, closeModal } from '../../../redux/slices/digitaldocs';
// components
import Label from '../../../components/Label';
import { Criado } from '../../../components/Panel';
import MyAvatar from '../../../components/MyAvatar';
import { DefaultAction } from '../../../components/Actions';
// guards
import RoleBasedGuard from '../../../guards/RoleBasedGuard';
//
import { AnexoItem } from './Anexos';
import MinutaParecer from './MinutaParecer';
import { Abandonar, ParecerForm, AtribuirForm } from '../form/IntervencaoForm';

// ----------------------------------------------------------------------

Estados.propTypes = { handleAceitar: PropTypes.func };

export default function Estados({ handleAceitar }) {
  const dispatch = useDispatch();
  const [accord, setAccord] = useState(false);
  const { mail, cc, colaboradores } = useSelector((state) => state.intranet);
  const { processo, isOpenModal, isSaving } = useSelector((state) => state.digitaldocs);
  const { meusAmbientes, colaboradoresEstado, isAdmin } = useSelector((state) => state.parametrizacao);
  const isResponsavel = useMemo(() => temNomeacao(cc) || isAdmin, [cc, isAdmin]);

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

  const viewAnexo = (anexo) => {
    dispatch(getAnexo('fileDownload', { mail, perfilId: cc?.perfil_id, anexo }));
  };

  return (
    <Box sx={{ pb: { xs: 1, sm: 2 } }}>
      {applySort(processo?.estados, getComparator('desc', 'id')).map((row) => {
        const anexosAtivos = row?.anexos?.filter((item) => item?.ativo);
        const anexosInativos = row?.anexos?.filter((item) => !item?.ativo);
        const afeto = colaboradores?.find((item) => item?.perfil_id === row?.perfil_id);
        const criador = colaboradores?.find((item) => item?.perfil_id === row?.perfil_id);
        const temParecer = row?.parecer_em && (row?.parecer_favoravel === true || row?.parecer_favoravel === false);

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
                    {row?._lock && row?.perfil_id === cc?.perfil_id && (
                      <>
                        {temParecer ? (
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
                    )}
                    {!row?._lock && (!row?.perfil_id || row?.perfil_id === cc?.perfil_id) && (
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
                    <Stack direction="row" alignItems="center" useFlexGap flexWrap="wrap">
                      <Typography variant="subtitle1" sx={{ pr: 1 }}>
                        {row?.estado}
                      </Typography>
                      {temParecer && (
                        <Label color={row?.parecer_favoravel ? 'success' : 'error'}>
                          {row?.parecer_favoravel ? 'Parecer favorável' : 'Parecer não favorável'}
                        </Label>
                      )}
                    </Stack>
                    {!!row?.parecer_data_limite && !temParecer && <DataLimite data1={row?.parecer_data_limite} />}
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
                  <Stack sx={{ pt: 1 }}>
                    {temParecer ? (
                      <Stack direction="row" spacing={1.5}>
                        {!!criador && (
                          <MyAvatar
                            alt={criador?.perfil?.displayName}
                            src={getFile('colaborador', criador?.foto_disk)}
                          />
                        )}
                        <Stack sx={{ flexGrow: 1 }}>
                          {!!criador && (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <Typography noWrap variant="subtitle2">
                                {criador?.perfil?.displayName}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                ({criador?.uo?.label})
                              </Typography>
                            </Stack>
                          )}
                          {!!row?.parecer_em && (
                            <Stack direction="row" alignItems="center" useFlexGap flexWrap="wrap" spacing={0.5}>
                              <DataLimite data1={row?.parecer_em} parecer />
                              {!!row?.parecer_data_limite && (
                                <Stack direction="row">
                                  [<DataLimite data1={row?.parecer_data_limite} data2={row?.parecer_em} />]
                                </Stack>
                              )}
                            </Stack>
                          )}
                          {row?.observacao && (
                            <Typography sx={{ textAlign: 'justify', pt: 1 }}>{newLineText(row.observacao)}</Typography>
                          )}

                          <Stack spacing={1} direction="column" sx={{ mt: 1.5 }} alignItems="center">
                            {temParecer && (
                              <Stack sx={{ width: 1 }}>
                                <PDFDownloadLink
                                  fileName={`Minuta do parecer - ${row?.estado}.pdf`}
                                  document={
                                    <MinutaParecer
                                      dados={{
                                        ...row,
                                        assunto: processo?.titular,
                                        nome: colaboradores?.find((item) => item?.perfil_id === row?.perfil_id)?.perfil
                                          ?.displayName,
                                      }}
                                    />
                                  }
                                >
                                  {({ loading }) =>
                                    loading ? (
                                      'Carregando minuta...'
                                    ) : (
                                      <AnexoItem
                                        parecer
                                        viewAnexo={() => null}
                                        anexo={{
                                          criado_em: row?.parecer_em,
                                          nome: 'Minuta do parecer.pdf',
                                          criador: criador?.perfil?.mail,
                                        }}
                                      />
                                    )
                                  }
                                </PDFDownloadLink>
                              </Stack>
                            )}
                            {anexosAtivos?.map((item) => (
                              <AnexoItem parecer anexo={item} key={item?.anexo} viewAnexo={viewAnexo} />
                            ))}
                          </Stack>
                          {anexosInativos?.length > 0 && (
                            <RoleBasedGuard roles={['Todo-111']}>
                              <Divider sx={{ my: 1 }}>
                                <Typography variant="subtitle1">Anexos eliminados</Typography>
                              </Divider>
                              <Stack direction="column" alignItems="center" spacing={1}>
                                {anexosInativos?.map((item) => (
                                  <AnexoItem eliminado anexo={item} key={item?.anexo} viewAnexo={viewAnexo} />
                                ))}
                              </Stack>
                            </RoleBasedGuard>
                          )}
                        </Stack>
                      </Stack>
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
      <ParecerForm openModal={isOpenModal} onCancel={handleClose} processoId={processo?.id} estado />
    </Box>
  );
}

// ----------------------------------------------------------------------

DataLimite.propTypes = { data1: PropTypes.string, data2: PropTypes.string, parecer: PropTypes.bool };

function DataLimite({ data1, data2 = '', parecer = false }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
      <Typography variant={parecer ? 'body2' : 'caption'} sx={{ color: 'text.secondary' }}>
        Data {parecer ? 'parecer' : 'limite'}:
      </Typography>
      <Typography variant={parecer ? 'body2' : 'caption'}>{parecer ? ptDateTime(data1) : ptDate(data1)}</Typography>
      {!parecer && (
        <Criado
          caption
          tipo="time"
          value={
            dataMaior(data1, padraoDate(data2 || new Date()))
              ? fDistance(data2 || new Date(), data1)
              : `${fDistance(data1, data2 || new Date())} Atrasado`
          }
          sx={{ color: dataMaior(data1, padraoDate(data2 || new Date())) ? 'success.main' : 'error.main' }}
        />
      )}
    </Stack>
  );
}
