import PropTypes from 'prop-types';
// @mui
import Avatar from '@mui/material/Avatar';
// utils
import { BASEURL } from '../../utils/apisUrl';

// ----------------------------------------------------------------------

Aplicacoes.propTypes = { minhasAplicacoes: PropTypes.array };

export default function Aplicacoes({ minhasAplicacoes = [] }) {
  return minhasAplicacoes?.length === 0
    ? []
    : minhasAplicacoes?.map(({ link, nome, logo_disco: logo }) => ({
        path: link,
        title: nome,
        icon: (
          <Avatar
            alt={nome}
            sx={{ p: 0.25, width: '25px', height: '25px' }}
            src={`${BASEURL}/aplicacao/logo/${logo}`}
          />
        ),
      }));
}
