import { useMemo } from 'react';
// @mui
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
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
import { DefaultAction } from '../../../components/Actions';
//
import ModelosRespostas from './modelos-resposta';
import { PdfPreview, ImagemPreview } from './preview-anexo';

// ---------------------------------------------------------------------------------------------------------------------

const sx1 = {
  borderRadius: 1,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  height: { xs: 400, lg: 650 },
  bgcolor: 'background.neutral',
};

// ---------------------------------------------------------------------------------------------------------------------

export default function Anexos({ anexos }) {
  const dispatch = useDispatch();
  const { mail } = useSelector((state) => state.intranet);
  const { filePreview, isLoadingPreview, processo } = useSelector((state) => state.digitaldocs);

  const { id, estado = {}, status = '', origem_id: origemId } = processo;
  const anexosList = useMemo(
    () => anexos?.filter(({ anexo }) => anexo !== filePreview?.anexo),
    [anexos, filePreview?.anexo]
  );

  const viewAnexo = (anexo) => {
    const params = { processoId: id, anexo: { ...anexo, tipoDoc: canPreview(anexo) } };
    dispatch(getAnexo(canPreview(anexo) ? 'filePreview' : 'fileDownload', params));
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
        {anexosPorData(anexosList)?.map(({ data, anexos }) => (
          <Stack key={data} sx={{ pb: 1 }}>
            <Divider textAlign="left" sx={{ py: 0.5, my: 1, typography: 'overline' }}>
              {data}
            </Divider>
            <Stack spacing={1} direction="row" useFlexGap sx={{ flexWrap: 'wrap' }}>
              {anexos?.map((row) => (
                <AnexoItem anexo={row} key={row?.anexo} viewAnexo={viewAnexo} />
              ))}
            </Stack>
          </Stack>
        ))}
        {((emailCheck(mail, '') && origemId) || (estado?.estado?.includes('Notas Externas') && status !== 'A')) && (
          <ModelosRespostas />
        )}
      </Stack>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function AnexoItem({ anexo, preview, parecer = false, viewAnexo = null, eliminado = false, onEliminar = null }) {
  const { colaboradores } = useSelector((state) => state.intranet);
  const { isLoadingFile } = useSelector((state) => state.digitaldocs);
  const { id, anexo: file, url = '', nome, tipo = '', entidade = '', criador = '', criado_em: criado = '' } = anexo;
  const { modificador = '', data_emissao: emissao = '', data_validade: validade = '', modificado_em: mod = '' } = anexo;

  return (
    <Button
      variant="soft"
      onClick={() => viewAnexo(anexo)}
      color={url ? 'success' : 'inherit'}
      disabled={preview || isLoadingFile === file}
      startIcon={isLoadingFile === file ? <CircularProgress size={26} /> : getFileThumb(false, null, nome)}
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
          !tipo || tipo === 'OUTROS' ? (
            nome
          ) : (
            <>
              {`${tipo}${entidade ? ` - ${entidade}` : ''}`}
              <Typography variant="spam" sx={{ typography: 'body2', color: 'text.secondary', lineHeight: 1.25 }}>
                &nbsp;({nome})
              </Typography>
            </>
          )
        }
        secondary={
          (criador || criado || emissao || validade || (eliminado && (modificador || mod))) && (
            <Stack useFlexGap flexWrap="wrap" direction="row" sx={{ pt: 0.5 }}>
              <Criado caption tipo="user" value={findColaborador(criador, colaboradores)} baralhar />
              <Criado
                caption
                tipo={eliminado || parecer ? 'data' : 'time'}
                value={eliminado || parecer ? ptDateTime(criado) : ptTime(criado)}
              />
              <Criado caption iconText="Emissão:" value={ptDate(emissao)} />
              <Criado caption iconText="Validade:" value={ptDate(validade)} />
              {eliminado && (modificador || mod) && (
                <Criado caption iconText="Eliminado:" value={`${modificador}${mod ? ` - ${ptDateTime(mod)}` : ''}`} />
              )}
            </Stack>
          )
        }
      />
      {onEliminar && (
        <ListItemSecondaryAction onClick={(e) => e.stopPropagation()}>
          <DefaultAction small label="ELIMINAR" onClick={() => onEliminar(id, entidade)} />
        </ListItemSecondaryAction>
      )}
    </Button>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

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
