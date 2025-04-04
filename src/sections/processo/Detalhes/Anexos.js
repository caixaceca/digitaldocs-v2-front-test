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
      getAnexo(canPreview(anexo) ? 'filePreview' : 'fileDownload', { anexo: { ...anexo, tipoDoc: canPreview(anexo) } })
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
          {filePreview?.url && filePreview?.tipoDoc === 'pdf' && <PdfPreview url={filePreview?.url} />}
          {filePreview?.url && filePreview?.tipoDoc === 'image' && <ImagemPreview imagem={filePreview?.url} />}
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
            <Divider textAlign="left" sx={{ py: 0.5, my: 1, typography: 'overline' }}>
              {row?.data}
            </Divider>
            <Stack spacing={1} direction="row" useFlexGap sx={{ flexWrap: 'wrap' }}>
              {row?.anexos?.map((row) => (
                <AnexoItem anexo={row} key={row?.anexo} viewAnexo={viewAnexo} />
              ))}
            </Stack>
          </Stack>
        ))}
        {anexosInativos?.length > 0 && (
          <RoleBasedGuard roles={['Todo-111']}>
            <Divider textAlign="left" sx={{ mb: 0.5, mt: 1, typography: 'overline' }}>
              Anexos eliminados
            </Divider>
            <Stack spacing={1} direction="row" useFlexGap sx={{ flexWrap: 'wrap' }}>
              {anexosInativos?.map((row) => (
                <AnexoItem eliminado anexo={row} key={row?.anexo} viewAnexo={viewAnexo} />
              ))}
            </Stack>
          </RoleBasedGuard>
        )}
        {((emailCheck(mail, '') && processo?.origem_id) ||
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
  estadoId: PropTypes.number,
  parecerId: PropTypes.number,
};

export function AnexoItem({
  anexo,
  preview,
  estadoId = '',
  parecerId = '',
  parecer = false,
  viewAnexo = null,
  eliminado = false,
}) {
  const { colaboradores } = useSelector((state) => state.intranet);
  const { isLoadingFile } = useSelector((state) => state.digitaldocs);

  return (
    <Button
      variant="soft"
      color={anexo?.url ? 'success' : 'inherit'}
      disabled={preview || isLoadingFile === anexo?.anexo}
      onClick={() => viewAnexo(anexo, estadoId, parecerId)}
      startIcon={
        isLoadingFile === anexo?.anexo ? <CircularProgress size={26} /> : getFileThumb(false, null, anexo?.nome)
      }
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
      }}
    >
      <ListItemText
        primaryTypographyProps={{ variant: 'subtitle2', p: 0, lineHeight: 1.25 }}
        primary={
          !anexo?.tipo || anexo?.tipo === 'OUTROS' ? (
            anexo?.nome
          ) : (
            <>
              {`${anexo?.tipo}${anexo?.entidade ? ` - ${anexo.entidade}` : ''}`}
              <Typography variant="spam" sx={{ typography: 'body2', color: 'text.secondary', lineHeight: 1.25 }}>
                &nbsp;({anexo?.nome})
              </Typography>
            </>
          )
        }
        secondary={
          (anexo?.criador || anexo?.criado_em || anexo?.data_emissao || anexo?.data_validade) && (
            <Stack useFlexGap flexWrap="wrap" direction="row" sx={{ pt: 0.5 }}>
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
              {anexo?.data_emissao && <Criado caption iconText="Emissão:" value={ptDate(anexo?.data_emissao)} />}
              {anexo?.data_validade && <Criado caption iconText="Validade:" value={ptDate(anexo?.data_validade)} />}
            </Stack>
          )
        }
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
