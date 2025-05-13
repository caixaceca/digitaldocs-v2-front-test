import { useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
// utils
import { fNumber, fPercent, fData } from '../../utils/formatNumber';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getIndicadores } from '../../redux/slices/indicadores';
// components
import Chart, { useChart } from '../../components/chart';
//
import { IndicadorItem } from './Indicadores';

export function DiscoFicheiros() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { fileSystem, isLoading } = useSelector((state) => state.indicadores);

  useEffect(() => {
    dispatch(getIndicadores('fileSystem', { item: 'fileSystem' }));
  }, [dispatch]);

  const tamanho = 650000000000;
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
          total: { label: `Usado de ${fData(tamanho)}`, fontSize: theme.typography.body2.fontSize },
        },
      },
    },
  });

  const total = { tipo: 'Total', qnt: 0, tamanho: 0, file: 'folder' };
  const pdf = { tipo: 'Pdf', qnt: 0, tamanho: 0, file: 'format_pdf' };
  const outros = { tipo: 'Outros', qnt: 0, tamanho: 0, file: 'file' };
  const word = { tipo: 'Word', qnt: 0, tamanho: 0, file: 'format_word' };
  const imagem = { tipo: 'Img', qnt: 0, tamanho: 0, file: 'format_image' };
  const excel = { tipo: 'Excel', qnt: 0, tamanho: 0, file: 'format_excel' };

  fileSystem?.forEach(({ tipo, quantidade, tamanhoMB }) => {
    total.qnt += quantidade;
    total.tamanho += tamanhoMB * 1000000;
    if (tipo === 'application/pdf') {
      pdf.qnt += quantidade;
      pdf.tamanho += tamanhoMB * 1000000;
    } else if (tipo.includes('image/')) {
      imagem.qnt += quantidade;
      imagem.tamanho += tamanhoMB * 1000000;
    } else if (tipo === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || tipo.includes('excel')) {
      excel.qnt += quantidade;
      excel.tamanho += tamanhoMB * 1000000;
    } else if (
      tipo === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      tipo.includes('msword')
    ) {
      word.qnt += quantidade;
      word.tamanho += tamanhoMB * 1000000;
    } else {
      outros.qnt += quantidade;
      outros.tamanho += tamanhoMB * 1000000;
    }
  });

  return (
    <Card>
      <IndicadorItem
        isLoading={isLoading}
        isNotFound={!fileSystem.length}
        children={
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Chart
                height={500}
                type="radialBar"
                options={chartOptions}
                series={[total?.tamanho > 0 ? ((total?.tamanho * 100) / tamanho).toFixed(2) : 0]}
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
                          borderRadius: 1,
                          boxShadow: 'none',
                          border: `solid 1px ${theme.palette.divider}`,
                          '&:hover': { bgcolor: 'background.neutral', boxShadow: theme.customShadows.z2 },
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
                              <Typography variant="caption" sx={{ color: 'text.secondary', typography: 'body2' }}>
                                {folder.qnt > 1 ? 'ficheiros' : 'ficheiro'}
                              </Typography>
                            </Stack>
                          </Stack>

                          <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={0.5}>
                            <Typography variant="h6"> {fData(folder.tamanho)} </Typography>
                            {folder.tipo !== 'Total' && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', typography: 'body2' }}>
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
          </Grid>
        }
      />
    </Card>
  );
}
