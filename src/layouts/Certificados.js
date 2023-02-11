// @mui
import { Stack } from '@mui/material';
// redux
import { useSelector } from '../redux/store';
// components
import Image from '../components/Image';
// utils
import { BASEURL } from '../utils/axios';

// ----------------------------------------------------------------------

export default function Certificados() {
  const { certificacoes } = useSelector((state) => state.certificacao);

  return (
    <Stack spacing={3} alignItems="center" sx={{ px: 5.5, pb: 5, my: 10, width: 1, textAlign: 'center' }}>
      {certificacoes.map((cert) => (
        <Image
          key={cert.designacao}
          alt={cert.designacao}
          src={`${BASEURL}/certificacao/file/certificacao/${cert?.imagem_disco}`}
          sx={{ width: '100%', height: 'auto', borderRadius: 1.5, flexShrink: 0, px: 3 }}
        />
      ))}
    </Stack>
  );
}
