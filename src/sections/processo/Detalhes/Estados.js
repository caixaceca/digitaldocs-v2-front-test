import { useState } from 'react';
import PropTypes from 'prop-types';
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
import { ptDateTime, fDistance, dataMaior } from '../../../utils/formatTime';
import { pertencoEstadoId, gestorEstado } from '../../../utils/validarAcesso';
// redux
import { setModal } from '../../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../../redux/store';
// components
import Label from '../../../components/Label';
import { Criado } from '../../../components/Panel';
import { DefaultAction } from '../../../components/Actions';
import MyAvatar, { AvatarBedge } from '../../../components/MyAvatar';
//
import Pareceres from './Pareceres';
import MinutaParecer from './MinutaParecer';
import { Encaminhar, destinosProcesso } from '../Intervencao';

// ----------------------------------------------------------------------

Estados.propTypes = { handleAceitar: PropTypes.func };

export default function Estados({ handleAceitar }) {
  const dispatch = useDispatch();
  const [accord, setAccord] = useState(false);
  const { processo } = useSelector((state) => state.digitaldocs);
  const { meusAmbientes } = useSelector((state) => state.parametrizacao);
  const { perfilId, colaboradores } = useSelector((state) => state.intranet);
  const { id: idp, fluxo, titular, estadoPreso, estados = [] } = processo;

  const handleAccord = (panel) => (event, isExpanded) => {
    setAccord(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ pb: { xs: 1, sm: 2 } }}>
      {estados?.map((row) => {
        const {
          id,
          estado = '',
          preso = false,
          pareceres = [],
          perfil_id: pid,
          observacao = '',
          pendente = false,
          data_limite: data,
          estado_id: estadoId,
          motivo_pendencia: motivo,
          motivo_pendencia_id: motivoId,
        } = row;
        const destinos = destinosProcesso(processo, false);
        const temPareceres = pareceres?.length > 0;
        const afeto = colaboradores?.find(({ perfil_id: pidA }) => pidA === pid);

        return (
          <Stack key={id} sx={{ px: { xs: 1, sm: 2 }, pt: { xs: 1, sm: 2 } }}>
            <Stack>
              <Accordion expanded={accord === id} onChange={handleAccord(id)}>
                <AccordionSummary sx={{ minHeight: '65px !important' }}>
                  <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ flexGrow: 1 }}>
                    <Stack>
                      <Stack direction="row" alignItems="center" useFlexGap flexWrap="wrap">
                        <Typography variant="subtitle1" sx={{ pr: 1 }}>
                          {estado}
                        </Typography>
                      </Stack>
                      {!!data && <DataParecer data1={data} />}
                      {afeto && !temPareceres && (
                        <Typography sx={{ typography: 'caption', color: 'info.main' }}>
                          {preso ? '' : 'Este processo foi tribuído a '}
                          <Typography variant="spam" sx={{ fontWeight: 900 }}>
                            {baralharString(afeto?.perfil?.displayName)}
                          </Typography>
                          {preso ? ' está trabalhando no processo' : ''} neste estado.
                        </Typography>
                      )}
                      {pendente && !preso && (
                        <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                          <Typography variant="caption">Pendente: </Typography>
                          {motivo}
                        </Typography>
                      )}
                    </Stack>

                    {!temPareceres && (
                      <Stack spacing={0.75} direction="row" alignItems="center" onClick={(e) => e.stopPropagation()}>
                        {pertencoEstadoId(meusAmbientes, estadoId) && (
                          <>
                            {!preso && gestorEstado(meusAmbientes, estadoId) && (
                              <DefaultAction
                                label="ATRIBUIR"
                                onClick={() =>
                                  dispatch(setModal({ modal: 'atribuir', dados: { processoId: idp, estadoId, pid } }))
                                }
                              />
                            )}
                            {preso && pid === perfilId && (
                              <>
                                <Encaminhar dados={{ destinos: destinos.seguimentos, acao: 'ENCAMINHAR' }} />
                                <DefaultAction
                                  label="PENDENTE"
                                  onClick={() =>
                                    dispatch(
                                      setModal({
                                        modal: 'pendencia',
                                        dados: {
                                          id: idp,
                                          pendente: !!pendente,
                                          obs: observacao ?? '',
                                          estadoId: estadoId ?? '',
                                          motivo: motivo ?? '',
                                          motivo_id: motivoId ?? '',
                                        },
                                      })
                                    )
                                  }
                                />
                                <DefaultAction
                                  label="LIBERTAR"
                                  onClick={() =>
                                    dispatch(setModal({ modal: 'libertar', dados: { id: idp, estadoId } }))
                                  }
                                />
                              </>
                            )}
                            {!preso && !estadoPreso && (!pid || pid === perfilId) && (
                              <DefaultAction label="ACEITAR" onClick={() => handleAceitar(estadoId, 'paralelo')} />
                            )}
                          </>
                        )}
                      </Stack>
                    )}
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ p: (theme) => (temPareceres ? 0 : theme.spacing(1, 2, 2, 2)) }}>
                  <Stack sx={{ pt: 1 }}>
                    {temPareceres ? (
                      <Pareceres
                        id={idp}
                        estado={estado}
                        estadoId={estadoId}
                        pareceres={pareceres}
                        assunto={`${fluxo ?? ''} - ${titular ?? ''}`}
                      />
                    ) : (
                      <>
                        {row?.descritivo ? (
                          <Stack>
                            {!!afeto && <InfoCriador criador={afeto} />}
                            <Stack sx={{ pl: { md: afeto ? 6.5 : 0 } }}>
                              <Info dados={{ ...row }} />
                            </Stack>
                          </Stack>
                        ) : (
                          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                            Ainda não foi adicionado o parecer...
                          </Typography>
                        )}
                      </>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Stack>
          </Stack>
        );
      })}
    </Box>
  );
}

