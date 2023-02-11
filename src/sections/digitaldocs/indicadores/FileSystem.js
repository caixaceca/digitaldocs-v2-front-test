import { useEffect } from 'react';
// @mui
import { Box, Card, Stack, Typography } from '@mui/material';
// utils
import { fData, fNumber } from '../../../utils/formatNumber';
// redux
import { getAll } from '../../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../../redux/store';
// components
import Scrollbar from '../../../components/Scrollbar';

// ----------------------------------------------------------------------

export default function FileSystem() {
  const dispatch = useDispatch();
  const { fileSystem } = useSelector((state) => state.digitaldocs);
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);

  const total = { tipo: 'Total', qnt: 0, tamanho: 0, file: 'folder' };
  const pdf = { tipo: 'Pdf', qnt: 0, tamanho: 0, file: 'format_pdf' };
  const outros = { tipo: 'Outros', qnt: 0, tamanho: 0, file: 'file' };
  const word = { tipo: 'Word', qnt: 0, tamanho: 0, file: 'format_word' };
  const imagem = { tipo: 'Img', qnt: 0, tamanho: 0, file: 'format_image' };
  const excel = { tipo: 'Excel', qnt: 0, tamanho: 0, file: 'format_excel' };

  fileSystem?.forEach((row) => {
    total.qnt += row.quantidade;
    total.tamanho += row.tamanhoMB * 1000000;
    if (row.tipo === 'application/pdf') {
      pdf.qnt += row.quantidade;
      pdf.tamanho += row.tamanhoMB * 1000000;
    } else if (row.tipo.includes('image/')) {
      imagem.qnt += row.quantidade;
      imagem.tamanho += row.tamanhoMB * 1000000;
    } else if (
      row.tipo === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      row.tipo.includes('excel')
    ) {
      excel.qnt += row.quantidade;
      excel.tamanho += row.tamanhoMB * 1000000;
    } else if (
      row.tipo === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      row.tipo.includes('msword')
    ) {
      word.qnt += row.quantidade;
      word.tamanho += row.tamanhoMB * 1000000;
    } else {
      outros.qnt += row.quantidade;
      outros.tamanho += row.tamanhoMB * 1000000;
    }
  });

  useEffect(() => {
    if (mail && currentColaborador?.perfil_id) {
      dispatch(getAll('fileSystem', { mail, perfilId: currentColaborador?.perfil_id }));
    }
  }, [dispatch, currentColaborador?.perfil_id, mail]);

  return (
    <Scrollbar>
      <Stack direction="row" spacing={3} sx={{ py: 2 }}>
        {[total, pdf, imagem, excel, word, outros].map(
          (folder, index) =>
            folder.qnt > 0 && (
              <Card
                key={`${index}_doc`}
                sx={{
                  p: 2,
                  minWidth: 215,
                  maxWidth: 215,
                  bgcolor: 'background.default',
                  boxShadow: (theme) => theme.customShadows.z20,
                  border: (theme) => `solid 1px ${theme.palette.divider}`,
                  '&:hover': { bgcolor: 'background.neutral', boxShadow: (theme) => theme.customShadows.z2 },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                  <Stack justifyContent="center" alignItems="center" spacing={1}>
                    <Box
                      component="img"
                      sx={{ width: 40, height: 40 }}
                      src={`/assets/icons/file_format/${folder.file}.svg`}
                    />
                    <Typography variant="h5">{folder.tipo}</Typography>
                  </Stack>
                  <Stack spacing={1} sx={{ typography: 'body2', textAlign: 'right' }}>
                    <Box>
                      {fNumber(folder.qnt)}{' '}
                      <Typography variant="caption" sx={{ color: 'text.secondary', typography: 'body2' }}>
                        {folder.qnt > 1 ? 'ficheiros' : 'ficheiro'}
                      </Typography>{' '}
                    </Box>
                    <Box> {fData(folder.tamanho)} </Box>
                  </Stack>
                </Stack>
              </Card>
            )
        )}
      </Stack>
    </Scrollbar>
  );
}
