import { useNavigate } from 'react-router-dom';
// @mui
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
// assets
import { ForbiddenIllustration } from '../assets';
// redux
import { useSelector } from '../redux/store';

// ---------------------------------------------------------------------------------------------------------------------

export default function RoleBasedGuard({ hasContent, roles, children = null, showChildren = false }) {
  const navigate = useNavigate();
  const { meusacessos } = useSelector((state) => state.parametrizacao);
  const noRole = !roles?.find((row) => meusacessos.includes(row));

  if (typeof roles !== 'undefined' && noRole) {
    return hasContent ? (
      <Card>
        <CardContent>
          <Container sx={{ textAlign: 'center' }}>
            <Typography variant="h4" paragraph>
              Sem permissão
            </Typography>

            {showChildren && children ? (
              children
            ) : (
              <Typography sx={{ color: 'text.secondary' }}>Não tens permissão para aceder a este item.</Typography>
            )}
            <Typography sx={{ color: 'text.secondary' }}>
              Por favor, contacte o administrador do sistema para mais informações (DICS).
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              Cria um ticket no{' '}
              <Link href="http://helpdesk.caixa.cv/" variant="subtitle1" target="_blank" rel="noopener">
                GLPI
              </Link>
            </Typography>

            <ForbiddenIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />

            <Button size="large" variant="contained" onClick={() => navigate(-1)}>
              Voltar
            </Button>
          </Container>
        </CardContent>
      </Card>
    ) : null;
  }

  return <>{children}</>;
}
