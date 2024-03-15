import { useEffect } from 'react';
import PropTypes from 'prop-types';
// @mui
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
// utils
import { emailCheck } from '../../utils/validarAcesso';
import { findColaborador } from '../../utils/normalizeText';
import { ptTime, ptDate, ptDateTime } from '../../utils/formatTime';
import { getFileThumb, canPreview } from '../../utils/getFileFormat';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAnexo, selectFile } from '../../redux/slices/digitaldocs';
// components
import { Criado } from '../../components/Panel';
import { SearchNotFound } from '../../components/table';
import { Loading } from '../../components/LoadingScreen';
//
import ModelosRespostas from './ModelosRespostas';
import { PdfPreview, ImagemPreview } from './FilePreview';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

Anexos.propTypes = { anexos: PropTypes.array };

export default function Anexos({ anexos }) {
  const dispatch = useDispatch();
  const { mail } = useSelector((state) => state.intranet);
  const { fileDownload, filePreview, isLoadingAnexo, isLoadingP, processo } = useSelector((state) => state.digitaldocs);
  const anexosAtivos = anexos?.filter((row) => row.ativo);
  const anexosInativos = anexos?.filter((row) => !row.ativo);

  useEffect(() => {
    if (fileDownload?.blob) {
      const link = document.createElement('a');
      link.download = fileDownload?.nome;
      link.href = window.URL.createObjectURL(fileDownload?.blob);
      link.click();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileDownload?.blob]);

  const viewAnexo = (anexo) => {
    dispatch(
      selectFile({
        item: canPreview(anexo) ? 'infoPreview' : 'infoDownload',
        dados: { ...anexo, tipo: canPreview(anexo) },
      })
    );
  };

  useEffect(() => {
    if (filePreview?.anexo && !filePreview?.url) {
      dispatch(getAnexo('filePreview', { mail, anexo: filePreview }));
    }
  }, [dispatch, mail, filePreview]);

  useEffect(() => {
    if (fileDownload?.anexo && !fileDownload?.blob) {
      dispatch(getAnexo('fileDownload', { mail, anexo: fileDownload }));
    }
  }, [dispatch, mail, fileDownload]);

  return (
    <>
      <List sx={{ pt: 0, pb: 0.5 }}>
        <ListItem disableGutters divider sx={{ pb: 0.5 }}>
          <Typography variant="subtitle1">Anexos</Typography>
        </ListItem>
      </List>
      {isLoadingP || isLoadingAnexo ? (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{ height: { xs: 400, lg: 650 }, bgcolor: 'background.neutral', borderRadius: 1 }}
        >
          <Loading />
          <Typography sx={{ color: 'text.secondary', mt: 3 }}>Carregando o ficheiro...</Typography>
        </Stack>
      ) : (
        <>
          {filePreview?.url && filePreview?.tipo === 'pdf' && <PdfPreview url={filePreview?.url} />}
          {filePreview?.url && filePreview?.tipo === 'image' && <ImagemPreview imagem={filePreview?.url} />}
          {filePreview && !filePreview?.url && (
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{ height: { xs: 400, lg: 620 }, bgcolor: 'background.neutral', borderRadius: 1 }}
            >
              <SearchNotFound message="Ficheiro não encontrado..." height={200} />
            </Stack>
          )}
        </>
      )}
      <Stack id="anexos" sx={{ mt: 1 }}>
        {anexosPorData(anexosAtivos)?.map((row) => (
          <Stack key={row?.data} sx={{ pb: 1 }}>
            <Divider sx={{ pt: 0.5, px: 3 }}>{row?.data}</Divider>
            {row?.anexos?.map((row) => (
              <AnexoItem anexo={row} key={row?.anexo} viewAnexo={viewAnexo} filePreview={filePreview} />
            ))}
          </Stack>
        ))}
        {anexosInativos?.length > 0 && (
          <RoleBasedGuard roles={['Todo-111']}>
            <Divider sx={{ mt: 1 }}>
              <Typography variant="subtitle1">Anexos eliminados</Typography>
            </Divider>
            {anexosInativos?.map((row) => (
              <AnexoItem eliminado anexo={row} key={row?.anexo} viewAnexo={viewAnexo} filePreview={filePreview} />
            ))}
          </RoleBasedGuard>
        )}
        {((emailCheck(mail, 'vc.axiac@arove.ordnavi') && processo?.origem_id) ||
          (!processo?.is_interno &&
            processo?.estado_atual?.includes('Notas Externas') &&
            processo?.estado_atual !== 'Arquivo')) && <ModelosRespostas />}
      </Stack>
    </>
  );
}

// ----------------------------------------------------------------------

AnexoItem.propTypes = {
  anexo: PropTypes.object,
  viewAnexo: PropTypes.func,
  eliminado: PropTypes.bool,
  filePreview: PropTypes.object,
};

function AnexoItem({ anexo, viewAnexo, filePreview, eliminado }) {
  const { colaboradores } = useSelector((state) => state.intranet);
  return (
    <Button
      fullWidth
      variant="soft"
      color="inherit"
      key={anexo?.anexo}
      onClick={() => viewAnexo(anexo)}
      disabled={anexo?.anexo === filePreview?.anexo}
      startIcon={getFileThumb(false, null, anexo?.nome)}
      sx={{ justifyContent: 'left', textAlign: 'left', mt: 0.5, opacity: eliminado ? 0.75 : 1, boxShadow: 'none' }}
    >
      <ListItemText
        primary={`${anexo?.nome} ${anexo?.anexo === filePreview?.anexo ? '(Em pré-vizualização)' : ''}`}
        secondary={
          <Stack direction="row" spacing={1} sx={{ opacity: anexo?.anexo === filePreview?.anexo ? 0.5 : 1 }}>
            {anexo?.criador && <Criado caption tipo="user" value={findColaborador(anexo?.criador, colaboradores)} />}
            {anexo?.criado_em && (
              <Criado caption tipo="time" value={eliminado ? ptDateTime(anexo?.criado_em) : ptTime(anexo?.criado_em)} />
            )}
          </Stack>
        }
        primaryTypographyProps={{ variant: 'subtitle2' }}
      />
    </Button>
  );
}

// ----------------------------------------------------------------------

function anexosPorData(anexos) {
  const anexosGroup = [];
  anexos
    ?.map((row) => ({ ...row, data: ptDate(row?.criado_em) }))
    ?.reduce((res, value) => {
      if (!res[value.data]) {
        res[value.data] = { data: value.data, anexos: [] };
        anexosGroup.push(res[value.data]);
      }
      res[value.data].anexos.push(value);
      return res;
    }, {});
  return anexosGroup;
}
