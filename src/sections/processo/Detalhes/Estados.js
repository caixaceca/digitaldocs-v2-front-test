import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
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
import { useDispatch, useSelector } from '../../../redux/store';
import { getAnexo, setModal, closeModal } from '../../../redux/slices/digitaldocs';
// components
import Label from '../../../components/Label';
import { Criado } from '../../../components/Panel';
import { DefaultAction } from '../../../components/Actions';
import MyAvatar, { AvatarBedge } from '../../../components/MyAvatar';
// guards
import RoleBasedGuard from '../../../guards/RoleBasedGuard';
//
import Pareceres from './Pareceres';
import { AnexoItem } from './Anexos';
import MinutaParecer from './MinutaParecer';
import { Atribuir, Libertar } from '../Intervencao';
import { ParecerForm } from '../form/form-intervencao';

// ----------------------------------------------------------------------

Estados.propTypes = { handleAceitar: PropTypes.func };

export default function Estados({ handleAceitar }) {
  const dispatch = useDispatch();
  const [accord, setAccord] = useState(false);
  const { meusAmbientes } = useSelector((state) => state.parametrizacao);
  const { perfilId, colaboradores } = useSelector((state) => state.intranet);
  const { processo, isOpenModal, isSaving } = useSelector((state) => state.digitaldocs);

  const handleAccord = (panel) => (event, isExpanded) => {
    setAccord(isExpanded ? panel : false);
  };

  const viewAnexo = (anexo, transicaoId, parecerId) => {
    dispatch(getAnexo('fileDownload', { anexo, transicaoId, parecerId }));
  };

  return (
    <Box sx={{ pb: { xs: 1, sm: 2 } }}>
      {processo?.estados?.map((row) => {
        const temPareceres = row?.pareceres && row?.pareceres?.length > 0;
        const afeto = colaboradores?.find((item) => item?.perfil_id === row?.perfil_id);
        const temParecer = row?.parecer_em && (row?.parecer_favoravel === true || row?.parecer_favoravel === false);

        return (
          <Stack key={row?.id} sx={{ px: { xs: 1, sm: 2 }, pt: { xs: 1, sm: 2 } }}>
            {!temPareceres && (
              <Box sx={{ position: 'absolute', right: 15, p: 2 }}>
                <Stack direction="row" justifyContent="right" alignItems="center" spacing={1} sx={{ zIndex: 2 }}>
                  {pertencoEstadoId(meusAmbientes, row?.estado_id) && (
                    <>
                      {!temParecer && !row?._lock && gestorEstado(meusAmbientes, row?.estado_id) && (
                        <Atribuir
                          dados={{
                            estadoId: row?.estado_id,
                            processoId: processo?.id,
                            perfilIdA: row?.perfil_id,
                            fluxoId: processo?.fluxo_id,
                          }}
                        />
                      )}
                      {row?._lock && row?.perfil_id === perfilId && (
                        <>
                          <DefaultAction
                            color={temParecer ? 'warning' : 'success'}
                            label={temParecer ? 'EDITAR' : 'ADICIONAR'}
                            handleClick={() => dispatch(setModal({ modal: 'parecer-estado', dados: row }))}
                          />

                          <Libertar
                            isSaving={isSaving}
                            dados={{ id: processo?.id, fluxoId: processo?.fluxo_id, estadoId: row?.estado_id }}
                          />
                        </>
                      )}
                      {!row?._lock && (!row?.perfil_id || row?.perfil_id === perfilId) && (
                        <DefaultAction label="ACEITAR" handleClick={() => handleAceitar(row?.estado_id, 'paralelo')} />
                      )}
                    </>
                  )}
                </Stack>
              </Box>
            )}
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
                    {!!row?.parecer_data_limite && !temParecer && <DataParecer data1={row?.parecer_data_limite} />}
                    {afeto && !temPareceres && (
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
                <AccordionDetails sx={{ p: (theme) => (temPareceres ? 0 : theme.spacing(1, 2, 2, 2)) }}>
                  <Stack sx={{ pt: 1 }}>
                    {temPareceres ? (
                      <Pareceres
                        id={processo?.id}
                        estado={row?.estado}
                        estadoId={row?.estado_id}
                        pareceres={row?.pareceres}
                        assunto={`${processo?.assunto} - ${processo?.titular}`}
                      />
                    ) : (
                      <>
                        {temParecer ? (
                          <Stack>
                            {!!afeto && <InfoCriador criador={afeto} />}
                            <Stack sx={{ pl: { md: afeto ? 6.5 : 0 } }}>
                              <Info viewAnexo={viewAnexo} temParecer={temParecer} dados={{ ...row }} />
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
      {isOpenModal === 'parecer-estado' && (
        <ParecerForm onCancel={() => dispatch(closeModal())} processoId={processo?.id} estado />
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------

Info.propTypes = { dados: PropTypes.object, viewAnexo: PropTypes.func, colaboradores: PropTypes.array };

export function Info({ dados, viewAnexo, colaboradores }) {
  const anexosAtivos = useMemo(() => dados?.anexos?.filter((item) => item?.ativo), [dados?.anexos]);
  const anexosInativos = useMemo(() => dados?.anexos?.filter((item) => !item?.ativo), [dados?.anexos]);

  return (
    <>
      {(dados?.observacao || dados?.descritivo) && !dados?.temPareceres && (
        <Typography sx={{ textAlign: 'justify', pt: 2 }}>
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
                      <Info viewAnexo={viewAnexo} colaboradores={colaboradores} dados={row} />
                    </Stack>
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        </>
      )}

      {anexosAtivos?.length > 0 && (
        <Stack spacing={1} direction="row" useFlexGap sx={{ flexWrap: 'wrap', mt: 2 }}>
          {anexosAtivos?.map((item) => (
            <AnexoItem
              parecer
              anexo={item}
              key={item?.anexo}
              viewAnexo={viewAnexo}
              parecerId={dados?.processo_estado_id ? dados?.id : ''}
              transicaoId={dados?.processo_estado_id ? dados?.processo_estado_id : dados?.id}
            />
          ))}
        </Stack>
      )}
      {anexosInativos?.length > 0 && (
        <RoleBasedGuard roles={['Todo-111']}>
          <Divider sx={{ my: 1 }}>
            <Typography variant="subtitle2">Anexos eliminados</Typography>
          </Divider>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {anexosInativos?.map((item) => (
              <AnexoItem
                eliminado
                anexo={item}
                key={item?.anexo}
                viewAnexo={viewAnexo}
                parecerId={dados?.processo_estado_id ? dados?.id : ''}
                transicaoId={dados?.processo_estado_id ? dados?.processo_estado_id : dados?.id}
              />
            ))}
          </Stack>
        </RoleBasedGuard>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

DataParecer.propTypes = { data1: PropTypes.string, data2: PropTypes.string, envio: PropTypes.bool };

export function DataParecer({ data1, data2 = '', envio = false }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }} useFlexGap flexWrap="wrap">
      <Typography variant={envio ? 'body2' : 'caption'} sx={{ color: 'text.secondary' }}>
        Data{envio ? ' envio' : ' limite parecer'}:
      </Typography>
      <Typography variant={envio ? 'body2' : 'caption'}>{ptDateTime(data1)}</Typography>
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
            {!!dados?.parecer_data_limite && (
              <DataParecer data1={dados?.parecer_data_limite} data2={dados?.parecer_em} />
            )}
          </Box>
        )}
      </Stack>
    </Stack>
  );
}
