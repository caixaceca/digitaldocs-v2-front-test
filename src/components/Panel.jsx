// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import { styled } from '@mui/material/styles';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import BusinessIcon from '@mui/icons-material/Business';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
// utils
import { baralharString } from '../utils/formatText';
import { getIntranetFile } from '../utils/formatFile';
import { ptDateTime, diferencaAnos } from '../utils/formatTime';
// components
import Logo from './Logo';
import Label from './Label';
import SvgIconStyle from './SvgIconStyle';
import MyAvatar, { AvatarBedge } from './MyAvatar';

// ---------------------------------------------------------------------------------------------------------------------

export default function Panel({ label, value, sx }) {
  return value ? (
    <Stack
      direction="row"
      alignItems="stretch"
      sx={{
        p: 0.25,
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'background.neutral',
        border: (theme) => `dotted 1px ${theme.palette.divider}`,
        ...sx,
      }}
    >
      {label && (
        <Stack component="span" direction="row" alignItems="center" sx={{ mx: 1, color: 'text.secondary' }}>
          <Typography noWrap variant="body2">
            {label}
          </Typography>
        </Stack>
      )}

      <Label variant="ghost" sx={{ textTransform: 'none', pt: 1.75, pb: 2, width: 1, color: 'text.secondary' }}>
        <Typography noWrap sx={{ color: 'text.primary' }}>
          {value}
        </Typography>
      </Label>
    </Stack>
  ) : null;
}

// ---------------------------------------------------------------------------------------------------------------------

export function Criado({ iconText = '', tipo = '', value, value1 = '', caption = false, baralhar = false, sx }) {
  const styles = { width: caption ? 13 : 15, height: caption ? 13 : 15, color: sx?.color || 'text.disabled' };
  return value ? (
    <Stack direction="row" spacing={caption ? 0.25 : 0.5} alignItems="center" sx={{ pr: caption ? 1 : 1.5, ...sx }}>
      {(tipo === 'uo' && <BusinessIcon sx={{ ...styles }} />) ||
        (tipo === 'data' && <TodayOutlinedIcon sx={{ ...styles }} />) ||
        (tipo === 'warning' && <WarningAmberIcon sx={{ ...styles }} />) ||
        (tipo === 'note' && <CommentOutlinedIcon sx={{ ...styles }} />) ||
        (tipo === 'time' && <AccessTimeOutlinedIcon sx={{ ...styles }} />) ||
        (tipo === 'company' && <BusinessOutlinedIcon sx={{ ...styles }} />) ||
        (tipo === 'user' && <AccountCircleOutlinedIcon sx={{ ...styles }} />) ||
        (tipo === 'done' && <TaskAltIcon sx={{ width: 15, height: 15, color: 'text.success' }} />) ||
        (iconText && (
          <Typography noWrap variant={caption ? 'caption' : 'body2'} sx={{ color: 'text.disabled', pr: 0.1 }}>
            {iconText}
          </Typography>
        ))}

      <Typography noWrap variant={caption ? 'caption' : 'body2'} sx={{ pr: 0.1 }}>
        {baralhar ? baralharString(value) : value}
      </Typography>
      {value1 && (
        <Typography noWrap variant={caption ? 'caption' : 'body2'} sx={{ pr: 0.1 }}>
          ({baralhar ? baralharString(value1) : value1})
        </Typography>
      )}
    </Stack>
  ) : null;
}

// ---------------------------------------------------------------------------------------------------------------------

export function Colaborador({ row, email }) {
  return (
    <ColaboradorInfo
      labelAltCaption
      id={row?.colaborador?.id}
      labelAlt={row?.utilizador_id}
      foto={row?.colaborador?.foto_anexo}
      caption={!row?.colaborador?.uo_label}
      nome={row?.colaborador?.nome || row?.utilizador_email || row?.nome}
      label={email ? row?.colaborador?.email : row?.colaborador?.uo || 'Perfil sem ID_AAD na Intranet'}
    />
  );
}

