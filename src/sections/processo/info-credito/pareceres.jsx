import { useEffect, useState, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
// utils
import { ptDateTime } from '../../../utils/formatTime';
import { useSelector, useDispatch } from '../../../redux/store';
import { fCurrency, fPercent } from '../../../utils/formatNumber';
import { pertencoEstadoId, gestorEstado } from '../../../utils/validarAcesso';
import { setModal, getInfoProcesso } from '../../../redux/slices/digitaldocs';
// components
import Label from '../../../components/Label';
import { DefaultAction } from '../../../components/Actions';
import FormParecer, { CondicoesForm } from '../form/credito/form-parecer';
import { SearchNotFoundSmall } from '../../../components/table/SearchNotFound';
import { ColaboradorInfo, Criado, newLineText } from '../../../components/Panel';

// ---------------------------------------------------------------------------------------------------------------------

export default function PareceresCredito({ infoCredito }) {
  const dispatch = useDispatch();
  const { meusAmbientes } = useSelector((state) => state.parametrizacao);
  const { processo, isOpenModal } = useSelector((state) => state.digitaldocs);
  const estado = useMemo(() => processo?.estado, [processo?.estado]);
  const gestor = useMemo(() => gestorEstado(meusAmbientes, estado?.estado_id), [meusAmbientes, estado?.estado_id]);

  useEffect(() => {
    if (infoCredito) dispatch(getInfoProcesso('ht_parecer_cr', { id: processo?.id }));
  }, [dispatch, infoCredito, processo?.id]);

  useEffect(() => {
    if (estado?.decisor) dispatch(getInfoProcesso('condicao_aprovacao', { id: processo?.id }));
  }, [dispatch, processo?.id, estado?.decisor]);

  const acessoParecer = useMemo(
    () => estado?.decisor && pertencoEstadoId(meusAmbientes, estado?.estado_id),
    [meusAmbientes, estado?.decisor, estado?.estado_id]
  );
  const pareceresAtuais = useMemo(() => estado?.pareceres_cr || [], [estado?.pareceres_cr]);
  const historicoPareceres = useMemo(() => processo?.ht_parecer_cr || [], [processo?.ht_parecer_cr]);

  const openModal = (modal, dados) => dispatch(setModal({ modal: modal ?? '', dados: dados ?? null }));

  const boxNoDados = (atual) => (
    <Box sx={{ bgcolor: 'background.neutral', borderRadius: 2, p: atual ? 0 : 4 }}>
      <SearchNotFoundSmall message="Ainda não foi adicionado nenhum parecer..." xs={atual} />
    </Box>
  );

  return (
    <Stack spacing={3}>
      {estado?.decisor && (
        <Stack direction="column" justifyContent="center" spacing={2}>
          {infoCredito && <ParecersLabel dados={{ estado, acessoParecer, pareceresAtuais, openModal }} />}

          {processo?.condicao_aprovacao && (
            <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 1 }}>
              <Typography variant="subtitle1" sx={{ color: 'success.main', mb: 0.5 }}>
                Condições:
              </Typography>
              <Stack spacing={0.5}>
                <Condicao label="Montante" value={fCurrency(processo?.condicao_aprovacao?.montante)} />
                <Condicao label="Taxa de juro" value={fPercent(processo?.condicao_aprovacao?.taxa_juro)} />
                <Condicao label="Prazo" value={`${processo?.condicao_aprovacao?.prazo} meses`} />
              </Stack>
              {gestor && estado?.nivel_decisao === processo?.credito?.nivel_decisao && (
                <DefaultAction small label="Editar" onClick={() => openModal('condicoes-aprovacao')} />
              )}
            </Stack>
          )}

          {pareceresAtuais?.length > 0
            ? pareceresAtuais?.map((row) => (
                <Parecer dados={row} openModal={openModal} key={`atual_${row?.id}`} acessoParecer={acessoParecer} />
              ))
            : boxNoDados(true)}
        </Stack>
      )}

      {infoCredito && historicoPareceres?.length > 0 && (
        <Stack spacing={2}>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            Histórico
          </Typography>
          <Divider sx={{ mt: '5px !important', mb: '-10px !important' }} />
          {agruparPorEstado(historicoPareceres)?.map((row) => (
            <Stack key={row?.estado_id}>
              <Typography variant="subtitle2" sx={{ pb: 1 }}>
                {row?.estado}
              </Typography>
              <Stack spacing={2}>
                {row?.pareceres?.map((parecer) => (
                  <Parecer historico dados={parecer} openModal={openModal} key={`historico_${parecer?.id}`} />
                ))}
              </Stack>
            </Stack>
          ))}
        </Stack>
      )}

      {infoCredito && !estado?.decisor && historicoPareceres?.length === 0 && boxNoDados()}

      {isOpenModal === 'parecer-cr' && (
        <FormParecer
          gestor={gestor}
          pId={processo?.id}
          onClose={() => openModal()}
          fluxoId={processo?.fluxo_id}
          estadoId={estado?.estado_id}
        />
      )}
      {isOpenModal === 'condicoes-aprovacao' && (
        <CondicoesForm
          onClose={() => openModal()}
          dados={processo?.condicao_aprovacao}
          ids={{ id: processo?.id, creditoId: processo?.credito?.id }}
        />
      )}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Parecer({ dados, acessoParecer = false, historico = false, openModal }) {
  const [expand, setExpand] = useState(false);
  const { colaboradores, perfilId } = useSelector((state) => state.intranet);

  const { perfil_id: perfil, favoravel, parecer, dado_em: em = '' } = dados;
  const colaborador = colaboradores?.find(({ perfil_id: pid }) => pid === perfil);

  return (
    <Stack>
      <Accordion expanded={expand} onChange={(event, isExpanded) => setExpand(isExpanded)}>
        <AccordionSummary sx={{ minHeight: '65px !important' }}>
          <Stack
            useFlexGap
            spacing={2}
            flexWrap="wrap"
            direction="row"
            alignItems="center"
            sx={{ flexGrow: 1 }}
            justifyContent="space-between"
          >
            <ColaboradorInfo
              id={colaborador?.id}
              foto={colaborador?.foto_anexo}
              labelAlt={colaborador?.uo_label}
              nome={colaborador?.nome || `Perfil ID: ${perfil}`}
              other={
                <Box sx={{ mt: 0.25 }}>
                  <Label color={favoravel ? 'success' : 'error'}>
                    {favoravel ? 'Parecer favorável' : 'Parecer não favorável'}
                  </Label>
                </Box>
              }
            />
            {acessoParecer && perfil === perfilId && (
              <Box sx={{ pr: 1 }} onClick={(e) => e.stopPropagation()}>
                <DefaultAction small label="EDITAR" color="warning" onClick={() => openModal('parecer-cr', dados)} />
              </Box>
            )}
            {historico && <Criado tipo="data" caption value={ptDateTime(em)} />}
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Typography sx={{ pt: 1, textAlign: 'justify' }}>{newLineText(parecer)}</Typography>
          {!historico && (
            <Typography sx={{ pt: 1, typography: 'body2', color: 'text.secondary' }}>{ptDateTime(em)}</Typography>
          )}
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function ParecersLabel({ dados }) {
  const { perfilId } = useSelector((state) => state.intranet);
  const { estado, acessoParecer, pareceresAtuais, openModal } = dados;

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="end">
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          Pareceres: {estado?.estado}
        </Typography>
        {acessoParecer && !pareceresAtuais?.find(({ perfil_id: pid }) => perfilId === pid) && (
          <DefaultAction small button label="Adicionar" variant="contained" onClick={() => openModal('parecer-cr')} />
        )}
      </Stack>
      <Divider sx={{ mt: '5px !important', mb: '-10px !important' }} />
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Condicao({ label, value }) {
  return (
    <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
      {label}:{' '}
      <Typography variant="subtitle2" component="span" sx={{ color: 'text.primary' }}>
        {value}
      </Typography>
    </Typography>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function agruparPorEstado(pareceres) {
  const mapa = pareceres.reduce((acc, item) => {
    if (!acc[item.estado_id]) {
      acc[item.estado_id] = { estado_id: item.estado_id, estado: item.estado, pareceres: [] };
    }
    acc[item.estado_id].pareceres.push(item);
    return acc;
  }, {});

  return Object.values(mapa);
}
