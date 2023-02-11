import PropTypes from 'prop-types';
import { m } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// @mui
import { Button, Container, Typography } from '@mui/material';
// components
import { MotionContainer, varBounce } from '../components/animate';
// assets
import { ForbiddenIllustration } from '../assets';
// redux
import { useSelector } from '../redux/store';

// ----------------------------------------------------------------------

RoleBasedGuard.propTypes = {
  hasContent: PropTypes.bool,
  roles: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node.isRequired,
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
      <Container component={MotionContainer} sx={{ textAlign: 'center', mt: 5 }}>
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
    ) : null;
  }

  return <>{children}</>;
}
