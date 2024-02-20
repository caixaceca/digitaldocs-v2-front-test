import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// utils
import { emailCheck } from '../../utils/validarAcesso';
import { newLineText } from '../../utils/normalizeText';
// redux
import { useSelector } from '../../redux/store';

// ----------------------------------------------------------------------

FraseContent.propTypes = { frase: PropTypes.object };

export default function FraseContent({ frase }) {
  const { colaboradores } = useSelector((state) => state.intranet);
  const sugeridoPor = colaboradores?.find((row) => row?.id === frase?.sugerido_por);
  const isKPI =
    emailCheck(sugeridoPor?.perfil?.mail, 'vc.axiac@arove.ordnavi') &&
    frase?.frase?.includes('KPI - Key Performance Indicator');
  return (
    <Stack sx={{ flexGrow: 1, color: 'text.secondary' }}>
      <Typography gutterBottom variant="h5" sx={{ textAlign: 'center' }}>
        Frase da semana
      </Typography>
      <Typography variant="subtitle1" sx={{ fontStyle: 'italic', textAlign: 'center', mb: 1 }}>
        {isKPI ? (
          <>
            <Stack sx={{ textDecoration: 'line-through', mb: 1.5 }}>KPI - Key Performance Indicator</Stack>
            KPI
            <Typography variant="subtitle2">Keep People Interested</Typography>
            <Typography variant="subtitle1">Keep People Informed</Typography>
            <Typography variant="h6">Keep People Involved</Typography>
            <Typography variant="h5" sx={{ mb: 2.5 }}>
              Keep People Inspired
            </Typography>
            {newLineText(
              frase?.frase?.replace(
                'KPI - Key Performance Indicator\nKPI\nKeep People Interested\nKeep People Informed\nKeep People Involved\nKeep People Inspired',
                ''
              )
            )}
          </>
        ) : (
          newLineText(
            frase?.frase ||
              '"Coisas incríveis no mundo dos negócios nunca são feitas por uma única pessoa, e sim por uma equipa" - Steve Jobs'
          )
        )}
      </Typography>
      {frase?.autor && (
        <Stack direction="row" alignItems="center" justifyContent="right" spacing={0.5}>
          <Typography variant="caption">Autor(a):</Typography>
          <Typography variant="subtitle2">{frase?.autor}</Typography>
        </Stack>
      )}
      {frase?.colaborador && (
        <Stack direction="row" alignItems="center" justifyContent="right" spacing={0.5}>
          <Typography variant="caption">Citado por:</Typography>
          <Typography variant="subtitle2">
            {frase?.colaborador?.perfil?.displayName} ({frase?.colaborador?.uo?.label})
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}
