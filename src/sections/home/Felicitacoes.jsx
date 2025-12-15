// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
// utils
import { diferencaAnos } from '../../utils/formatTime';
// components
import Logo from '../../components/Logo';
import SvgIconStyle from '../../components/SvgIconStyle';

// ---------------------------------------------------------------------------------------------------------------------

export default function Felicitacoes({ onClose, colaborador = null, niver = false, tempo = false, novos = false }) {
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
