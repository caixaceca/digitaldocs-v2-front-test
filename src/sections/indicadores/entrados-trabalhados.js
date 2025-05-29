import { sumBy } from 'lodash';
import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
// utils
import { getFile } from '../../utils/getFile';
import { useToggle1 } from '../../hooks/useToggle';
import { setItemValue } from '../../utils/formatObject';
import { fNumber, fPercent } from '../../utils/formatNumber';
import { ColaboradoresAcesso } from '../../utils/validarAcesso';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useSelector } from '../../redux/store';
// components
import GridItem from '../../components/GridItem';
import MyAvatar from '../../components/MyAvatar';
import { DefaultAction } from '../../components/Actions';
import { DialogTitleAlt } from '../../components/CustomDialog';
//
import { IndicadorItem, ColaboradorCard } from './Indicadores';

// --------------------------------------------------------------------------------------------------------------------------------------------

EntradasTrabalhados.propTypes = { indicadores: PropTypes.array };

export function EntradasTrabalhados({ indicadores }) {
  const [colaborador1, setColaborador1] = useState(null);
  const [colaborador2, setColaborador2] = useState(null);
  const { toggle1: open1, onOpen1, onClose1 } = useToggle1();
  const { isLoading } = useSelector((state) => state.indicadores);
  const { cc, colaboradores } = useSelector((state) => state.intranet);
  const { isAdmin, isAuditoria, meusAmbientes } = useSelector((state) => state.parametrizacao);
  const [detail, setDetail] = useState(localStorage.getItem('detail') === 'true');

  const colaboradoresAcesso = useMemo(
    () => ColaboradoresAcesso(colaboradores, cc, isAdmin || isAuditoria, meusAmbientes)?.map((row) => row?.id),
    [cc, colaboradores, isAdmin, isAuditoria, meusAmbientes]
  );
  const dadosByColaborador = useMemo(
    () =>
      indicadoresGroupBy(
        indicadores?.filter((row) => colaboradoresAcesso?.includes(row?.perfil_id)),
        'perfil_id'
      ),
    [colaboradoresAcesso, indicadores]
  );
  const dadosByAssunto = useMemo(() => indicadoresGroupBy(indicadores, 'assunto'), [indicadores]);
  const total = useMemo(() => sumBy(indicadores, 'total'), [indicadores]);
  const isNotFound = !dadosByColaborador.length;
  const colaboradoresList = useMemo(
    () => colaboradoresFilter(colaboradores, dadosByColaborador),
    [colaboradores, dadosByColaborador]
  );
  const totalC1 = useMemo(
    () => sumBy(dadosByColaborador?.find((row) => row?.item === colaborador1?.id)?.processos, 'total'),
    [colaborador1?.id, dadosByColaborador]
  );
  const totalC2 = useMemo(
    () => sumBy(dadosByColaborador?.find((row) => row?.item === colaborador2?.id)?.processos, 'total'),
    [colaborador2?.id, dadosByColaborador]
  );

  const handleClose = () => {
    onClose1();
    setColaborador1(null);
    setColaborador2(null);
  };

  return (
    <>
      {isLoading || isNotFound ? (
        <Card>
          <IndicadorItem isLoading={isLoading} isNotFound={isNotFound} />{' '}
        </Card>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          <GridItem md={6} lg={4}>
            <Card sx={{ height: 1, p: 2, pt: 1 }}>
              <Stack spacing={1} direction="row" alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
                <Typography variant="h5" sx={{ color: 'text.secondary' }}>
                  Total:
                </Typography>
                <Typography variant="h5">{fNumber(total)}</Typography>
              </Stack>
              <Stack spacing={1} direction="row" alignItems="center" justifyContent="center">
                <DefaultAction
                  small
                  button
                  label={detail ? 'Esconder detalhes' : 'Mostrar detalhes'}
                  onClick={() => setItemValue(!detail, setDetail, 'detail', false)}
                />
                {dadosByColaborador.length > 1 && (
                  <>
                    <DefaultAction small button onClick={onOpen1} label="Comparar colaboradores" />
                    {open1 && (
                      <Dialog open onClose={handleClose} fullWidth maxWidth="sm">
                        <DialogTitleAlt title="Comparação colaboradores" onClose={handleClose} />
                        <DialogContent>
                          <Grid container spacing={1.5} sx={{ mt: 1 }}>
                            <ColaboradorComp
                              colaborador={colaborador1}
                              colaboradorComp={colaborador2}
                              setColaborador={setColaborador1}
                              colaboradoresList={colaboradoresList}
                            />
                            <ColaboradorComp
                              colaborador={colaborador2}
                              colaboradorComp={colaborador1}
                              setColaborador={setColaborador2}
                              colaboradoresList={colaboradoresList}
                            />
                            {colaborador1 && colaborador2 && (
                              <>
                                <LineProgress
                                  isTotal
                                  item="Total"
                                  trabalhadoC1={totalC1}
                                  trabalhadoC2={totalC2}
                                  leftSuccess={totalC1 > totalC2}
                                />
                                {dadosByAssunto?.map((row) => {
                                  const trabalhadoC1 =
                                    dadosByColaborador
                                      ?.find((colaborador) => colaborador?.item === colaborador1?.id)
                                      ?.processos?.find((assunto) => assunto?.assunto === row?.item)?.total || 0;
                                  const trabalhadoC2 =
                                    dadosByColaborador
                                      ?.find((colaborador) => colaborador?.item === colaborador2?.id)
                                      ?.processos?.find((assunto) => assunto?.assunto === row?.item)?.total || 0;
                                  return (
                                    <>
                                      {(trabalhadoC1 > 0 || trabalhadoC2 > 0) && (
                                        <LineProgress
                                          item={row?.item}
                                          trabalhadoC1={trabalhadoC1}
                                          trabalhadoC2={trabalhadoC2}
                                          leftSuccess={trabalhadoC1 > trabalhadoC2}
                                        />
                                      )}
                                    </>
                                  );
                                })}
                              </>
                            )}
                          </Grid>
                        </DialogContent>
                      </Dialog>
                    )}
                  </>
                )}
              </Stack>
              {detail && (
                <>
                  {dadosByAssunto?.map((row) => {
                    const subtotal = sumBy(row?.processos, 'total');
                    const percentagem = (subtotal * 100) / total;
                    return (
                      <Stack key={`${row.item}_entrab`} spacing={0.5} sx={{ width: 1, my: 3 }}>
                        <Stack spacing={0.5} direction="row" alignItems="center" justifyContent="space-between">
                          <Typography variant="body2" noWrap sx={{ flexGrow: 1 }}>
                            {row?.item}
                          </Typography>
                          <Stack
                            spacing={0.75}
                            direction="row"
                            alignItems="center"
                            divider={<Divider orientation="vertical" flexItem />}
                          >
                            <Typography variant="subtitle1">&nbsp;{fNumber(subtotal)}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {fPercent(percentagem)}
                            </Typography>
                          </Stack>
                        </Stack>
                        <LinearProgress variant="determinate" value={percentagem} color="success" />
                      </Stack>
                    );
                  })}
                </>
              )}
            </Card>
          </GridItem>
          {dadosByColaborador?.map((row) => (
            <ColaboradorCard
              total={total}
              key={row.item}
              detail={detail}
              colaboradorDados={row}
              assuntos={dadosByAssunto}
            />
          ))}
        </Grid>
      )}
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

ColaboradorComp.propTypes = {
  colaborador: PropTypes.object,
  setColaborador: PropTypes.func,
  colaboradorComp: PropTypes.object,
  colaboradoresList: PropTypes.array,
};

export function ColaboradorComp({ colaborador, colaboradoresList = [], colaboradorComp, setColaborador }) {
  return (
    <GridItem sm={6}>
      <Stack
        spacing={1}
        direction="row"
        alignItems="center"
        sx={{ py: 1, px: 1.5, bgcolor: 'background.neutral', borderRadius: 1 }}
      >
        <MyAvatar
          name={colaborador?.label}
          src={getFile('colaborador', colaborador?.foto)}
          sx={{ width: 50, height: 50, boxShadow: (theme) => theme.customShadows.z8 }}
        />
        <Autocomplete
          fullWidth
          size="small"
          disableClearable
          value={colaborador}
          onChange={(event, newValue) => setColaborador(newValue)}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          options={colaboradoresList?.filter((row) => row?.id !== colaboradorComp?.id)}
          renderInput={(params) => <TextField {...params} label="Colaborador 1" />}
        />
      </Stack>
    </GridItem>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

LineProgress.propTypes = {
  item: PropTypes.string,
  isTotal: PropTypes.bool,
  leftSuccess: PropTypes.bool,
  trabalhadoC1: PropTypes.number,
  trabalhadoC2: PropTypes.number,
};

export function LineProgress({ item, trabalhadoC1, trabalhadoC2, isTotal, leftSuccess }) {
  const theme = useTheme();
  const colorLeft = leftSuccess ? theme.palette.success.main : theme.palette.focus.main;
  const colorRight = leftSuccess ? theme.palette.focus.main : theme.palette.success.main;
  const totalT = trabalhadoC1 > trabalhadoC2 ? trabalhadoC1 : trabalhadoC2;
  return (
    <>
      <GridItem sx={{ mt: 1.25 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant={isTotal ? 'h6' : 'subtitle1'}>{fNumber(trabalhadoC1)}</Typography>
          <Typography variant={isTotal ? 'body1' : 'body2'} noWrap sx={{ textAlign: 'center' }}>
            {item}
          </Typography>
          <Typography variant={isTotal ? 'h6' : 'subtitle1'}>{fNumber(trabalhadoC2)}</Typography>
        </Stack>
      </GridItem>
      <GridItem xs={6} sx={{ pt: '6px !important' }}>
        <Stack direction="column" alignItems="flex-end">
          <Box sx={{ width: `${(trabalhadoC1 * 100) / totalT}%`, border: `2px solid ${colorLeft}` }}> </Box>
          <Box sx={{ width: '100%', border: `1px solid ${colorLeft}` }}> </Box>
        </Stack>
      </GridItem>
      <GridItem xs={6} sx={{ pt: '6px !important' }}>
        <Stack direction="column" alignItems="flex-start">
          <Box sx={{ width: `${(trabalhadoC2 * 100) / totalT}%`, border: `2px solid ${colorRight}` }}> </Box>
          <Box sx={{ width: '100%', border: `1px solid ${colorRight}` }}> </Box>
        </Stack>
      </GridItem>
    </>
  );
}

// ----------------------------------------------------------------------

function indicadoresGroupBy(dados, item) {
  const dadosGrouped = [];
  dados = applySort(dados, getComparator('asc', 'assunto'));
  dados.reduce((res, value) => {
    if (!res[value[item]]) {
      res[value[item]] = { item: value[item], processos: [] };
      dadosGrouped.push(res[value[item]]);
    }
    res[value[item]].processos.push({ assunto: value?.assunto, total: value?.total });
    return res;
  }, {});

  return dadosGrouped;
}

// ----------------------------------------------------------------------

function colaboradoresFilter(colaboradores, dados) {
  const colaboradoresList = [];
  dados?.forEach((row) => {
    const colab = colaboradores?.find((item) => item.perfil_id === row?.item);
    if (colab) {
      colaboradoresList.push({ id: colab?.perfil_id, foto: colab?.foto_disk, label: colab?.perfil?.displayName });
    }
  });

  return colaboradoresList;
}