export function ColaboradorInfo({
  nome,
  foto,
  id = 0,
  sx = null,
  label = '',
  other = null,
  labelAlt = '',
  caption = false,
  labelAltCaption = false,
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ...sx }}>
      <AvatarBedge id={id}>
        <MyAvatar name={baralharString(nome)} src={getIntranetFile('colaborador', foto)} />
      </AvatarBedge>
      <Stack sx={{ ml: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography noWrap variant="subtitle2">
            {baralharString(nome)}
          </Typography>
          {!!labelAlt && (
            <Typography variant={labelAltCaption ? 'caption' : 'body2'} sx={{ color: 'text.secondary' }}>
              ({labelAlt})
            </Typography>
          )}
        </Stack>
        {!!label && (
          <Typography
            noWrap={!caption}
            variant={caption ? 'caption' : 'body2'}
            sx={{ color: caption ? 'text.disabled' : 'text.secondary' }}
          >
            {label}
          </Typography>
        )}
        {other}
      </Stack>
    </Box>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Checked({ check, color = '' }) {
  return check ? (
    <CheckCircleOutlineOutlinedIcon sx={{ color: color || 'success.main', width: 20 }} />
  ) : (
    <CloseOutlinedIcon sx={{ color: color || 'focus.main', width: 20 }} />
  );
}

export function CellChecked({ check }) {
  return (
    <TableCell align="center">
      <Checked check={check} />
    </TableCell>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function DataLabel({ data = '', termino = false }) {
  return (
    <Stack direction="row" spacing={0.5}>
      <Typography noWrap sx={{ typography: 'caption', color: 'text.secondary' }}>
        {termino ? 'Término' : 'Início'}:
      </Typography>
      <Typography
        noWrap
        sx={{ typography: 'caption', ...(!data && { fontStyle: 'italic', pr: 0.15, color: 'text.disabled' }) }}
      >
        {data ? ptDateTime(data) : '(Não definido)'}
      </Typography>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function SemDados({ message }) {
  return (
    <Box sx={{ p: 3, borderRadius: 1, bgcolor: 'background.neutral' }}>
      <Typography variant="body2" sx={{ fontStyle: 'italic', textAlign: 'center', color: 'text.secondary' }}>
        {message}
      </Typography>
    </Box>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function BoxMask({ sx = null }) {
  return (
    <Box
      sx={{
        zIndex: -1,
        opacity: 0.2,
        width: '100%',
        height: '100%',
        maskSize: 'cover',
        position: 'absolute',
        display: 'inline-flex',
        maskPositionX: 'center',
        maskPositionY: 'center',
        backgroundColor: 'currentcolor',
        maskImage: 'url(/assets/shape-square.svg)',
        ...sx,
      }}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export const TabsWrapperStyle = styled('div')(({ theme }) => ({
  zIndex: 9,
  bottom: 0,
  width: '100%',
  display: 'flex',
  position: 'absolute',
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.down('md')]: { justifyContent: 'center' },
  [theme.breakpoints.up('md')]: { justifyContent: 'flex-end', paddingRight: theme.spacing(2) },
}));

// ---------------------------------------------------------------------------------------------------------------------

export function noDados(text) {
  return (
    <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
      {text || '(Não identificado)'}
    </Typography>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function newLineText(text = '') {
  if (!text) return '';
  return text.split('\n').map((str, index) => <p key={index}>{str.trim() === '' ? '\u00A0' : str}</p>);
}

// ---------------------------------------------------------------------------------------------------------------------

export function Felicitacoes({ onClose, colaborador = null, niver = false, tempo = false, novos = false }) {
  const partProp = { position: 'absolute', color: 'success.main' };

  return (
    <Dialog
      open
      fullWidth
      maxWidth="xs"
      scroll="paper"
      onClose={onClose}
      PaperProps={{ style: { overflow: 'hidden' } }}
    >
      <Logo
        sx={{
          opacity: 0.1,
          width: '155%',
          height: '155%',
          position: 'absolute',
          transform: 'rotate(37deg)',
          left: niver && tempo ? '55%' : '60%',
          bottom: niver && tempo ? '-80%' : '-70%',
        }}
      />
      {novos ? (
        <Box sx={{ p: { xs: 4, sm: 8 } }}>
          <SvgIconStyle
            src="/assets/icons/party.svg"
            sx={{ right: 30, width: 100, height: 100, ...partProp, top: niver ? 230 : 30 }}
          />
          <Stack spacing={1} sx={{ fontWeight: 'normal', color: 'success.main', pt: 5 }}>
            <Typography variant="h6">
              Bem-vind{colaborador?.sexo === 'Masculino' ? 'o' : 'a'} a família CAIXA
            </Typography>
            <Typography variant="h4">{colaborador?.nome}</Typography>
            <Typography sx={{ pt: 2 }}>É com muito prazer que lhe damos as boas-vindas à nossa família!</Typography>
            <Typography>
              Estamos felizes por tê-lo connosco e confiantes de que a sua experiência e dedicação serão valiosas para o
              nosso crescimento.
            </Typography>
            <Typography>Que este vínculo seja duradouro e produza muitos frutos!</Typography>
          </Stack>
        </Box>
      ) : (
        <Box sx={{ p: { xs: 4, sm: 8 } }}>
          <Stack spacing={1} sx={{ fontWeight: 'normal', color: 'success.main', pt: (niver && tempo && 1) || 7 }}>
            <Stack>
              <Typography variant="h6">Parabéns:</Typography>
              <Typography variant="h4">{colaborador?.nome}</Typography>
              {niver ? (
                <Typography variant="h6" sx={{ mt: 3 }}>
                  Feliz Aniversário!
                </Typography>
              ) : (
                <Typography variant="h6" sx={{ mb: 3 }}>
                  {diferencaAnos(colaborador?.data_admissao)} de serviço!
                </Typography>
              )}
            </Stack>

            {niver && (
              <>
                <SvgIconStyle
                  src="/assets/icons/party.svg"
                  sx={{ top: 33, width: 25, height: 25, right: 65, transform: 'rotate(-60deg)', ...partProp }}
                />
                <SvgIconStyle
                  src="/assets/icons/party.svg"
                  sx={{ top: 30, width: 37, height: 37, right: 30, ...partProp }}
                />
                <SvgIconStyle
                  src="/assets/icons/party.svg"
                  sx={{ top: 65, width: 25, height: 25, right: 35, transform: 'rotate(60deg)', ...partProp }}
                />
                <SvgIconStyle
                  src="/assets/icons/calendarcake.svg"
                  sx={{ top: 60, width: 100, height: 100, right: 50, ...partProp }}
                />
                <Stack>
                  <Typography>É com muita alegria que a</Typography>
                  <Typography>Caixa celebra contigo este</Typography>
                  <Typography>dia especial.</Typography>
                </Stack>
              </>
            )}

            {tempo && (
              <>
                <SvgIconStyle
                  src="/assets/icons/medal.svg"
                  sx={{ right: 30, width: 100, height: 100, ...partProp, top: niver ? 230 : 30 }}
                />
                {niver && (
                  <Typography variant="subtitle1" sx={{ pt: 3 }}>
                    {diferencaAnos(colaborador?.data_admissao)} de serviço!
                  </Typography>
                )}
                <Stack>
                  <Typography>É com grande prazer e estima</Typography>
                  <Typography>que a Caixa comemora contigo mais</Typography>
                  <Typography>um ano de parceria, aprendizado,</Typography>
                  <Typography>empenho e dedicação.</Typography>
                </Stack>
                <Stack>
                  <Typography>Agradecemos por todo</Typography>
                  <Typography>o teu esforço e companheirismo</Typography>
                  <Typography>ao longo destes {diferencaAnos(colaborador?.data_admissao)}.</Typography>
                </Stack>
              </>
            )}

            <Stack>
              <Typography>Obrigado por fazeres parte</Typography>
              <Typography>desta Família.</Typography>
            </Stack>
          </Stack>
        </Box>
      )}
    </Dialog>
  );
}
