import { useEffect, useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Skeleton from '@mui/material/Skeleton';
import Accordion from '@mui/material/Accordion';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
//
import { useDispatch, useSelector } from '../../redux/store';
import { getFromIntranet } from '../../redux/slices/intranet';
// components
import Markdown from '../../components/Markdown';
import ButtonAnexo from '../../components/anexos/button-anexo';
import { DialogTitleAlt } from '../../components/CustomDialog';

// ---------------------------------------------------------------------------------------------------------------------

export default function AjudaDialog({ onClose }) {
  const dispatch = useDispatch();
  const { mail } = useSelector((state) => state.intranet);

  useEffect(() => {
    if (mail) dispatch(getFromIntranet('perguntas'));
    if (mail) dispatch(getFromIntranet('documentosAjuda'));
  }, [dispatch, mail]);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitleAlt title="Ajuda" onClose={() => onClose()} />
      <DialogContent>
        <Documentos />
        <Perguntas />
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Documentos() {
  const { documentosAjuda, isLoading } = useSelector((state) => state.intranet);
  const docs = documentosAjuda?.[0]?.anexos || [];

  return (
    <>
      <CardHeader title="Documentos de suporte" sx={{ color: 'text.success', px: 0, mb: 1 }} />
      {isLoading && docs.length === 0 ? (
        <Stack spacing={1}>
          {[...Array(2)].map((row, index) => (
            <Skeleton animation="wave" height={40} key={`index_${index}`} sx={{ transform: 'scale(1)' }} />
          ))}
        </Stack>
      ) : (
        <>
          {docs.length === 0 ? (
            <Typography variant="caption" sx={{ p: 1, pt: 0, color: 'text.secondary', fontStyle: 'italic' }}>
              Não foi encontrado nenhum documento disponível...
            </Typography>
          ) : (
            <Stack spacing={1}>
              {docs?.map(({ anexo, nome }) => (
                <ButtonAnexo item="noticia" key={anexo} file={{ nome, filename: anexo }} />
              ))}
            </Stack>
          )}
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Perguntas() {
  const [controlled, setControlled] = useState(false);
  const { perguntas, isLoading } = useSelector((state) => state.intranet);

  return (
    <>
      <CardHeader title="Perguntas frequentes" sx={{ color: 'text.success', px: 0, mb: 1 }} />
      {isLoading && perguntas.length === 0 ? (
        <Stack spacing={1}>
          {[...Array(4)].map((row, index) => (
            <Skeleton animation="wave" height={45} key={`index_${index}`} sx={{ transform: 'scale(1)' }} />
          ))}
        </Stack>
      ) : (
        <>
          {perguntas.length === 0 ? (
            <Typography variant="caption" sx={{ p: 1, pt: 0, color: 'text.secondary', fontStyle: 'italic' }}>
              Não foi encontrada nenhuma pergunta disponível...
            </Typography>
          ) : (
            <Stack spacing={1}>
              {perguntas.map((item) => (
                <Accordion
                  key={item.pergunta}
                  expanded={controlled === item.pergunta}
                  onChange={(event, isExpanded) => setControlled(isExpanded ? item.pergunta : false)}
                >
                  <AccordionSummary>
                    <Typography variant="subtitle2">{item.pergunta}</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ typography: 'body2' }}>
                    <Markdown children={item.resposta} />
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          )}
        </>
      )}
    </>
  );
}
