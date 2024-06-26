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
import { emailCheck } from '../../../utils/validarAcesso';
import { findColaborador } from '../../../utils/normalizeText';
import { ptTime, ptDate, ptDateTime } from '../../../utils/formatTime';
import { getFileThumb, canPreview } from '../../../utils/getFileFormat';
// redux
import { useDispatch, useSelector } from '../../../redux/store';
import { getAnexo, selectFile } from '../../../redux/slices/digitaldocs';
// components
import { Criado } from '../../../components/Panel';
import { SearchNotFound } from '../../../components/table';
import { Loading } from '../../../components/LoadingScreen';
//
import ModelosRespostas from './ModelosRespostas';
import { PdfPreview, ImagemPreview } from './FilePreview';
// guards
import RoleBasedGuard from '../../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

const sx1 = {
  borderRadius: 1,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  height: { xs: 400, lg: 650 },
  bgcolor: 'background.neutral',
};

// ----------------------------------------------------------------------

Anexos.propTypes = { anexos: PropTypes.array };

export default function Anexos({ anexos }) {
  const dispatch = useDispatch();
  const { fileDownload, filePreview, isLoadingAnexo, isLoadingP, processo } = useSelector((state) => state.digitaldocs);
  const { mail } = useSelector((state) => state.intranet);
  const anexosAtivos = anexos?.filter((row) => row.ativo && row?.anexo !== filePreview?.anexo);
  const anexosInativos = anexos?.filter((row) => !row.ativo && row?.anexo !== filePreview?.anexo);

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
      {!!filePreview && <AnexoItem eliminado anexo={filePreview} preview />}
      {isLoadingP || isLoadingAnexo ? (
        <Stack alignItems="center" justifyContent="center" sx={sx1}>
          <Loading />
          <Typography sx={{ color: 'text.secondary', mt: 3 }}>Carregando o ficheiro...</Typography>
        </Stack>
      ) : (
        <>
          {filePreview?.url && filePreview?.tipo === 'pdf' && <PdfPreview url={filePreview?.url} />}
          {filePreview?.url && filePreview?.tipo === 'image' && <ImagemPreview imagem={filePreview?.url} />}
          {filePreview && !filePreview?.url && (
            <Stack alignItems="center" justifyContent="center" sx={sx1}>
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
              <AnexoItem anexo={row} key={row?.anexo} viewAnexo={viewAnexo} />
            ))}
          </Stack>
        ))}
        {anexosInativos?.length > 0 && (
          <RoleBasedGuard roles={['Todo-111']}>
            <Divider sx={{ mt: 1 }}>
              <Typography variant="subtitle1">Anexos eliminados</Typography>
            </Divider>
            {anexosInativos?.map((row) => (
              <AnexoItem eliminado anexo={row} key={row?.anexo} viewAnexo={viewAnexo} />
            ))}
          </RoleBasedGuard>
        )}
        {((emailCheck(mail, 'vc.axiac@arove.ordnavi') && processo?.origem_id) ||
          (processo?.estado_atual?.includes('Notas Externas') && processo?.estado_atual !== 'Arquivo')) && (
          <ModelosRespostas />
        )}
      </Stack>
    </>
  );
}

// ----------------------------------------------------------------------

AnexoItem.propTypes = {
  preview: PropTypes.bool,
  anexo: PropTypes.object,
  parecer: PropTypes.bool,
  viewAnexo: PropTypes.func,
  eliminado: PropTypes.bool,
};

export function AnexoItem({ anexo, viewAnexo = null, preview, eliminado = false, parecer = false }) {
  const { colaboradores } = useSelector((state) => state.intranet);
  return (
    <Button
      fullWidth
      variant="soft"
      color="inherit"
      disabled={preview}
      onClick={() => viewAnexo(anexo)}
      startIcon={getFileThumb(false, null, anexo?.nome)}
      sx={{
        mt: 0.75,
        boxShadow: 'none',
        textAlign: 'left',
        marginTop: preview && 0,
        borderBottom: preview && '0px solid',
        borderBottomLeftRadius: preview && 0,
        borderBottomRightRadius: preview && 0,
        opacity: (preview && 1) || (eliminado && 0.75) || 1,
        color: (theme) => preview && `${theme.palette.text.primary} !important`,
      }}
    >
      <ListItemText
        primary={`${anexo?.nome} ${preview ? '(Em pré-vizualização)' : ''}`}
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
              <Criado caption tipo="user" value={findColaborador(anexo?.criador, colaboradores)} shuffle />
            )}
            {anexo?.criado_em && (
              <Criado
                caption
                tipo="time"
                value={eliminado || parecer ? ptDateTime(anexo?.criado_em) : ptTime(anexo?.criado_em)}
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
