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
import { TabsWrapperStyle } from '../../components/Panel';
import { DefaultAction } from '../../components/Actions';
import { DialogTitleAlt } from '../../components/CustomDialog';
// sections
import { TableProcessos } from '../../sections/tabela';
import ProcessoForm from '../../sections/processo/form/form-processo';

// ----------------------------------------------------------------------

export default function PageFilaTrabalho() {
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { totalP } = useSelector((state) => state.indicadores);
  const { cc, dateUpdate } = useSelector((state) => state.intranet);
  const { isOpenModal } = useSelector((state) => state.digitaldocs);
  const { meusAmbientes, meuAmbiente } = useSelector((state) => state.parametrizacao);

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
        <Card sx={{ mb: 3, height: 95, position: 'relative' }}>
          <Stack
            spacing={0.5}
            direction="row"
            alignItems="center"
            sx={{ px: 2, py: 0.88, color: 'common.white', bgcolor: 'primary.main' }}
          >
            <Typography variant="h5">Fila de trabalho</Typography>
            {meusAmbientes?.length > 0 && (
              <DefaultAction small color="inherit" variant="outlined" label="Nº PROCESSOS" onClick={onOpen} />
            )}
          </Stack>

          <TabsWrapperStyle>
            <Tabs
              value={currentTab}
              allowScrollButtonsMobile
              onChange={(event, newValue) => setItemValue(newValue, setCurrentTab, 'tabProcessos')}
            >
              {tabs.map((tab) => (
                <Tab
                  disableRipple
                  key={tab.value}
                  sx={{ px: 0.32, py: 1.2 }}
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

        <Box>{tabs.find((tab) => tab.value === currentTab)?.component}</Box>

        {open && <TotalProcessos onCancel={() => onClose()} />}
        {isOpenModal === 'adicionar-processo' && <ProcessoForm processo={null} ambientId={meuAmbiente?.id} />}
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
            options={meusAmbientes || []}
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
            options={estado?.fluxos?.map(({ fluxo_id: id, assunto }) => ({ id, assunto })) || []}
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
