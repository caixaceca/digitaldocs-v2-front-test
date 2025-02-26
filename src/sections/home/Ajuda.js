/* eslint-disable jsx-a11y/media-has-caption */
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Accordion from '@mui/material/Accordion';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
// utils
import { BASEURL } from '../../utils/apisUrl';
import { getFileThumb } from '../../utils/formatFile';
// hooks
import useToggle from '../../hooks/useToggle';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromIntranet } from '../../redux/slices/intranet';
// components
import Image from '../../components/Image';
import Markdown from '../../components/Markdown';
import Scrollbar from '../../components/Scrollbar';
import { IconButtonHead } from '../../layouts/header';
import { DialogTitleAlt } from '../../components/CustomDialog';
import SearchNotFound from '../../components/table/SearchNotFound';

// ----------------------------------------------------------------------

export default function Ajuda() {
  const { toggle: open, onOpen, onClose } = useToggle();

  return (
    <>
      <IconButtonHead
        open={open}
        title="Ajuda"
        onOpen={onOpen}
        icon={<HelpOutlineOutlinedIcon sx={{ width: { xs: 24, sm: 30 }, height: { xs: 24, sm: 30 } }} />}
      />
      {open && <AjudaDialog onClose={onClose} />}
    </>
  );
}

AjudaDialog.propTypes = { onClose: PropTypes.func };

function AjudaDialog({ onClose }) {
  const dispatch = useDispatch();
  const [controlled, setControlled] = useState(false);
  const [isOpenVideo, setIsOpenVideo] = useState(false);
  const { mail, perguntas, ajuda, isLoading } = useSelector((state) => state.intranet);

  useEffect(() => {
    if (mail) dispatch(getFromIntranet('ajuda'));
    if (mail) dispatch(getFromIntranet('perguntas'));
  }, [dispatch, mail]);

  const isNotFound = !perguntas.length;

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitleAlt title="Ajuda" onClose={() => onClose()} />
      <DialogContent>
        <Grid container spacing={3} sx={{ pt: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <Button
                color="inherit"
                size="medium"
                href={`${BASEURL}/help/ficheiro/${ajuda?.manual_disco}`}
                target="_blank"
                rel="noopener"
                sx={{ p: 0.5 }}
              >
                <Image
                  sx={{ borderRadius: 1 }}
                  src="https://intranet.caixa.cv:5000/sobre/file/sobre_caixa/2f926dcfa9314540bc31c9e52fb327c1.png"
                />
              </Button>
            </Card>
            <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 2 }}>
              {ajuda?.video_disco && (
                <Button
                  size="medium"
                  color="inherit"
                  onClick={() => setIsOpenVideo(true)}
                  startIcon={getFileThumb(false, null, ajuda?.video_disco)}
                >
                  Video manual
                </Button>
              )}
            </Stack>
          </Grid>
          <Grid item xs={12} sm={8}>
            <CardHeader title="Perguntas frequentes" action="" sx={{ color: 'text.success', p: 0, mb: 1 }} />
            <Box sx={{ height: '460px' }}>
              <Scrollbar>
                {isLoading && isNotFound ? (
                  <Stack>
                    {[...Array(6)].map((row, index) => (
                      <Skeleton animation="wave" height={70} key={`index_${index}`} />
                    ))}
                  </Stack>
                ) : (
                  <>
                    {!isLoading && isNotFound ? (
                      <SearchNotFound message="Não foi encontrada nenhuma pergunta frequente disponível..." />
                    ) : (
                      <Stack spacing={1}>
                        {perguntas.map((item) => (
                          <Accordion
                            key={item.pergunta}
                            expanded={controlled === item.pergunta}
                            sx={{ '&.Mui-expanded': { boxShadow: (theme) => theme.customShadows.z1 } }}
                            onChange={(event, isExpanded) => {
                              setControlled(isExpanded ? item.pergunta : false);
                            }}
                          >
                            <AccordionSummary>
                              <Stack direction="row">
                                <Typography variant="subtitle2" sx={{ py: 0.5, color: 'text.secondary' }}>
                                  {item.pergunta}
                                </Typography>
                              </Stack>
                            </AccordionSummary>
                            <AccordionDetails sx={{ typography: 'body2' }}>
                              <Markdown own children={item.resposta} />
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </Stack>
                    )}
                  </>
                )}
              </Scrollbar>
            </Box>
          </Grid>
        </Grid>

        {isOpenVideo && (
          <Dialog open onClose={() => setIsOpenVideo(false)} fullWidth maxWidth="lg">
            <video width="100%" controls="controls" loop autoPlay="autoplay">
              <source src={`${BASEURL}/help/ficheiro/${ajuda?.video_disco}`} type="video/mp4" />O seu navegador não
              suporta a tag vídeo
            </video>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
