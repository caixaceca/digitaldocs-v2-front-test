import PropTypes from 'prop-types';
import { useState, useEffect, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import FormControlLabel from '@mui/material/FormControlLabel';
// utils
import { setItemValue } from '../../utils/formatObject';
import { acessoGaji9 } from '../../utils/validarAcesso';
// hooks
import useToggle from '../../hooks/useToggle';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { openModal, setModal, getSuccess, getFromGaji9 } from '../../redux/slices/gaji9';
// Components
import { DefaultAction } from '../../components/Actions';
import { TabsWrapperSimple } from '../../components/TabsWrapper';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
//
import InfoCaixa from './dados-caixa';
import TableMinutas from './table-minutas';
import TableCredito from './table-creditos';
import TableClausula from './table-clausula';
import TableParamsGaji9 from './table-parametrizacao';
import TableIdentificadores from './table-identificadores';

// ----------------------------------------------------------------------

TabGaji9.propTypes = { item: PropTypes.string, label: PropTypes.string };

export default function TabGaji9({ item, label }) {
  const [inativos, setInativos] = useState(false);
  return (
    (item === 'parametrizacao' && <Parametrizacao inativos={inativos} setInativos={setInativos} />) ||
    (item === 'identificadores' && <Identificadores inativos={inativos} setInativos={setInativos} />) || (
      <>
        <HeaderBreadcrumbs
          sx={{ px: 1 }}
          heading={label}
          action={<Actions inativos={inativos} setInativos={setInativos} label={label} />}
        />
        {(item === 'clausulas' && <TableClausula inativos={inativos} />) ||
          (item === 'creditos' && <TableCredito />) || <TableMinutas item={item} inativos={inativos} />}
      </>
    )
  );
}

// ----------------------------------------------------------------------

Parametrizacao.propTypes = { inativos: PropTypes.bool, setInativos: PropTypes.func };

function Parametrizacao({ inativos, setInativos }) {
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('gaji9Parametrizacao') || 'Utilizadores');

  const tabsList = useMemo(
    () => [
      { value: 'Utilizadores', component: <TableParamsGaji9 item="funcoes" inativos={inativos} /> },
      { value: 'Grupos', component: <TableParamsGaji9 item="grupos" inativos={inativos} /> },
      { value: 'Recursos', component: <TableParamsGaji9 item="recursos" inativos={inativos} /> },
      { value: 'Variáveis', component: <TableParamsGaji9 item="variaveis" inativos={inativos} /> },
      { value: 'Marcadores', component: <TableParamsGaji9 item="marcadores" inativos={inativos} /> },
    ],
    [inativos]
  );

  useEffect(() => {
    if (!currentTab || !tabsList?.map((row) => row?.value)?.includes(currentTab)) {
      setItemValue(tabsList?.[0]?.value, setCurrentTab, 'gaji9Parametrizacao', false);
    }
  }, [tabsList, currentTab]);

  return (
    <>
      <HeaderBreadcrumbs
        sx={{ px: 1 }}
        heading={`Parametrização - ${currentTab}`}
        action={<Actions inativos={inativos} setInativos={setInativos} />}
      />
      <TabsWrapperSimple
        tabsList={tabsList}
        currentTab={currentTab}
        changeTab={(event, newValue) => setItemValue(newValue, setCurrentTab, 'gaji9Parametrizacao', false)}
      />
      <Box>{tabsList?.find((tab) => tab?.value === currentTab)?.component}</Box>
    </>
  );
}

// ----------------------------------------------------------------------

Identificadores.propTypes = { inativos: PropTypes.bool, setInativos: PropTypes.func };

