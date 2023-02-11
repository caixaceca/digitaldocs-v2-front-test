import { useMsal } from '@azure/msal-react';
// redux
import { useSelector } from '../redux/store';
// utils
import createAvatar from '../utils/createAvatar';
// components
import Avatar from './Avatar';
// utils
import { BASEURL } from '../utils/axios';

// ----------------------------------------------------------------------

export default function MyAvatar({ ...other }) {
  const { accounts } = useMsal();
  const { currentColaborador } = useSelector((state) => state.colaborador);

  return (
    <Avatar
      src={currentColaborador?.foto_disk && `${BASEURL}/colaborador/file/colaborador/${currentColaborador?.foto_disk}`}
      alt={accounts[0]?.name}
      color={accounts[0]?.name ? 'default' : createAvatar(accounts[0]?.name).color}
      {...other}
    >
      {createAvatar(accounts[0]?.name).name}
    </Avatar>
  );
}
