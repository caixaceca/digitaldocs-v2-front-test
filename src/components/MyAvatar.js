import { useMsal } from '@azure/msal-react';
// redux
import { useSelector } from '../redux/store';
// components
import Avatar from './Avatar';
// utils
import { BASEURL } from '../utils/axios';

// ----------------------------------------------------------------------

export default function MyAvatar({ ...other }) {
  const { accounts } = useMsal();
  const { currentColaborador } = useSelector((state) => state.intranet);

  return (
    <Avatar
      src={currentColaborador?.foto_disk && `${BASEURL}/colaborador/file/colaborador/${currentColaborador?.foto_disk}`}
      alt={accounts[0]?.name}
      {...other}
    />
  );
}
