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
// hooks
import useToggle from '../../hooks/useToggle';
import { usePermissao } from '../../hooks/useAcesso';
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
import TableCredito from './credito/table-creditos';
import TableParamsGaji9 from './table-parametrizacao';
import TableClausula from './clausulas/table-clausula';
import TableIdentificadores from './table-identificadores';

// ---------------------------------------------------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------------------------------------------------

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
    if (!currentTab || !tabsList?.map(({ value }) => value)?.includes(currentTab)) {
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
      <Box>{tabsList?.find(({ value }) => value === currentTab)?.component}</Box>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Identificadores({ inativos, setInativos }) {
  const { temPermissao } = usePermissao();
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('gaji9Identificadores') || 'Produtos');

  const tabsList = useMemo(
    () => [
      ...(temPermissao(['READ_PRODUTO/COMPONENTE'])
        ? [{ value: 'Produtos', component: <TableIdentificadores item="componentes" inativos={inativos} /> }]
        : []),
      ...(temPermissao(['READ_SEGMENTO'])
        ? [{ value: 'Segmentos', component: <TableIdentificadores item="segmentos" inativos={inativos} /> }]
        : []),
      ...(temPermissao(['READ_TIPO TITULAR'])
        ? [
            { value: 'Titulares', component: <TableIdentificadores item="tiposTitulares" inativos={inativos} /> },
            { value: 'Imóveis', component: <TableIdentificadores item="tiposImoveis" inativos={inativos} /> },
            { value: 'Finalidades', component: <TableIdentificadores item="finalidades" inativos={inativos} /> },
          ]
        : []),
      ...(temPermissao(['READ_TIPO GARANTIA'])
        ? [{ value: 'Garantias', component: <TableIdentificadores item="tiposGarantias" inativos={inativos} /> }]
        : []),
      ...(temPermissao(['READ_TIPO GARANTIA'])
        ? [{ value: 'Seguros', component: <TableIdentificadores item="tiposSeguros" inativos={inativos} /> }]
        : []),
      ...(temPermissao(['READ_REPRESENTANTE'])
        ? [{ value: 'Representantes', component: <TableIdentificadores item="representantes" inativos={inativos} /> }]
        : []),
      ...(temPermissao(['READ_DIVISAO ADMINISTRATIVA'])
        ? [{ value: 'Freguesias', component: <TableIdentificadores item="freguesias" inativos={inativos} /> }]
        : []),
    ],
    [inativos, temPermissao]
  );

  useEffect(() => {
    if (!currentTab || !tabsList?.map(({ value }) => value)?.includes(currentTab))
      setItemValue(tabsList?.[0]?.value, setCurrentTab, 'gaji9Identificadores', false);
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
      <Box>{tabsList?.find(({ value }) => value === currentTab)?.component}</Box>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Actions({ inativos, setInativos, label = '' }) {
  const dispatch = useDispatch();
  const { temPermissao, isAdmin } = usePermissao();

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
        label !== 'Minutas' &&
        label !== 'Cláusulas' &&
        (isAdmin ||
          // (label === 'Minutas' && temPermissao(['CREATE_MINUTA'])) ||
          (label === 'Produtos' && temPermissao(['CREATE_PRODUTO/COMPONENTE'])) ||
          (label === 'Representantes' && temPermissao(['CREATE_REPRESENTANTE'])) ||
          (label === 'Freguesias' && temPermissao(['CREATE_DIVISAO ADMINISTRATIVA'])) ||
          ((label === 'Titulares' || label === 'Imóveis' || label === 'Finalidades') &&
            temPermissao(['CREATE_TIPO TITULAR'])) ||
          ((label === 'Garantias' || label === 'Seguros') && temPermissao(['CREATE_TIPO GARANTIA']))) && (
          <DefaultAction button label="Adicionar" onClick={() => dispatch(openModal('add'))} />
        )}
      {label === 'Cláusulas' && temPermissao(['CREATE_CLAUSULA']) && (
        <>
          <DefaultAction button label="Prév. minuta" onClick={() => dispatch(setModal({ item: 'preview-minuta' }))} />
          <DefaultAction button label="Adicionar" onClick={() => dispatch(setModal({ item: 'form-clausula' }))} />
        </>
      )}
      {label === 'Representantes' && temPermissao(['READ_INSTITUICAO']) && <ButtonInfoCaixa />}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

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
      {open && <InfoCaixa onClose={() => onClose()} />}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

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
