import { add, sub } from 'date-fns';
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
import { meusFluxos } from '../../redux/slices/parametrizacao';
import { getIndicadores } from '../../redux/slices/indicadores';
import { getInfoInicial, getSuccess } from '../../redux/slices/intranet';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import { TabsWrapperStyle } from '../../components/Panel';
import { DefaultAction } from '../../components/Actions';
import { DialogTitleAlt } from '../../components/CustomDialog';
// sections
import TableProcessos from '../../sections/tabela/table-processos';
import ProcessoForm from '../../sections/processo/form/form-processo';

// ---------------------------------------------------------------------------------------------------------------------

export default function PageFilaTrabalho() {
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { totalP } = useSelector((state) => state.indicadores);
  const { cc, dateUpdate } = useSelector((state) => state.intranet);
  const { isOpenModal } = useSelector((state) => state.digitaldocs);
  const { meusAmbientes, meuAmbiente } = useSelector((state) => state.parametrizacao);

  useEffect(() => {
    if (cc?.id && add(new Date(dateUpdate), { minutes: 10 }) < new Date()) dispatch(getInfoInicial(cc?.id, false));
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

  const refreshDados = () => dispatch(getSuccess({ item: 'dateUpdate', dados: sub(new Date(), { minutes: 10 }) }));

  return (
    <Page title="Fila de trabalho | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Card sx={{ mb: 3, height: 95, position: 'relative' }}>
          <Stack
            spacing={0.5}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 2, py: 0.88, color: 'common.white', bgcolor: 'primary.main' }}
          >
            <Stack spacing={0.5} direction="row" alignItems="center">
              <Typography variant="h5">Fila de trabalho</Typography>
              {meusAmbientes?.length > 0 && (
                <DefaultAction small color="inherit" variant="outlined" label="Nº PROCESSOS" onClick={onOpen} />
              )}
            </Stack>
            {cc && (
              <DefaultAction small color="inherit" variant="outlined" label="ATAULIZAR DADOS" onClick={refreshDados} />
            )}
          </Stack>

          <TabsWrapperStyle>
            <Tabs
              value={currentTab}
              allowScrollButtonsMobile
              onChange={(event, newValue) => setItemValue(newValue, setCurrentTab, 'tabProcessos')}
            >
              {tabs.map(({ value, num }) => (
                <Tab
                  disableRipple
                  key={value}
                  value={value}
                  sx={{ px: 0.32, py: 1.2 }}
                  label={
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Box>{value}</Box>
                      <Label color={colorLabel(value)} sx={{ p: 0.75, height: 20 }}>
                        {fNumber(num)}
                      </Label>
                    </Stack>
                  }
                />
              ))}
            </Tabs>
          </TabsWrapperStyle>
        </Card>

        <Box>{tabs.find(({ value }) => value === currentTab)?.component}</Box>

        {open && <TotalProcessos onClose={() => onClose()} />}
        {isOpenModal === 'adicionar-processo' && <ProcessoForm processo={null} ambientId={meuAmbiente?.id} />}
      </Container>
    </Page>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function TotalProcessos({ onClose }) {
  const dispatch = useDispatch();
  const { perfilId } = useSelector((state) => state.intranet);
  const { posicaoAtual } = useSelector((state) => state.indicadores);
  const { meuAmbiente, meusAmbientes } = useSelector((state) => state.parametrizacao);

  const [fluxo, setFluxo] = useState(null);
  const [estado, setEstaddo] = useState(meuAmbiente);

  useEffect(() => {
    if (estado?.id || fluxo?.id) {
      const keys = { fluxoKey: 'fluxo_id', item: 'posicaoAtual', estadoKey: 'estado_id', perfilKey: 'perfil_cc_id' };
      dispatch(getIndicadores('posicaoAtual', { perfilId, fluxoId: fluxo?.id, estadoId: estado?.id, ...keys }));
    }
  }, [dispatch, perfilId, estado?.id, fluxo?.id]);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitleAlt title="Nº de processos" onClose={() => onClose()} />
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
            options={meusFluxos(estado?.fluxos)}
            getOptionLabel={(option) => option?.assunto}
            onChange={(event, newValue) => setFluxo(newValue)}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            renderInput={(params) => <TextField {...params} label="Fluxo" margin="none" />}
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
