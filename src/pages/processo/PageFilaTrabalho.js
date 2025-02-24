import { add } from 'date-fns';
import PropTypes from 'prop-types';
import { useEffect, useState, useMemo } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
// utils
import { fNumber } from '../../utils/formatNumber';
import { setItemValue } from '../../utils/formatObject';
import { colorLabel } from '../../utils/getColorPresets';
import { pertencoAoEstado } from '../../utils/validarAcesso';
// hooks
import useToggle from '../../hooks/useToggle';
import useSettings from '../../hooks/useSettings';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromIntranet } from '../../redux/slices/intranet';
import { getIndicadores } from '../../redux/slices/indicadores';
import { geParamsUtil } from '../../redux/slices/parametrizacao';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import { DefaultAction } from '../../components/Actions';
import { DialogTitleAlt } from '../../components/CustomDialog';
// sections
import { TableProcessos } from '../../sections/tabela';

// ----------------------------------------------------------------------

const TabsWrapperStyle = styled('div')(({ theme }) => ({
  zIndex: 9,
  bottom: 0,
  width: '100%',
  display: 'flex',
  position: 'absolute',
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up('sm')]: { justifyContent: 'center' },
  [theme.breakpoints.up('md')]: { justifyContent: 'flex-end', paddingRight: theme.spacing(3) },
}));

// ----------------------------------------------------------------------

export default function PageFilaTrabalho() {
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { totalP } = useSelector((state) => state.indicadores);
  const { cc, dateUpdate } = useSelector((state) => state.intranet);
  const { meusAmbientes } = useSelector((state) => state.parametrizacao);

  useEffect(() => {
    if (cc?.id && add(new Date(dateUpdate), { minutes: 2 }) < new Date())
      dispatch(getFromIntranet('cc', { id: cc?.id }));

    if (cc?.id && add(new Date(dateUpdate), { minutes: 5 }) < new Date()) {
      dispatch(getFromIntranet('colaboradores'));
      dispatch(geParamsUtil());
    }
  }, [dispatch, cc?.id, dateUpdate]);

  const tabs = useMemo(() => {
    const baseTabs = [
      { value: 'Tarefas', num: totalP?.total_tarefa || 0, component: <TableProcessos from="Tarefas" /> },
      { value: 'Retidos', num: totalP?.total_retido || 0, component: <TableProcessos from="Retidos" /> },
      { value: 'Atribuídos', num: totalP?.total_afeto || 0, component: <TableProcessos from="Atribuídos" /> },
      { value: 'Pendentes', num: totalP?.total_pendente || 0, component: <TableProcessos from="Pendentes" /> },
    ];

    if (pertencoAoEstado(meusAmbientes, ['Validação OPE', 'Execução OPE'])) {
      baseTabs.push({
        value: 'Agendados',
        num: totalP?.total_agendado || 0,
        component: <TableProcessos from="Agendados" />,
      });
    }

    if (pertencoAoEstado(meusAmbientes, ['DOP - Validação Notas Externas', 'DOP - Execução Notas Externas'])) {
      baseTabs.push(
        { value: 'Finalizados', num: totalP?.total_finalizado || 0, component: <TableProcessos from="Finalizados" /> },
        { value: 'Executados', num: totalP?.total_executado || 0, component: <TableProcessos from="Executados" /> }
      );
    }

    return baseTabs;
  }, [totalP, meusAmbientes]);

  const storedTab = localStorage.getItem('tabProcessos');
  const defaultTab = tabs.map((tab) => tab.value).includes(storedTab) ? storedTab : tabs[0]?.value || 'Tarefas';
  const [currentTab, setCurrentTab] = useState(defaultTab);

  useEffect(() => {
    if (!tabs.map((tab) => tab.value).includes(currentTab)) setItemValue(tabs[0]?.value, setCurrentTab, 'tabProcessos');
  }, [tabs, currentTab]);

  return (
    <Page title="Fila de trabalho | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Card sx={{ mb: 3, height: 100, position: 'relative' }}>
          <Stack direction="row" spacing={1} sx={{ px: 2, py: 1, color: 'common.white', bgcolor: 'primary.main' }}>
            <Typography variant="h4">Fila de trabalho</Typography>
            <DefaultAction variant="outlined" label="Nº PROCESSOS" color="inherit" handleClick={() => onOpen()} />
            {open && <TotalProcessos onCancel={() => onClose()} />}
          </Stack>

          <TabsWrapperStyle>
            <Tabs
              value={currentTab}
              variant="scrollable"
              allowScrollButtonsMobile
              onChange={(event, newValue) => setItemValue(newValue, setCurrentTab, 'tabProcessos')}
            >
              {tabs.map((tab) => (
                <Tab
                  disableRipple
                  key={tab.value}
                  value={tab.value}
                  label={
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Box>{tab.value}</Box>
                      <Label color={colorLabel(tab.value)} sx={{ p: 0.75, height: 20 }}>
                        {fNumber(tab.num)}
                      </Label>
                    </Stack>
                  }
                />
              ))}
            </Tabs>
          </TabsWrapperStyle>
        </Card>

        {tabs.map((tab) => tab.value === currentTab && <Box key={tab.value}>{tab.component}</Box>)}
      </Container>
    </Page>
  );
}

// ----------------------------------------------------------------------

TotalProcessos.propTypes = { onCancel: PropTypes.func };

export function TotalProcessos({ onCancel }) {
  const dispatch = useDispatch();
  const { posicaoAtual } = useSelector((state) => state.indicadores);
  const { meuAmbiente, meusAmbientes } = useSelector((state) => state.parametrizacao);

  const [fluxo, setFluxo] = useState(null);
  const [estado, setEstaddo] = useState(meuAmbiente);

  useEffect(() => {
    if (estado?.id || fluxo?.id) {
      dispatch(
        getIndicadores('posicaoAtual', {
          item: 'posicaoAtual',
          fluxoId: fluxo?.id,
          fluxoKey: 'fluxo_id',
          estadoId: estado?.id,
          estadoKey: 'estado_id',
        })
      );
    }
  }, [dispatch, estado?.id, fluxo?.id]);

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitleAlt title="Nº de processos" onClose={() => onCancel()} />
      <DialogContent sx={{ mt: 1 }}>
        <Stack direction="row" spacing={1} sx={{ pt: 2 }}>
          <Autocomplete
            fullWidth
            value={estado}
            disableClearable
            options={meusAmbientes}
            getOptionLabel={(option) => option?.nome}
            onChange={(event, newValue) => {
              setFluxo(null);
              setEstaddo(newValue);
            }}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            renderInput={(params) => <TextField {...params} label="Estado" margin="none" />}
          />
          <Autocomplete
            fullWidth
            value={fluxo}
            getOptionLabel={(option) => option?.assunto}
            onChange={(event, newValue) => setFluxo(newValue)}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            renderInput={(params) => <TextField {...params} label="Fluxo" margin="none" />}
            options={estado?.fluxos?.map(({ fluxo_id: id, assunto }) => ({ id, assunto }))}
          />
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            Total:
          </Typography>
          <Typography variant="h5">{fNumber(posicaoAtual?.total)}</Typography>
          <Typography variant="h6" sx={{ fontWeight: 300 }}>
            processo{posicaoAtual?.total > 1 ? 's' : ''}
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
