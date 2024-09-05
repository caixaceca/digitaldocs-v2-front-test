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
import { useDispatch, useSelector } from '../../../redux/store';
import { getAnexo, selectParecer, closeModal } from '../../../redux/slices/digitaldocs';
// components
import Label from '../../../components/Label';
import { ColaboradorInfo } from '../../../components/Panel';
import { DefaultAction } from '../../../components/Actions';
//
import { Info } from './Estados';
import { ParecerForm } from '../form/IntervencaoForm';

// ----------------------------------------------------------------------

Pareceres.propTypes = {
  id: PropTypes.number,
  estado: PropTypes.string,
  assunto: PropTypes.string,
  pareceres: PropTypes.array,
  estadoId: PropTypes.number,
};

export default function Pareceres({ pareceres, estado, estadoId, assunto, id }) {
  const dispatch = useDispatch();
  const [accord, setAccord] = useState(false);
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { isOpenModal1 } = useSelector((state) => state.digitaldocs);

  const handleEditar = (item) => {
    dispatch(selectParecer(item));
  };

  const handleClose = () => {
    dispatch(closeModal());
  };

  const handleAccord = (panel) => (event, isExpanded) => {
    setAccord(isExpanded ? panel : false);
  };

  const viewAnexo = (anexo, transicaoId, parecerId) => {
    dispatch(getAnexo('fileDownload', { mail, perfilId, anexo, transicaoId, parecerId }));
  };

  return (
    <Box sx={{ pb: 3 }}>
      {pareceres?.map((row) => (
        <Parecer
          accord={accord}
          assunto={assunto}
          estadoId={estadoId}
          viewAnexo={viewAnexo}
          key={`parecer_${row?.id}`}
          handleEditar={handleEditar}
          handleAccord={handleAccord}
          parecer={{ ...row, estado, observacao: row?.descritivo }}
        />
      ))}
      {isOpenModal1 && <ParecerForm openModal={isOpenModal1} onCancel={handleClose} processoId={id} />}
    </Box>
  );
}

// ----------------------------------------------------------------------

Parecer.propTypes = {
  accord: PropTypes.string,
  assunto: PropTypes.string,
  parecer: PropTypes.object,
  viewAnexo: PropTypes.func,
  estadoId: PropTypes.number,
  handleEditar: PropTypes.func,
  handleAccord: PropTypes.func,
};

export function Parecer({ estadoId, parecer, handleEditar, accord, handleAccord, assunto, viewAnexo }) {
  const { meusAmbientes } = useSelector((state) => state.parametrizacao);
  const { perfilId, colaboradores } = useSelector((state) => state.intranet);
  const colaborador = colaboradores?.find((item) => item?.perfil_id === parecer?.perfil_id);
  const temParecer =
    parecer?.parecer_em && (parecer?.parecer_favoravel === true || parecer?.parecer_favoravel === false);

  return (
    <Stack sx={{ px: { xs: 1, sm: 2 }, pt: { xs: 1, sm: 2 } }}>
      <Box sx={{ position: 'absolute', right: 15, p: 2 }}>
        <Stack direction="row" justifyContent="right" alignItems="center" spacing={1} sx={{ zIndex: 2 }}>
          {pertencoEstadoId(meusAmbientes, estadoId) && parecer?.perfil_id === perfilId && !parecer?.validado && (
            <DefaultAction
              handleClick={() => handleEditar(parecer)}
              color={temParecer ? 'warning' : 'success'}
              label={temParecer ? 'EDITAR' : 'ADICIONAR'}
            />
          )}
        </Stack>
      </Box>
      <Stack>
        <Accordion expanded={accord === parecer?.id} onChange={handleAccord(parecer?.id)}>
          <AccordionSummary sx={{ minHeight: '65px !important' }}>
            <Stack direction="row" alignItems="center" useFlexGap flexWrap="wrap">
              {colaborador && (
                <ColaboradorInfo
                  foto={colaborador?.foto_disk}
                  labelAlt={colaborador?.uo?.label}
                  nome={colaborador?.perfil?.displayName}
                  other={
                    temParecer && (
                      <Box>
                        <Label color={parecer?.parecer_favoravel ? 'success' : 'error'}>
                          {parecer?.parecer_favoravel ? 'Parecer favorável' : 'Parecer não favorável'}
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
                <Stack direction="row" spacing={1.5}>
                  <Stack sx={{ width: 1 }}>
                    <Info
                      viewAnexo={viewAnexo}
                      temParecer={temParecer}
                      dados={{ ...parecer, perfil: colaborador?.perfil, assunto, estado: parecer?.estado }}
                    />
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
}
