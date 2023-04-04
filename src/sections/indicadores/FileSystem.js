import { useEffect } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { Box, Grid, Card, Stack, Typography, CardContent } from '@mui/material';
// utils
import { fData, fNumber, fPercent } from '../../utils/formatNumber';
// redux
import { getIndicadores } from '../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../redux/store';
// components
import { SearchNotFound } from '../../components/table';
import Chart, { useChart } from '../../components/chart';

// ----------------------------------------------------------------------

export default function FileSystem() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { fileSystem, isLoading } = useSelector((state) => state.digitaldocs);
  const { mail, currentColaborador } = useSelector((state) => state.intranet);
  const isNotFound = !fileSystem.length;
  const chartColors = [theme.palette.primary.main, theme.palette.primary.dark];
  const chartOptions = useChart({
    chart: { offsetY: -16, sparkline: { enabled: true } },
    grid: { padding: { top: 24, bottom: 24 } },
    legend: { show: false },
    plotOptions: {
      radialBar: {
        endAngle: 90,
        startAngle: -90,
        hollow: { size: '56%' },
        dataLabels: {
          name: { offsetY: 8 },
          value: { offsetY: -50 },
          total: {
            label: `Usado de ${fData(500000000000)}`,
            color: theme.palette.text.disabled,
            fontSize: theme.typography.body2.fontSize,
            fontWeight: theme.typography.body2.fontWeight,
          },
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: [chartColors].map((colors) => [
          { offset: 0, color: colors[0] },
          { offset: 75, color: colors[1] },
        ]),
      },
    },
  });

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
      dispatch(getIndicadores('fileSystem', { mail, perfilId: currentColaborador?.perfil_id }));
    }
  }, [dispatch, currentColaborador?.perfil_id, mail]);

  return (
    <>
      <Card>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            {isLoading ? (
              ''
            ) : (
              <>
                {isNotFound ? (
                  <Grid item xs={12}>
                    <SearchNotFound message="Nenhum registo encontrado" />
                  </Grid>
                ) : (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Chart
                        height={500}
                        type="radialBar"
                        options={chartOptions}
                        series={[((total?.tamanho * 100) / 500000000000).toFixed(2)]}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={2}>
                        {[total, pdf, imagem, excel, word, outros].map(
                          (folder) =>
                            folder.qnt > 0 && (
                              <Card
                                key={folder.tipo}
                                sx={{
                                  p: 2,
                                  boxShadow: 'none',
                                  border: (theme) => `solid 1px ${theme.palette.divider}`,
                                  '&:hover': {
                                    bgcolor: 'background.neutral',
                                    boxShadow: (theme) => theme.customShadows.z2,
                                  },
                                }}
                              >
                                <Stack spacing={2} direction="row" alignItems="center">
                                  <Box
                                    component="img"
                                    sx={{ width: 45, height: 45 }}
                                    src={`/assets/icons/file_format/${folder.file}.svg`}
                                  />

                                  <Stack spacing={0.5} flexGrow={1}>
                                    <Typography variant="subtitle1">{folder.tipo}</Typography>
                                    <Stack direction="row" alignContent="center" spacing={0.5}>
                                      <Typography variant="body2">{fNumber(folder.qnt)} </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: 'text.secondary', typography: 'body2' }}
                                      >
                                        {folder.qnt > 1 ? 'ficheiros' : 'ficheiro'}
                                      </Typography>
                                    </Stack>
                                  </Stack>

                                  <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <Typography variant="h6"> {fData(folder.tamanho)} </Typography>
                                    {folder.tipo !== 'Total' && (
                                      <Typography
                                        variant="caption"
                                        sx={{ color: 'text.secondary', typography: 'body2' }}
                                      >
                                        ({fPercent((folder.tamanho * 100) / total.tamanho)})
                                      </Typography>
                                    )}
                                  </Stack>
                                </Stack>
                              </Card>
                            )
                        )}
                      </Stack>
                    </Grid>
                  </>
                )}
              </>
            )}
          </Grid>
        </CardContent>
      </Card>
    </>
  );
}
