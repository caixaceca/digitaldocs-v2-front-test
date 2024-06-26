// @mui
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
// hooks
import useSettings from '../hooks/useSettings';
// redux
import { useSelector } from '../redux/store';
// components
import Page from '../components/Page';
import { SkeletonContainer } from '../components/skeleton';
import HeaderBreadcrumbs from '../components/HeaderBreadcrumbs';
// sections
import { TolbarContrato, ContratoPdf, ContratoWord } from '../sections/contratos';

// ----------------------------------------------------------------------

export default function Contrato() {
  const { themeStretch } = useSettings();
  const { contrato, isLoading } = useSelector((state) => state.banka);

  return (
    <Page title="Contrato | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading="Contrato"
          sx={{ color: 'text.secondary' }}
          links={[{ name: '', href: '' }]}
          action={!!contrato && <ContratoWord />}
        />
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12}>
            <TolbarContrato />
          </Grid>
          {isLoading ? <SkeletonContainer /> : <ContratoPdf />}
        </Grid>
      </Container>
    </Page>
  );
}
