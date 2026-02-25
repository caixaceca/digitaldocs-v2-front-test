// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';
// utils
import useToggle from '@/hooks/useToggle';
import { useMetadadosCreditoData } from './useMetadadosCreditoData';
// Components
import GridItem from '@/components/GridItem';
import { DefaultAction } from '@/components/Actions';
import { SearchNotFoundSmall } from '@/components/table/SearchNotFound';
import MetadadosCreditoForm from '../../form/credito/form-metadados-credito';

// ---------------------------------------------------------------------------------------------------------------------

export default function MetadadosCredito({ dados, prazo = '', modificar = false, ids = null }) {
  const theme = useTheme();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { financeiroPrincipal, cardsVisible } = useMetadadosCreditoData(dados);

  return (
    <Box sx={{ p: 1 }}>
      {dados ? (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {financeiroPrincipal.map((item) => (
              <GridItem xs={6} md={3} key={item.label}>
                <Card
                  sx={{
                    p: 1.5,
                    textAlign: 'center',
                    boxShadow: theme.customShadows.cardAlt,
                    bgcolor: alpha(theme.palette[item.color].main, 0.025),
                  }}
                >
                  <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                    {item.label}
                  </Typography>
                  <Typography variant="h6" sx={{ color: `${item.color}.main` }}>
                    {item.value || '---'}
                  </Typography>
                </Card>
              </GridItem>
            ))}
          </Grid>

          <Box
            gap={3}
            display="grid"
            gridTemplateColumns={{
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: `repeat(${cardsVisible?.length > 4 ? 3 : 2}, 1fr)`,
              xl: `repeat(${cardsVisible?.length > 4 ? 3 : cardsVisible?.length}, 1fr)`,
            }}
            alignItems="center"
          >
            {cardsVisible.map((card, index) => (
              <Card key={index} sx={{ height: '100%', boxShadow: theme.customShadows.cardAlt, borderRadius: 0 }}>
                <CardHeader
                  title={card.titulo}
                  titleTypographyProps={{
                    variant: 'subtitle2',
                    sx: { color: 'primary.main', textTransform: 'uppercase' },
                  }}
                  sx={{ py: 1.25, bgcolor: 'background.neutral' }}
                />
                <CardContent sx={{ py: 2 }}>
                  <Stack spacing={1} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
                    {card.dados
                      .filter((d) => d.value)
                      .map((item, idx) => (
                        <Box
                          key={idx}
                          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
                        >
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>
                            {item.title}:
                          </Typography>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography
                              variant="body2"
                              noWrap={!item.noWrap}
                              sx={{ fontWeight: item.bold ? 700 : 400, color: item.color || 'text.primary' }}
                            >
                              {item.value}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        </>
      ) : (
        <SearchNotFoundSmall message="Nenhuma informação adicionada..." />
      )}

      {modificar && (
        <Stack direction="row" justifyContent="center" sx={{ mt: 4 }}>
          <DefaultAction variant="contained" button label={dados ? 'Editar' : 'Adicionar'} onClick={onOpen} />
        </Stack>
      )}

      {open && <MetadadosCreditoForm onClose={onClose} dados={{ ...dados, prazo }} ids={ids} />}
    </Box>
  );
}
