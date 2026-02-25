// @mui
import Avatar from '@mui/material/Avatar';
// utils
import { getIntranetFile } from '@/utils/formatFile';

// ---------------------------------------------------------------------------------------------------------------------

export default function Aplicacoes({ minhasAplicacoes = [] }) {
  if (minhasAplicacoes?.length === 0) return [];

  return minhasAplicacoes?.map(({ link, nome, logo_disco: logo }) => ({
    path:
      link?.includes('/extrato') || link?.includes('/digitalforms')
        ? `${link}?token=${localStorage.getItem('accessToken')}`
        : link,
    title: nome,
    icon: (
      <Avatar alt={nome} sx={{ p: 0.25, width: '25px', height: '25px' }} src={getIntranetFile('aplicacao', logo)} />
    ),
  }));
}
