import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
// utils
import { pertencoEstadoId } from '../../../utils/validarAcesso';
// redux
import { setModal } from '../../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../../redux/store';
// components
import Label from '../../../components/Label';
import { DefaultAction } from '../../../components/Actions';
import { ColaboradorInfo } from '../../../components/Panel';
//
import { Info, InfoCriador } from './Estados';
import ParecerExport, { DownloadPdf } from './MinutaParecer';

// ----------------------------------------------------------------------

Pareceres.propTypes = {
  estado: PropTypes.string,
  assunto: PropTypes.string,
  pareceres: PropTypes.array,
  estadoId: PropTypes.number,
};

export default function Pareceres({ pareceres, estado, estadoId, assunto }) {
  const dispatch = useDispatch();
  const [accord, setAccord] = useState(false);

  const handleAccord = (panel) => (event, isExpanded) => {
    setAccord(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ pb: 3 }}>
      {pareceres?.map((row) => (
        <Parecer
          accord={accord}
          assunto={assunto}
          estadoId={estadoId}
          key={`parecer_${row?.id}`}
          handleAccord={handleAccord}
          parecer={{ ...row, estado, observacao: row?.descritivo }}
          handleEditar={(item) => dispatch(setModal({ modal: 'parecer-individual', dados: item }))}
        />
      ))}
    </Box>
  );
}

// ----------------------------------------------------------------------

Parecer.propTypes = {
  accord: PropTypes.string,
  parecer: PropTypes.object,
  estadoId: PropTypes.number,
  handleEditar: PropTypes.func,
  handleAccord: PropTypes.func,
};

export function Parecer({ estadoId, parecer, handleEditar, accord, handleAccord }) {
  const { meusAmbientes } = useSelector((state) => state.parametrizacao);
  const { perfilId, colaboradores } = useSelector((state) => state.intranet);

  const { id, perfil_id: perfil, parecer: parecerDado, validado, data_parecer: em = '' } = parecer;
  const colaborador = colaboradores?.find(({ perfil_id: pid }) => pid === perfil);
  const temParecer = em && parecerDado;

  return (
    <Stack sx={{ px: { xs: 1, sm: 2 }, pt: { xs: 1, sm: 2 } }}>
      <Box sx={{ position: 'absolute', right: 15, p: 2 }}>
        <Stack direction="row" justifyContent="right" alignItems="center" spacing={1} sx={{ zIndex: 2 }}>
          {pertencoEstadoId(meusAmbientes, estadoId) && perfil === perfilId && !validado && (
            <DefaultAction
              onClick={() => handleEditar(parecer)}
              color={temParecer ? 'warning' : 'success'}
              label={temParecer ? 'EDITAR' : 'ADICIONAR'}
            />
          )}
        </Stack>
      </Box>
      <Stack>
        <Accordion expanded={accord === id} onChange={handleAccord(id)}>
          <AccordionSummary sx={{ minHeight: '65px !important' }}>
            <Stack direction="row" alignItems="center" useFlexGap flexWrap="wrap">
              {colaborador && (
                <ColaboradorInfo
                  id={colaborador?.id}
                  foto={colaborador?.foto_disk}
                  labelAlt={colaborador?.uo?.label}
                  nome={colaborador?.perfil?.displayName}
                  other={
                    temParecer && (
                      <Box>
                        <Label color={parecerDado === 'Favorável' ? 'success' : 'error'}>
                          {parecerDado === 'Favorável' ? 'Parecer favorável' : 'Parecer não favorável'}
                        </Label>
                      </Box>
                    )
                  }
                />
              )}
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack sx={{ pt: 1 }}>
              {temParecer ? (
                <Stack sx={{ width: 1 }}>
                  <Info temParecer={temParecer} dados={parecer} />
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
}

// ----------------------------------------------------------------------

PareceresEstado.propTypes = { assunto: PropTypes.string, pareceres: PropTypes.array };

export function PareceresEstado({ pareceres, assunto }) {
  const { colaboradores } = useSelector((state) => state.intranet);
  const [accord, setAccord] = useState(false);

  const handleAccord = (panel) => (event, isExpanded) => {
    setAccord(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ pb: 3 }}>
      {pareceres?.map((row) => {
        const { id, nome, estado_id: estadoId, estado, perfil_id: perfilId, parecer_obs: obs = '', parecer = '' } = row;
        const criador = colaboradores?.find(({ perfil_id: pid }) => pid === perfilId);

        return (
          <Stack key={`parecer_${row?.id}`} sx={{ px: { xs: 1, sm: 2 }, pt: { xs: 1, sm: 2 } }}>
            <Accordion expanded={accord === id} onChange={handleAccord(id)}>
              <AccordionSummary sx={{ minHeight: '65px !important' }}>
                <Stack spacing={1} direction="row" alignItems="center">
                  <Typography variant="subtitle1">{nome || `Estado ID: ${estadoId}`}</Typography>
                  <Label
                    color={
                      (!parecer && 'default') ||
                      (parecer === 'Favorável' && 'success') ||
                      (parecer === 'Não favorável' && 'error') ||
                      'warning'
                    }
                  >
                    {parecer || 'Sem parecer'}
                  </Label>
                  {accord === id && parecer && (
                    <Box onClick={(e) => e.stopPropagation()}>
                      <DownloadPdf
                        ficheiro={`Minuta do parecer - ${estado || estadoId}.pdf`}
                        documento={<ParecerExport dados={{ ...row, assunto, perfil: criador?.perfil }} />}
                      />
                    </Box>
                  )}
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack sx={{ width: 1, pt: 1 }}>
                  <InfoCriador
                    temParecer
                    criador={criador || { perfil_id: perfilId }}
                    dados={{ ...row, assunto, perfil: criador?.perfil }}
                  />
                  <Info temParecer dados={{ ...row, observacao: obs }} />
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>
        );
      })}
    </Box>
  );
}
