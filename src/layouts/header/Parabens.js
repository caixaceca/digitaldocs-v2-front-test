import { m } from 'framer-motion';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { formatDate } from '../../utils/formatTime';
// redux
import { useSelector } from '../../redux/store';
// hooks
import useToggle from '../../hooks/useToggle';
// components
import Logo from '../../components/Logo';
import Image from '../../components/Image';
import SvgIconStyle from '../../components/SvgIconStyle';
import { IconButtonAnimate } from '../../components/animate';

// ----------------------------------------------------------------------

export default function Parabens() {
  const { toggle: open, onOpen, onClose } = useToggle();
  const { cc } = useSelector((state) => state.intranet);
  const aniversarianteHoje =
    cc?.data_cel_aniv && formatDate(cc?.data_cel_aniv, 'dd-MM') === formatDate(new Date(), 'dd-MM');
  const tempoServicoHoje =
    cc?.data_admissao && formatDate(cc?.data_admissao, 'dd-MM') === formatDate(new Date(), 'dd-MM');
  const anos = tempoServicoHoje ? formatDate(new Date(), 'yyyy') - formatDate(cc?.data_admissao, 'yyyy') : 0;

  return !!aniversarianteHoje || !!tempoServicoHoje ? (
    <>
      <Tooltip arrow title="Parabéns">
        <IconButtonAnimate size="small" onClick={onOpen}>
          <m.div animate={{ rotate: [0, -20, 0, 20, 0] }} transition={{ duration: 1, repeat: Infinity }}>
            <Image src="/assets/icons/gift.svg" sx={{ width: { xs: 24, sm: 32 }, height: { xs: 24, sm: 32 } }} />
          </m.div>
        </IconButtonAnimate>
      </Tooltip>
      <Dialog
        fullWidth
        open={open}
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
            left: aniversarianteHoje && tempoServicoHoje ? '55%' : '60%',
            bottom: aniversarianteHoje && tempoServicoHoje ? '-80%' : '-70%',
          }}
        />
        <Box sx={{ p: { xs: 4, sm: 8 } }}>
          <Stack
            spacing={1}
            sx={{
              color: 'success.main',
              fontWeight: 'normal',
              pt: (aniversarianteHoje && tempoServicoHoje && 1) || (tempoServicoHoje && 3) || 5,
            }}
          >
            <Stack>
              <Typography variant="subtitle1">Parabéns:</Typography>
              <Typography variant="subtitle1">{cc?.perfil?.displayName}</Typography>
              {aniversarianteHoje ? (
                <Typography variant="subtitle1" sx={{ mb: 3 }}>
                  Feliz Aniversário!
                </Typography>
              ) : (
                <Typography variant="subtitle1" sx={{ mb: 3 }}>
                  {anos} ano{anos > 1 ? 's' : ''} de serviço!
                </Typography>
              )}
            </Stack>
            {aniversarianteHoje ? (
              <>
                <SvgIconStyle
                  src="/assets/icons/party.svg"
                  sx={{
                    top: 33,
                    width: 25,
                    right: 65,
                    height: 25,
                    position: 'absolute',
                    color: 'success.main',
                    transform: 'rotate(-60deg)',
                  }}
                />
                <SvgIconStyle
                  src="/assets/icons/party.svg"
                  sx={{ position: 'absolute', width: 37, height: 37, color: 'success.main', right: 30, top: 30 }}
                />
                <SvgIconStyle
                  src="/assets/icons/party.svg"
                  sx={{
                    top: 65,
                    width: 25,
                    right: 35,
                    height: 25,
                    position: 'absolute',
                    color: 'success.main',
                    transform: 'rotate(60deg)',
                  }}
                />
                <SvgIconStyle
                  src="/assets/icons/calendarcake.svg"
                  sx={{ position: 'absolute', width: 100, height: 100, color: 'success.main', right: 50, top: 60 }}
                />
                <Stack>
                  <Typography>É com muita alegria que a</Typography>
                  <Typography>Caixa celebra contigo este</Typography>
                  <Typography>dia especial.</Typography>
                </Stack>
              </>
            ) : (
              ''
            )}
            {tempoServicoHoje ? (
              <>
                <SvgIconStyle
                  src="/assets/icons/medal.svg"
                  sx={{
                    right: 30,
                    width: 100,
                    height: 100,
                    position: 'absolute',
                    color: 'success.main',
                    top: aniversarianteHoje ? 230 : 30,
                  }}
                />
                {aniversarianteHoje && (
                  <Typography variant="subtitle1" sx={{ pt: 3 }}>
                    {anos} ano{anos > 1 ? 's' : ''} de serviço!
                  </Typography>
                )}
                <Stack>
                  <Typography>É com grande prazer e estima</Typography>
                  <Typography>que a Caixa comemora contigo {anos > 1 ? 'mais' : ''}</Typography>
                  <Typography>um ano de parceria, aprendizado,</Typography>
                  <Typography>empenho e dedicação.</Typography>
                </Stack>
                <Stack>
                  <Typography>Agradecemos por todo</Typography>
                  <Typography>o teu esforço e companheirismo</Typography>
                  <Typography>
                    ao longo deste{anos > 1 ? 's' : ''} ano{anos > 1 ? 's' : ''}.
                  </Typography>
                </Stack>
              </>
            ) : (
              ''
            )}
            <Stack>
              <Typography>Obrigado por fazeres parte</Typography>
              <Typography>desta Família.</Typography>
            </Stack>
          </Stack>
        </Box>
      </Dialog>
    </>
  ) : (
    ''
  );
}
