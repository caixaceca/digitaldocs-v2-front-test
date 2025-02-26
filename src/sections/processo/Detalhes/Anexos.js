import { useMemo } from 'react';
import PropTypes from 'prop-types';
// @mui
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
// utils
import { emailCheck } from '../../../utils/validarAcesso';
import { findColaborador } from '../../../utils/formatObject';
import { getFileThumb, canPreview } from '../../../utils/formatFile';
import { ptTime, ptDate, ptDateTime } from '../../../utils/formatTime';
// redux
import { getAnexo } from '../../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../../redux/store';
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
  const { mail } = useSelector((state) => state.intranet);
  const { filePreview, isLoadingPreview, processo } = useSelector((state) => state.digitaldocs);
  const anexosAtivos = useMemo(
    () => anexos?.filter((row) => row.ativo && row?.anexo !== filePreview?.anexo),
    [anexos, filePreview?.anexo]
  );
  const anexosInativos = useMemo(
    () => anexos?.filter((row) => !row.ativo && row?.anexo !== filePreview?.anexo),
    [anexos, filePreview?.anexo]
  );

  const viewAnexo = (anexo) => {
    dispatch(
      getAnexo(canPreview(anexo) ? 'filePreview' : 'fileDownload', { anexo: { ...anexo, tipo: canPreview(anexo) } })
    );
  };

  return (
    <>
      <List sx={{ pt: 0, pb: 0.5 }}>
        <ListItem disableGutters divider sx={{ pb: 0.5 }}>
          <Typography variant="subtitle1">Anexos</Typography>
        </ListItem>
      </List>
      {!!filePreview && (
        <Stack>
          <AnexoItem eliminado anexo={filePreview} preview />
        </Stack>
      )}
      {isLoadingPreview && !filePreview?.url ? (
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
            <Divider sx={{ py: 0.5, px: 3 }}>{row?.data}</Divider>
            <Stack spacing={1} direction="row" useFlexGap sx={{ flexWrap: 'wrap' }}>
              {row?.anexos?.map((row) => (
                <AnexoItem anexo={row} key={row?.anexo} viewAnexo={viewAnexo} />
              ))}
            </Stack>
          </Stack>
        ))}
        {anexosInativos?.length > 0 && (
          <RoleBasedGuard roles={['Todo-111']}>
            <Divider sx={{ mt: 1, pb: 0.5 }}>
              <Typography variant="subtitle2">Anexos eliminados</Typography>
            </Divider>
            <Stack spacing={1} direction="row" useFlexGap sx={{ flexWrap: 'wrap' }}>
              {anexosInativos?.map((row) => (
                <AnexoItem eliminado anexo={row} key={row?.anexo} viewAnexo={viewAnexo} />
              ))}
            </Stack>
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
  parecerId: PropTypes.number,
  transicaoId: PropTypes.number,
};

export function AnexoItem({
  anexo,
  preview,
  parecerId = '',
  parecer = false,
  transicaoId = '',
  viewAnexo = null,
  eliminado = false,
}) {
  const { colaboradores } = useSelector((state) => state.intranet);
  const { isLoadingFile } = useSelector((state) => state.digitaldocs);
  return (
    <Button
      variant="soft"
      color={anexo?.url ? 'success' : 'inherit'}
      startIcon={getFileThumb(false, null, anexo?.nome)}
      disabled={preview || isLoadingFile === anexo?.anexo}
      onClick={() => viewAnexo(anexo, transicaoId, parecerId)}
      sx={{
        flexGrow: 1,
        boxShadow: 'none',
        textAlign: 'left',
        marginTop: preview && 0,
        borderBottom: preview && '0px solid',
        borderBottomLeftRadius: preview && 0,
        borderBottomRightRadius: preview && 0,
        opacity: (preview && 1) || (eliminado && 0.75) || 1,
        color: (theme) => preview && `${theme.palette.text.primary} !important`,
        '& .MuiButton-startIcon': { opacity: isLoadingFile === anexo?.anexo ? 0.5 : 1 },
      }}
    >
      <ListItemText
        primary={anexo?.nome}
        primaryTypographyProps={{ variant: 'subtitle2', p: 0 }}
        sx={{ opacity: isLoadingFile === anexo?.anexo ? 0.5 : 1 }}
        secondary={
          <Stack useFlexGap flexWrap="wrap" direction="row" spacing={{ xs: 0.5, sm: 1.5 }}>
            {anexo?.criador && (
              <Criado caption tipo="user" value={findColaborador(anexo?.criador, colaboradores)} baralhar />
            )}
            {anexo?.criado_em && (
              <Criado
                caption
                tipo={eliminado || parecer ? 'data' : 'time'}
                value={eliminado || parecer ? ptDateTime(anexo?.criado_em) : ptTime(anexo?.criado_em)}
              />
            )}
          </Stack>
        }
      />
      {isLoadingFile === anexo?.anexo && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ position: 'absolute' }}>
          <CircularProgress size={34} thickness={5} />
        </Stack>
      )}
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
