import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import pt from '@react-pdf-viewer/locales/lib/pt_PT.json';
import { Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
// utils
import { ptDateTime, ptDate } from '../../../utils/formatTime';
import { b64toBlob, getFileThumb } from '../../../utils/formatFile';
// redux
import { useDispatch, useSelector } from '../../../redux/store';
import { getFromCC, closeModal } from '../../../redux/slices/cc';
// components
import Image from '../../../components/Image';
import { Criado } from '../../../components/Panel';
import { DTFechar } from '../../../components/Actions';
import { SearchNotFound } from '../../../components/table';
import { Loading } from '../../../components/LoadingScreen';
//
import { Adiantamento, Habitacao } from './Formulario';

// ----------------------------------------------------------------------

Anexos.propTypes = { item: PropTypes.string, anexos: PropTypes.array };

export default function Anexos({ item, anexos }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState('');
  const { mail } = useSelector((state) => state.intranet);
  const { isOpenModal } = useSelector((state) => state.cc);
  const anexosAtivos = anexos?.filter((row) => row?.ativo);
  const anexosEliminados = anexos?.filter((row) => !row?.ativo);

  const viewAnexo = (anexo) => {
    if (!anexo?.id) {
      setForm(anexo?.designacao);
    } else if (mail && anexo) {
      dispatch(
        getFromCC('anexo', {
          mail,
          anexo,
          processo: item === 'anexos' || item === 'anexos entidades' ? 'true' : 'false',
        })
      );
    }
  };

  return (
    <CardContent sx={{ p: item === 'anexos' ? 3 : 0 }}>
      {anexosAtivos?.map((anexo, index) => (
        <Anexo key={`${anexo?.anexo}:${index}`} anexo={anexo} viewAnexo={viewAnexo} />
      ))}

      {anexosEliminados?.length > 0 && (
        <>
          <Divider sx={{ mt: 3 }}>Anexos eliminados</Divider>
          {anexosEliminados?.map((anexo, index) => (
            <Anexo key={`${anexo?.anexo}:${index}`} anexo={anexo} viewAnexo={viewAnexo} eliminado />
          ))}
        </>
      )}

      {isOpenModal && <AnexoPreview />}
      {item === 'anexos' && !!form && <Formulario form={form} setForm={setForm} />}
    </CardContent>
  );
}

// ----------------------------------------------------------------------

Anexo.propTypes = { anexo: PropTypes.object, viewAnexo: PropTypes.func, eliminado: PropTypes.bool };

function Anexo({ anexo, viewAnexo, eliminado = false }) {
  const { colaboradores } = useSelector((state) => state.intranet);
  const colaborador = colaboradores?.find((row) => row?.perfil?.mail === anexo?.criador);

  return (
    <Button
      fullWidth
      variant="soft"
      color="inherit"
      onClick={() => viewAnexo(anexo)}
      startIcon={getFileThumb(false, null, anexo?.anexo)}
      sx={{ mt: 0.75, boxShadow: 'none', textAlign: 'left', opacity: eliminado ? 0.75 : 1 }}
    >
      <ListItemText
        primary={anexo?.designacao}
        secondary={
          <Stack
            useFlexGap
            flexWrap="wrap"
            direction="row"
            sx={{ mt: 0.25 }}
            spacing={{ xs: 0.5, sm: 1 }}
            divider={<Divider orientation="vertical" flexItem />}
          >
            {anexo?.criador && (
              <Criado
                caption
                tipo="user"
                value={`${colaborador?.perfil?.displayName || anexo?.criador} ${
                  colaborador?.uo?.label ? `(${colaborador?.uo?.label})` : ''
                }`}
              />
            )}
            {anexo?.criado_em && <Criado caption tipo="data" value={ptDateTime(anexo?.criado_em)} />}
            {anexo?.data_validade && (
              <Criado
                caption
                tipo="time"
                sx={{ color: 'info.main' }}
                value={`VALIDADE: ${ptDate(anexo?.data_validade)}`}
              />
            )}
          </Stack>
        }
        primaryTypographyProps={{ variant: 'subtitle2' }}
      />
    </Button>
  );
}

// ----------------------------------------------------------------------

function AnexoPreview() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [url, setUrl] = useState('');
  const defaultLayoutPluginInstance = defaultLayoutPlugin({ toolbarPlugin: {} });
  const { isLoadingPreview, selectedAnexo, anexo } = useSelector((state) => state.cc);

  useEffect(() => {
    if (anexo?.preview !== 'pdf' && anexo?.preview !== 'image' && anexo?.anexo?.ficheiro) {
      const blob = b64toBlob(anexo?.anexo?.ficheiro, selectedAnexo.conteudo);
      const link = document.createElement('a');
      link.download = anexo?.anexo?.nome;
      link.href = window.URL.createObjectURL(blob);
      link.click();
      dispatch(closeModal());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anexo]);

  useEffect(() => {
    if ((anexo?.preview === 'pdf' || anexo?.preview === 'image') && anexo?.anexo?.ficheiro) {
      setUrl(URL?.createObjectURL(b64toBlob(anexo?.anexo?.ficheiro)));
    }
  }, [anexo]);

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  return (
    <Dialog fullScreen open>
      <DTFechar title={selectedAnexo?.designacao} handleClick={() => handleCloseModal()} />
      <DialogContent sx={{ mt: 2, px: anexo?.preview === 'pdf' ? 0 : 3, pb: anexo?.preview === 'pdf' ? 0 : 3 }}>
        <Box sx={{ flexGrow: 1, height: '100%' }}>
          {isLoadingPreview ? (
            <Stack direction="column" alignItems="center" justifyContent="center" sx={{ height: 1 }}>
              <Loading />
              <Typography sx={{ color: 'text.secondary', mt: 3 }}>Carregando o ficheiro...</Typography>
            </Stack>
          ) : (
            <>
              {!anexo ? (
                <Stack direction="column" alignItems="center" justifyContent="center" sx={{ height: 1 }}>
                  <SearchNotFound message="Ficheiro não encontrado..." />
                </Stack>
              ) : (
                <>
                  {anexo?.preview === 'image' && url && <Image src={url} sx={{ borderRadius: 2 }} />}
                  {anexo?.preview === 'pdf' && url && (
                    <Viewer
                      fileUrl={url}
                      localization={pt}
                      theme={{ theme: theme.palette.mode }}
                      defaultScale={SpecialZoomLevel.PageFit}
                      plugins={[defaultLayoutPluginInstance]}
                    />
                  )}
                </>
              )}
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

Formulario.propTypes = { form: PropTypes.string, setForm: PropTypes.func };

export function Formulario({ form, setForm }) {
  const { pedidoCC } = useSelector((state) => state.cc);
  const { uos, colaboradores } = useSelector((state) => state.intranet);
  const uo = uos?.find((row) => Number(row?.balcao) === Number(pedidoCC?.balcao_domicilio));
  const colaborador = colaboradores?.find(
    (row) => row?.perfil?.mail?.toLowerCase() === pedidoCC?.criador?.toLowerCase()
  );
  return (
    <Dialog fullScreen open>
      <DTFechar title={form} handleClick={() => setForm('')} />
      <DialogContent sx={{ p: 0, mt: 2 }}>
        <Box sx={{ flexGrow: 1, height: '100%', overflow: 'hidden' }}>
          <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
            {(form === 'CCRD.FM.P.001.00' && (
              <Adiantamento pedido={pedidoCC} uo={uo?.label} colaborador={colaborador} />
            )) ||
              (form === 'CCRD.FM.P.003.00' && <Habitacao pedido={pedidoCC} colaborador={colaborador} />)}
          </PDFViewer>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