function Identificadores({ inativos, setInativos }) {
  const { adminGaji9, utilizador } = useSelector((state) => state.gaji9);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('gaji9Identificadores') || 'Produtos');

  const tabsList = useMemo(
    () => [
      ...(adminGaji9 || acessoGaji9(utilizador?.acessos, ['READ_PRODUTO/COMPONENTE'])
        ? [{ value: 'Produtos', component: <TableIdentificadores item="componentes" inativos={inativos} /> }]
        : []),
      ...(adminGaji9 || acessoGaji9(utilizador?.acessos, ['READ_TIPO TITULAR'])
        ? [{ value: 'Tipos de titular', component: <TableIdentificadores item="tiposTitulares" inativos={inativos} /> }]
        : []),
      ...(adminGaji9 || acessoGaji9(utilizador?.acessos, ['READ_TIPO GARANTIA'])
        ? [
            {
              value: 'Tipos de garantia',
              component: <TableIdentificadores item="tiposGarantias" inativos={inativos} />,
            },
          ]
        : []),
      ...(adminGaji9 || acessoGaji9(utilizador?.acessos, ['READ_REPRESENTANTE'])
        ? [{ value: 'Representantes', component: <TableIdentificadores item="representantes" inativos={inativos} /> }]
        : []),
      ...(adminGaji9 || acessoGaji9(utilizador?.acessos, ['READ_DIVISAO ADMINISTRATIVA'])
        ? [{ value: 'Freguesias', component: <TableIdentificadores item="freguesias" inativos={inativos} /> }]
        : []),
    ],
    [inativos, adminGaji9, utilizador?.acessos]
  );

  useEffect(() => {
    if (!currentTab || !tabsList?.map((row) => row?.value)?.includes(currentTab)) {
      setItemValue(tabsList?.[0]?.value, setCurrentTab, 'gaji9Identificadores', false);
    }
  }, [tabsList, currentTab]);

  return (
    <>
      <HeaderBreadcrumbs
        sx={{ px: 1 }}
        heading={`Identificadores - ${currentTab}`}
        action={<Actions inativos={inativos} setInativos={setInativos} label={currentTab} />}
      />
      <TabsWrapperSimple
        tabsList={tabsList}
        currentTab={currentTab}
        changeTab={(event, newValue) => setItemValue(newValue, setCurrentTab, 'gaji9Identificadores', false)}
      />
      <Box>{tabsList?.find((tab) => tab?.value === currentTab)?.component}</Box>
    </>
  );
}

// ----------------------------------------------------------------------

Actions.propTypes = { label: PropTypes.string, inativos: PropTypes.bool, setInativos: PropTypes.func };

function Actions({ inativos, setInativos, label = '' }) {
  const dispatch = useDispatch();
  const { adminGaji9, utilizador } = useSelector((state) => state.gaji9);

  return (
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
        <DefaultAction button label="Carregar proposta" onClick={() => dispatch(setModal({ item: 'form-proposta' }))} />
      )}
      {label !== 'Créditos' &&
        label !== 'Cláusulas' &&
        label !== 'Minutas públicas' &&
        (adminGaji9 ||
          (label === 'Minutas' && acessoGaji9(utilizador?.acessos, ['CREATE_MINUTA'])) ||
          (label === 'Produtos' && acessoGaji9(utilizador?.acessos, ['CREATE_PRODUTO/COMPONENTE'])) ||
          (label === 'Representantes' && acessoGaji9(utilizador?.acessos, ['CREATE_REPRESENTANTE'])) ||
          (label === 'Tipos de titular' && acessoGaji9(utilizador?.acessos, ['CREATE_TIPO TITULAR'])) ||
          (label === 'Tipos de garantia' && acessoGaji9(utilizador?.acessos, ['CREATE_TIPO GARANTIA'])) ||
          (label === 'Freguesias' && acessoGaji9(utilizador?.acessos, ['CREATE_DIVISAO ADMINISTRATIVA']))) && (
          <DefaultAction button label="Adicionar" onClick={() => dispatch(openModal('add'))} />
        )}
      {label === 'Cláusulas' && (adminGaji9 || acessoGaji9(utilizador?.acessos, ['CREATE_CLAUSULA'])) && (
        <DefaultAction button label="Adicionar" onClick={() => dispatch(setModal({ item: 'form-clausula' }))} />
      )}
      {label === 'Representantes' && (adminGaji9 || acessoGaji9(utilizador?.acessos, ['READ_INSTITUICAO'])) && (
        <ButtonInfoCaixa />
      )}
    </Stack>
  );
}

// ----------------------------------------------------------------------

function ButtonInfoCaixa() {
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();

  return (
    <>
      <DefaultAction
        button
        label="Caixa"
        onClick={() => {
          onOpen();
          dispatch(getFromGaji9('infoCaixa'));
        }}
      />
      {open && <InfoCaixa onCancel={() => onClose()} />}
    </>
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
      sx={{ minWidth: { xs: 130, md: 150 } }}
      options={['Em análise', 'Em vigor', 'Revogado']}
      renderInput={(params) => <TextField {...params} label="Estado" />}
      onChange={(event, newValue) => {
        localStorage.setItem('estadoMinutas', newValue);
        dispatch(getSuccess({ item: 'estadoMinutas', dados: newValue }));
      }}
    />
  );
}
