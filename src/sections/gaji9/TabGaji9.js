import { useState } from 'react';
import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import FormControlLabel from '@mui/material/FormControlLabel';
// utils
import { setItemValue } from '../../utils/formatObject';
// hooks
import useToggle from '../../hooks/useToggle';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { openModal, getSuccess, getFromGaji9 } from '../../redux/slices/gaji9';
// Components
import { DefaultAction } from '../../components/Actions';
import { TabsWrapperSimple } from '../../components/TabsWrapper';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
//
import InfoCaixa from './dados-caixa';
import TableGaji9 from './TableGaji9';
import TableCredito from './table-creditos';

// ----------------------------------------------------------------------

TabGaji9.propTypes = { item: PropTypes.string, label: PropTypes.string, subTabs: PropTypes.bool };

export default function TabGaji9({ item, label, subTabs }) {
  const [inativos, setInativos] = useState(false);
  return subTabs ? (
    <SubTabsGaji9 item={item} label={label} inativos={inativos} setInativos={setInativos} />
  ) : (
    <>
      <HeaderBreadcrumb label={label} inativos={inativos} setInativos={setInativos} />
      {item === 'creditos' ? <TableCredito /> : <TableGaji9 item={item} inativos={inativos} />}
    </>
  );
}

// ----------------------------------------------------------------------

SubTabsGaji9.propTypes = {
  item: PropTypes.string,
  label: PropTypes.string,
  inativos: PropTypes.bool,
  setInativos: PropTypes.func,
};

function SubTabsGaji9({ item, label, inativos, setInativos }) {
  const [currentTab, setCurrentTab] = useState(
    localStorage.getItem(`subTabGaji9${item}`) ||
      (item === 'identificadores' && 'Produtos') ||
      (item === 'intervenientes' && 'Entidades') ||
      'Grupos'
  );

  const handleChangeTab = async (event, newValue) => {
    setItemValue(newValue, setCurrentTab, `subTabGaji9${item}`, false);
  };

  const tabsList = [
    ...((item === 'acessos' && [
      { value: 'Grupos', component: <TableGaji9 item="grupos" inativos={inativos} /> },
      { value: 'Funções', component: <TableGaji9 item="funcoes" inativos={inativos} /> },
      { value: 'Recursos', component: <TableGaji9 item="recursos" inativos={inativos} /> },
    ]) ||
      (item === 'intervenientes' && [
        { value: 'Entidades', component: <TableGaji9 item="entidades" inativos={inativos} /> },
        { value: 'Representantes', component: <TableGaji9 item="representantes" inativos={inativos} /> },
      ]) ||
      (item === 'identificadores' && [
        { value: 'Produtos', component: <TableGaji9 item="componentes" inativos={inativos} /> },
        { value: 'Tipos de titulares', component: <TableGaji9 item="tiposTitulares" inativos={inativos} /> },
        { value: 'Tipos de garantias', component: <TableGaji9 item="tiposGarantias" inativos={inativos} /> },
        { value: 'Variáveis', component: <TableGaji9 item="variaveis" inativos={inativos} /> },
        { value: 'Marcadores', component: <TableGaji9 item="marcadores" inativos={inativos} /> },
      ]) ||
      []),
  ];

  return (
    <>
      <HeaderBreadcrumb label={`${label} - ${currentTab}`} inativos={inativos} setInativos={setInativos} />
      <TabsWrapperSimple tabsList={tabsList} currentTab={currentTab} changeTab={handleChangeTab} sx={{ mb: 3 }} />
      {tabsList.map((tab) => {
        const isMatched = tab.value === currentTab;
        return isMatched && <Box key={tab.value}>{tab.component}</Box>;
      })}
    </>
  );
}

// ----------------------------------------------------------------------

HeaderBreadcrumb.propTypes = { label: PropTypes.string, inativos: PropTypes.bool, setInativos: PropTypes.func };

function HeaderBreadcrumb({ label, inativos, setInativos }) {
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();

  return (
    <HeaderBreadcrumbs
      sx={{ px: 1 }}
      heading={label}
      action={
        label !== 'Minutas públicas' && (
          <Stack direction="row" alignItems="center" spacing={1}>
            {label === 'Minutas' && <EstadoMinuta />}
            {label !== 'Créditos' && (
              <FormControlLabel
                sx={{ pr: 2 }}
                label="Inativos"
                control={<Switch checked={inativos} onChange={(event) => setInativos(event.target.checked)} />}
              />
            )}
            {label === 'Créditos' && (
              <>
                <DefaultAction button label="Carregar proposta" handleClick={() => dispatch(openModal('view'))} />
                {open && <InfoCaixa onCancel={() => onClose()} />}
              </>
            )}
            {label === 'Intervenientes - Entidades' && (
              <>
                <DefaultAction
                  button
                  label="Caixa"
                  handleClick={() => {
                    onOpen();
                    dispatch(getFromGaji9('infoCaixa'));
                  }}
                />
                {open && <InfoCaixa onCancel={() => onClose()} />}
              </>
            )}
            {label !== 'Intervenientes - Entidades' && (
              <DefaultAction button label="Adicionar" handleClick={() => dispatch(openModal('add'))} />
            )}
            {label === 'Acessos - Grupos' && (
              <DefaultAction label="ADMIN" handleClick={() => dispatch(getFromGaji9('admin'))} />
            )}
          </Stack>
        )
      }
    />
  );
}

// ----------------------------------------------------------------------

function EstadoMinuta() {
  const dispatch = useDispatch();
  const { estadoMinutas } = useSelector((state) => state.gaji9);

  return (
    <Autocomplete
      fullWidth
      size="small"
      disableClearable
      value={estadoMinutas || null}
      sx={{ minWidth: { md: 150 } }}
      options={['Em análise', 'Em vigor', 'Revogado']}
      renderInput={(params) => <TextField {...params} label="Estado" />}
      onChange={(event, newValue) => {
        localStorage.setItem('estadoMinutas', newValue);
        dispatch(getSuccess({ item: 'estadoMinutas', dados: newValue }));
      }}
    />
  );
}
