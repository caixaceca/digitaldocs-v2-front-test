import PropTypes from 'prop-types';
import { m } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// @mui
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
// components
import { MotionContainer, varBounce } from '../components/animate';
// assets
import { ForbiddenIllustration } from '../assets';
// redux
import { useSelector } from '../redux/store';

// ----------------------------------------------------------------------

RoleBasedGuard.propTypes = {
  hasContent: PropTypes.bool,
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string),
};

export default function RoleBasedGuard({ hasContent, roles, children }) {
  const navigate = useNavigate();
  const { meusacessos } = useSelector((state) => state.digitaldocs);

  let noRole = true;
  roles?.forEach((_row) => {
    if (meusacessos.includes(_row)) {
      noRole = false;
    }
  });

  if (typeof roles !== 'undefined' && noRole) {
    return hasContent ? (
      <Card>
        <CardContent>
          <Container component={MotionContainer} sx={{ textAlign: 'center' }}>
            <m.div variants={varBounce().in}>
              <Typography variant="h3" paragraph>
                Sem permissão
              </Typography>
            </m.div>

            <m.div variants={varBounce().in}>
              <Typography sx={{ color: 'text.secondary' }}>
                Não tens permissão para aceder a este item,
                <br />
                Contactar o administrador de sistema (DICS)
              </Typography>
            </m.div>

            <m.div variants={varBounce().in}>
              <ForbiddenIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />
            </m.div>

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
