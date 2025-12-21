import { format } from 'date-fns';
// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// utils
import { emailCheck } from '../../utils/validarAcesso';
// redux
import { useSelector } from '../../redux/store';
// components
import { newLineText } from '../../components/Panel';

// ---------------------------------------------------------------------------------------------------------------------

export default function FraseContent({ frase }) {
  const { colaboradores } = useSelector((state) => state.intranet);
  const sugeridoPor = colaboradores?.find(({ id }) => id === frase?.sugerido_por);
  const isKPI = emailCheck(sugeridoPor?.email) && frase?.frase?.includes('KPI - Key Performance Indicator');
  return (
    <Stack sx={{ p: 2, flexGrow: 1, color: 'text.secondary' }}>
      <Typography gutterBottom variant="h6" sx={{ textAlign: 'center', color: 'success.main' }}>
        Frase da semana
        {format(new Date(), 'MM') === '03' && (
          <Typography component="span" variant="body2" sx={{ fontWeight: 300 }}>
            &nbsp;- Especial março mês da Mulher 🌹
          </Typography>
        )}
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
      {!!sugeridoPor && (
        <Stack direction="row" alignItems="center" justifyContent="right" spacing={0.5}>
          <Typography variant="caption">Citado por:</Typography>
          <Typography variant="subtitle2">
            {sugeridoPor?.nome} ({sugeridoPor?.uo_label})
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}
