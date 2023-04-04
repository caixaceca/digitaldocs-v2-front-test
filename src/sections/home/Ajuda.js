/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState, useEffect } from 'react';
// @mui
import {
  Box,
  Card,
  Grid,
  Stack,
  Dialog,
  Button,
  Skeleton,
  Accordion,
  CardHeader,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// utils
import { BASEURL } from '../../utils/axios';
import { getFileThumb } from '../../utils/getFileFormat';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromIntranet } from '../../redux/slices/intranet';
// components
import Image from '../../components/Image';
import Markdown from '../../components/Markdown';
import Scrollbar from '../../components/Scrollbar';
import SearchNotFound from '../../components/table/SearchNotFound';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';

// ----------------------------------------------------------------------

export default function Ajuda() {
  const dispatch = useDispatch();
  const [controlled, setControlled] = useState(false);
  const [isOpenVideo, setIsOpenVideo] = useState(false);
  const { mail, perguntas, ajuda, isLoading } = useSelector((state) => state.intranet);

  useEffect(() => {
    if (mail) {
      dispatch(getFromIntranet('ajuda', { mail }));
      dispatch(getFromIntranet('perguntas', { mail }));
    }
  }, [dispatch, mail]);

  const handleChangeControlled = (panel) => (event, isExpanded) => {
    setControlled(isExpanded ? panel : false);
  };

  const handleViewVideo = () => {
    setIsOpenVideo(true);
  };

  const handleCloseModalVideo = () => {
    setIsOpenVideo(false);
  };

  const isNotFound = !perguntas.length;

  return (
    <>
      <Grid container spacing={5} sx={{ pt: 3 }}>
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
                src={`${PATH_DIGITALDOCS.general.noPath}assets/manual_utilizador.png`}
                sx={{ borderRadius: '10px !important' }}
              />
            </Button>
          </Card>
          <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 2 }}>
            {ajuda?.video_disco && (
              <Button
                color="inherit"
                size="medium"
                onClick={() => handleViewVideo()}
                startIcon={getFileThumb(`${BASEURL}/help/ficheiro/${ajuda?.video_disco}`)}
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
                  <Skeleton animation="wave" height={60} />
                  <Skeleton animation="wave" height={60} />
                  <Skeleton animation="wave" height={60} />
                  <Skeleton animation="wave" height={60} />
                  <Skeleton animation="wave" height={60} />
                  <Skeleton animation="wave" height={60} />
                </Stack>
              ) : (
                <>
                  {!isLoading && isNotFound ? (
                    <SearchNotFound message="Não foi encontrada nenhuma pergunta frequente disponível..." />
                  ) : (
                    <>
                      {perguntas.map((item) => (
                        <Accordion
                          key={item.pergunta}
                          expanded={controlled === item.pergunta}
                          onChange={handleChangeControlled(item.pergunta)}
                        >
                          <AccordionSummary expandIcon={<KeyboardArrowDownIcon sx={{ width: 20 }} />}>
                            <Stack direction="row">
                              <Typography variant="subtitle2" sx={{ py: 0.5, color: 'text.secondary' }}>
                                {item.pergunta}
                              </Typography>
                            </Stack>
                          </AccordionSummary>
                          <AccordionDetails sx={{ typography: 'body2' }}>
                            <Markdown children={item.resposta} />
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </>
                  )}
                </>
              )}
            </Scrollbar>
          </Box>
        </Grid>
      </Grid>

      <Dialog open={isOpenVideo} onClose={handleCloseModalVideo} fullWidth maxWidth="lg">
        <video width="100%" controls="controls" loop autoPlay="autoplay">
          <source src={`${BASEURL}/help/ficheiro/${ajuda?.video_disco}`} type="video/mp4" />O seu navegador não suporta
          a tag vídeo
        </video>
      </Dialog>
    </>
  );
}