// ----------------------------------------------------------------------

Info.propTypes = { dados: PropTypes.object, colaboradores: PropTypes.array };

export function Info({ dados, colaboradores }) {
  return (
    <>
      {dados?.motivo && (
        <Typography sx={{ pt: 1.5 }}>
          <Typography variant="spam" sx={{ color: 'info.main' }}>
            Motivo:&nbsp;
          </Typography>
          {dados?.motivo}
        </Typography>
      )}
      {(dados?.observacao || dados?.descritivo) && !dados?.temPareceres && (
        <Typography sx={{ textAlign: 'justify', pt: 1 }}>
          {newLineText(dados?.observacao || dados?.descritivo)}
        </Typography>
      )}

      {dados?.temPareceres && (
        <>
          <InfoCriador temParecer dados={dados} />
          <Divider flexItem sx={{ pt: 3 }} />
          <Stack spacing={3} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} sx={{ mt: 3 }}>
            {dados?.pareceres?.map((row, index) => {
              const criador = colaboradores?.find((colab) => colab?.perfil?.id === row?.perfil_id);
              return (
                <Stack key={`parecer_${index}_${row?.id}`} direction="row" spacing={1.5}>
                  <Stack sx={{ width: 1 }}>
                    {!!criador && (
                      <InfoCriador
                        criador={criador}
                        temParecer={
                          row?.parecer_em && (row?.parecer_favoravel === true || row?.parecer_favoravel === false)
                        }
                        dados={{
                          ...row,
                          perfil: criador?.perfil,
                          assunto: dados?.observacao,
                          estado: dados?.estado_inicial,
                        }}
                      />
                    )}
                    <Stack sx={{ pl: { md: criador ? 6.5 : 0 } }}>
                      <Info colaboradores={colaboradores} dados={row} />
                    </Stack>
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        </>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

DataParecer.propTypes = { data1: PropTypes.string, data2: PropTypes.string, envio: PropTypes.bool };

export function DataParecer({ data1, data2 = '', envio = false }) {
  return (
    <Stack direction="row" alignItems="center" sx={{ mt: 0.5 }} useFlexGap flexWrap="wrap">
      <Typography variant={envio ? 'body2' : 'caption'} sx={{ color: 'text.secondary', pr: 0.5 }}>
        Data{envio ? ' envio' : ' limite parecer'}:
      </Typography>
      <Typography variant={envio ? 'body2' : 'caption'} sx={{ pr: 1 }}>
        {ptDateTime(data1)}
      </Typography>
      {!envio && (
        <Criado
          caption
          tipo="time"
          value={
            dataMaior(data1, data2 || new Date())
              ? fDistance(data2 || new Date(), data1)
              : `${fDistance(data1, data2 || new Date())} Atrasado`
          }
          sx={{ color: dataMaior(data1, data2 || new Date()) ? 'success.main' : 'error.main' }}
        />
      )}
    </Stack>
  );
}

// ----------------------------------------------------------------------

InfoCriador.propTypes = { dados: PropTypes.object, criador: PropTypes.object, temParecer: PropTypes.bool };

export function InfoCriador({ criador = null, temParecer = false, dados = null }) {
  return (
    <Stack direction="row" spacing={1.5}>
      {!!criador && (
        <AvatarBedge id={criador?.id}>
          <MyAvatar name={criador?.perfil?.displayName} src={getFile('colaborador', criador?.foto_disk)} />
        </AvatarBedge>
      )}
      <Stack
        useFlexGap
        spacing={2}
        flexWrap="wrap"
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
      >
        {!!criador && (
          <Box>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography noWrap variant="subtitle2">
                {criador?.perfil?.displayName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                ({criador?.uo?.label})
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {criador?.perfil?.mail}
              {criador?.perfil?.businessPhones?.[0] ? ` | ${criador?.perfil?.businessPhones?.[0]}` : ''}
            </Typography>
          </Box>
        )}
        {temParecer && (
          <Box>
            <Stack spacing={1} direction="row" alignItems="center">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Parecer:
              </Typography>
              <Label color={dados?.parecer_favoravel ? 'success' : 'error'} variant="outlined">
                {dados?.parecer_favoravel ? 'Favorável' : 'Não Favorável'}
              </Label>
              {!dados?.temPareceres && <MinutaParecer dados={{ ...dados }} />}
            </Stack>
            {!!dados?.parecer_em && <DataParecer data1={dados?.parecer_em} envio />}
            {!!dados?.data_limite && <DataParecer data1={dados?.data_limite} data2={dados?.parecer_em} />}
          </Box>
        )}
      </Stack>
    </Stack>
  );
}
