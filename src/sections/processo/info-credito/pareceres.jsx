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
import { pertencoEstadoId } from '../../../utils/validarAcesso';
import { setModal, getInfoProcesso } from '../../../redux/slices/digitaldocs';
// components
import Label from '../../../components/Label';
import FormParecer from '../form/credito/form-parecer';
import { DefaultAction } from '../../../components/Actions';
import { SearchNotFoundSmall } from '../../../components/table/SearchNotFound';
import { ColaboradorInfo, Criado, newLineText } from '../../../components/Panel';

// ---------------------------------------------------------------------------------------------------------------------

export default function PareceresCredito() {
  const dispatch = useDispatch();
  const { perfilId } = useSelector((state) => state.intranet);
  const { meusAmbientes } = useSelector((state) => state.parametrizacao);
  const { processo, isOpenModal } = useSelector((state) => state.digitaldocs);
  const estado = useMemo(() => processo?.estado, [processo?.estado]);

  useEffect(() => {
    dispatch(getInfoProcesso('ht_parecer_cr', { id: processo?.id }));
  }, [dispatch, processo?.id]);

  const acessoParecer = useMemo(
    () => processo?.estado?.decisor && pertencoEstadoId(meusAmbientes, estado?.estado_id),
    [meusAmbientes, processo?.estado?.decisor, estado?.estado_id]
  );
  const historicoPareceres = useMemo(() => processo?.ht_parecer_cr || [], [processo?.ht_parecer_cr]);
  const pareceresAtuais = useMemo(() => processo?.estado?.pareceres_cr || [], [processo?.estado?.pareceres_cr]);

  const openModal = (modal, dados) => dispatch(setModal({ modal: modal ?? '', dados: dados ?? null }));

  const boxNoDados = (atual) => (
    <Box sx={{ bgcolor: 'background.neutral', borderRadius: 2, p: atual ? 0 : 4, mt: 3 }}>
      <SearchNotFoundSmall message="Ainda não foi adicionado nenhum parecer..." xs={atual} />
    </Box>
  );

  return (
    <Stack spacing={3}>
      {processo?.estado?.decisor && (
        <Stack direction="column" justifyContent="center" spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="end">
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              Pareceres atuais: {estado?.estado}
            </Typography>
            {acessoParecer && !pareceresAtuais?.find(({ perfil_id: pid }) => perfilId === pid) && (
              <DefaultAction
                small
                button
                label="Adicionar"
                variant="contained"
                onClick={() => openModal('parecer-cr')}
              />
            )}
          </Stack>
          <Divider sx={{ mt: '5px !important', mb: '-10px !important' }} />
          {pareceresAtuais?.length > 0
            ? pareceresAtuais?.map((row) => (
                <Parecer dados={row} openModal={openModal} key={`atual_${row?.id}`} acessoParecer={acessoParecer} />
              ))
            : boxNoDados(true)}
        </Stack>
      )}

      {historicoPareceres?.length > 0 && (
        <Stack spacing={2}>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            Histórico
          </Typography>
          <Divider sx={{ mt: '5px !important', mb: '-10px !important' }} />
          {historicoPareceres?.map((row) => (
            <Parecer historico dados={row} openModal={openModal} key={`historico_${row?.id}`} />
          ))}
        </Stack>
      )}

      {!processo?.estado?.decisor && historicoPareceres?.length === 0 && boxNoDados()}

      {isOpenModal === 'parecer-cr' && (
        <FormParecer
          pId={processo?.id}
          onClose={() => openModal()}
          fluxoId={processo?.fluxo_id}
          estadoId={estado?.estado_id}
        />
      )}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Parecer({ dados, acessoParecer = false, historico = false, openModal }) {
  const [expand, setExpand] = useState(false);
  const { colaboradores, perfilId } = useSelector((state) => state.intranet);

  const { perfil_id: perfil, favoravel, parecer, estado, dado_em: em = '' } = dados;
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
            {historico && (
              <Box sx={{ pr: 1 }}>
                <Typography variant="overline">{estado}</Typography>
                <Criado tipo="data" caption value={ptDateTime(em)} />
              </Box>
            )}
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
