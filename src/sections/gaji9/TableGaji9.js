import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import TableContainer from '@mui/material/TableContainer';
// utils
import { noDados } from '../../utils/formatText';
import { fCurrency } from '../../utils/formatNumber';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import useModal from '../../hooks/useModal';
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromGaji9, getSuccess, openModal, closeModal } from '../../redux/slices/gaji9';
// Components
import Scrollbar from '../../components/Scrollbar';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { CellChecked, ColaboradorInfo } from '../../components/Panel';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import {
  GrupoForm,
  FuncaoForm,
  RecursoForm,
  ProdutoForm,
  EntidadeForm,
  GarantiaForm,
  MarcadorForm,
  VariavelForm,
  SearchEntidade,
  TipoTitularForm,
  RepresentanteForm,
} from './form-gaji9';
import MinutaForm from './form-minuta';
import ClausulaForm from './form-clausula';
import DetalhesGaji9 from './DetalhesGaji9';
import CreditForm, { PropostaForm } from './form-credito';
import { applySortFilter, listaTitrulares, listaGarantias, listaProdutos } from './applySortFilter';

// ---------------------------------------------------------------------------------------------------------------------

TableGaji9.propTypes = { item: PropTypes.string, inativos: PropTypes.bool };

export default function TableGaji9({ item, inativos }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { handleCloseModal } = useModal(closeModal());
  const [filter, setFilter] = useState(localStorage.getItem(`filter${item}`) || '');

  const {
    page,
    order,
    dense,
    orderBy,
    setPage,
    rowsPerPage,
    //
    onSort,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable({ defaultOrderBy: 'designacao', defaultOrder: 'asc' });

  const {
    grupos,
    funcoes,
    minutas,
    recursos,
    entidades,
    clausulas,
    variaveis,
    isLoading,
    marcadores,
    isOpenView,
    isOpenModal,
    componentes,
    estadoMinutas,
    tiposTitulares,
    tiposGarantias,
    representantes,
    minutasPublicas,
  } = useSelector((state) => state.gaji9);
  const { colaboradores, uos } = useSelector((state) => state.intranet);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    if (item !== 'clausulas' && item !== 'minutas') {
      dispatch(getFromGaji9(item, { inativos }));
    }
  }, [dispatch, inativos, item]);

  useEffect(() => {
    if (item === 'minutas' && estadoMinutas) {
      dispatch(
        getFromGaji9(item, {
          inativos,
          emVigor: estadoMinutas === 'Em vigor',
          revogado: estadoMinutas === 'Revogado',
          emAnalise: estadoMinutas === 'Em análise',
        })
      );
    }
  }, [dispatch, item, inativos, estadoMinutas]);

  const dataFiltered = applySortFilter({
    filter,
    comparator: getComparator(order, orderBy),
    dados:
      (item === 'grupos' && grupos) ||
      (item === 'minutas' && minutas) ||
      (item === 'recursos' && recursos) ||
      (item === 'entidades' && entidades) ||
      (item === 'clausulas' && clausulas) ||
      (item === 'variaveis' && variaveis) ||
      (item === 'marcadores' && marcadores) ||
      (item === 'componentes' && componentes) ||
      (item === 'tiposTitulares' && tiposTitulares) ||
      (item === 'tiposGarantias' && tiposGarantias) ||
      (item === 'minutasPublicas' && minutasPublicas) ||
      ((item === 'funcoes' || item === 'representantes') &&
        (item === 'funcoes' ? funcoes : representantes)?.map((row) => ({
          ...row,
          uo: uos?.find((item) => item?.balcao === row?.balcao)?.label || '',
          colaborador: colaboradores?.find(
            (item) =>
              item?.perfil?.id_aad === row?.utilizador_id ||
              item?.perfil?.mail?.toLowerCase() === row?.utilizador_email?.toLowerCase()
          ),
        }))) ||
      [],
  });
  const isNotFound = !dataFiltered.length;

  const viewItem = (modal, dados) => {
    if (item === 'minutas' || item === 'minutasPublicas') {
      navigate(`${PATH_DIGITALDOCS.gaji9.root}/minuta/${dados?.id}`);
    } else {
      const itemSingle =
        (item === 'grupos' && 'grupo') ||
        (item === 'funcoes' && 'funcao') ||
        (item === 'recursos' && 'recurso') ||
        (item === 'entidades' && 'entidade') ||
        (item === 'variaveis' && 'variavel') ||
        (item === 'clausulas' && 'clausula') ||
        (item === 'marcadores' && 'marcador') ||
        (item === 'componentes' && 'componente') ||
        (item === 'tiposTitulares' && 'tipoTitular') ||
        (item === 'tiposGarantias' && 'tipoGarantia') ||
        (item === 'representantes' && 'representante');
      dispatch(openModal(modal));
      if (item === 'componentes') {
        dispatch(getSuccess({ item: 'selectedItem', dados }));
      } else {
        dispatch(getFromGaji9(itemSingle, { id: dados?.id, item: 'selectedItem' }));
      }
    }
  };

  return (
    <>
      {item === 'entidades' && <SearchEntidade />}
      {item === 'clausulas' && <FiltrarClausulas inativos={inativos} />}

      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple item={`filter${item}`} filter={filter} setFilter={setFilter} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={headerTable(item)} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable
                    row={10}
                    column={
                      ((item === 'funcoes' ||
                        item === 'variaveis' ||
                        item === 'marcadores' ||
                        item === 'tiposTitulares' ||
                        item === 'representantes') &&
                        4) ||
                      (item === 'creditos' && 6) ||
                      (item === 'componentes' && 5) ||
                      ((item === 'minutas' ||
                        item === 'entidades' ||
                        item === 'clausulas' ||
                        item === 'minutasPublicas') &&
                        7) ||
                      3
                    }
                  />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${item}_${index}`}>
                      <TableCell>
                        {item === 'funcoes' || item === 'representantes' ? (
                          <ColaboradorInfo
                            labelAltCaption
                            id={row?.colaborador?.id}
                            labelAlt={row?.utilizador_id}
                            foto={row?.colaborador?.foto_disk}
                            caption={!row?.colaborador?.uo?.label}
                            nome={row?.colaborador?.nome || row?.utilizador_email || row?.nome}
                            label={row?.colaborador?.uo?.desegnicao || 'Perfil sem ID_AAD na Intranet'}
                          />
                        ) : (
                          <>
                            {(item === 'componentes' && row?.codigo) ||
                              (item === 'tiposGarantias' && row?.designacao) ||
                              row?.nome ||
                              row?.titulo ||
                              row?.prefixo ||
                              row?.descritivo ||
                              row?.designacao ||
                              noDados()}
                          </>
                        )}
                      </TableCell>
                      {(item === 'clausulas' && (
                        <>
                          <TableCell>
                            {row?.tipo_titular || noDados()}
                            {row?.consumidor ? ' (Consumidor)' : ''}
                          </TableCell>
                          <TableCell>{row?.tipo_garantia || noDados()}</TableCell>
                          <TableCell>{row?.componente || noDados()}</TableCell>
                          <TableCell>
                            {(row?.solta && 'Solta') ||
                              (row?.seccao_identificacao && 'Secção de identificação') ||
                              (row?.seccao_identificacao_caixa && 'Secção de identificação Caixa') ||
                              noDados()}
                          </TableCell>
                        </>
                      )) ||
                        (item === 'variaveis' && <TableCell>{row?.descritivo}</TableCell>) ||
                        (item === 'componentes' && (
                          <>
                            <TableCell>{row?.descritivo}</TableCell>
                            <TableCell>{row?.rotulo || noDados('(Não definido)')}</TableCell>
                          </>
                        )) ||
                        (item === 'representantes' && (
                          <TableCell>
                            {row?.uo} ({row?.balcao})
                          </TableCell>
                        )) ||
                        (item === 'tiposTitulares' && <CellChecked check={row.consumidor} />) ||
                        (item === 'marcadores' && <TableCell>{row?.sufixo}</TableCell>) ||
                        (item === 'funcoes' && <TableCell>{row?._role}</TableCell>) ||
                        ((item === 'minutas' || item === 'minutasPublicas') && (
                          <>
                            <TableCell>{row?.subtitulo}</TableCell>
                            <TableCell>
                              {row?.tipo_titular}
                              {row?.consumidor ? ' (Consumidor)' : ''}
                            </TableCell>
                            <TableCell>{row?.componente}</TableCell>
                            <TableCell align="center">{row?.versao}</TableCell>
                          </>
                        )) ||
                        (item === 'entidades' && (
                          <>
                            <TableCell align="right">{row?.numero}</TableCell>
                            <TableCell align="center">{row?.tipo}</TableCell>
                            <TableCell>{row?.documento}</TableCell>
                            <TableCell align="center">{row?.nif || noDados('(Não definido)')}</TableCell>
                          </>
                        )) ||
                        (item === 'creditos' && (
                          <>
                            <TableCell>{row?.cliente || noDados('(Não definido)')}</TableCell>
                            <TableCell align="right">{row?.numero_proposta || noDados('(Não definido)')}</TableCell>
                            <TableCell>{row?.componente || noDados('(Não definido)')}</TableCell>
                            <TableCell align="center">
                              {row?.montante ? fCurrency(row?.montante) : noDados('(Não definido)')}
                            </TableCell>
                          </>
                        ))}
                      <CellChecked check={row.ativo} />
                      <TableCell align="center" width={10}>
                        <Stack direction="row" spacing={0.5} justifyContent="right">
                          {item !== 'minutas' && item !== 'minutasPublicas' && (
                            <DefaultAction label="EDITAR" color="warning" handleClick={() => viewItem('update', row)} />
                          )}
                          <DefaultAction label="DETALHES" handleClick={() => viewItem('view', row)} />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>

              {!isLoading && isNotFound && (
                <TableSearchNotFound message="Não foi encontrado nenhum registo disponível..." />
              )}
            </Table>
          </TableContainer>
        </Scrollbar>

        {!isNotFound && dataFiltered.length > 10 && (
          <TablePaginationAlt
            page={page}
            dense={dense}
            rowsPerPage={rowsPerPage}
            count={dataFiltered.length}
            onChangePage={onChangePage}
            onChangeDense={onChangeDense}
            onChangeRowsPerPage={onChangeRowsPerPage}
          />
        )}
      </Card>

      {isOpenView && item === 'creditos' && <PropostaForm onCancel={handleCloseModal} />}
      {isOpenView && item !== 'creditos' && <DetalhesGaji9 closeModal={handleCloseModal} item={item} />}

      {isOpenModal && (
        <>
          {item === 'grupos' && <GrupoForm onCancel={handleCloseModal} />}
          {item === 'funcoes' && <FuncaoForm onCancel={handleCloseModal} />}
          {item === 'creditos' && <CreditForm onCancel={handleCloseModal} />}
          {item === 'recursos' && <RecursoForm onCancel={handleCloseModal} />}
          {item === 'entidades' && <EntidadeForm onCancel={handleCloseModal} />}
          {item === 'clausulas' && <ClausulaForm onCancel={handleCloseModal} />}
          {item === 'variaveis' && <VariavelForm onCancel={handleCloseModal} />}
          {item === 'componentes' && <ProdutoForm onCancel={handleCloseModal} />}
          {item === 'marcadores' && <MarcadorForm onCancel={handleCloseModal} />}
          {item === 'tiposGarantias' && <GarantiaForm onCancel={handleCloseModal} />}
          {item === 'tiposTitulares' && <TipoTitularForm onCancel={handleCloseModal} />}
          {item === 'representantes' && <RepresentanteForm onCancel={handleCloseModal} />}
          {item === 'minutas' && <MinutaForm onCancel={handleCloseModal} action="Adicionar" />}
        </>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

FiltrarClausulas.propTypes = { inativos: PropTypes.bool };

function FiltrarClausulas({ inativos }) {
  const dispatch = useDispatch();
  const { componentes, tiposTitulares, tiposGarantias } = useSelector((state) => state.gaji9);

  const componentesList = useMemo(() => listaProdutos(componentes), [componentes]);
  const garantiasList = useMemo(() => listaGarantias(tiposGarantias), [tiposGarantias]);
  const titularesList = useMemo(() => listaTitrulares(tiposTitulares), [tiposTitulares]);
  const seccoesList = [
    { id: 'solta', label: 'Solta' },
    { id: 'identificacao', label: 'Secção de identificação' },
    { id: 'caixa', label: 'Secção de identificação Caixa' },
  ];

  const getStoredValue = (key, list) =>
    list?.find((row) => Number(row?.id) === Number(localStorage.getItem(key))) || null;

  const [seccao, setSeccao] = useState(() => getStoredValue('clSeccao', seccoesList));
  const [titular, setTitular] = useState(() => getStoredValue('titularCl', titularesList));
  const [garantia, setGarantia] = useState(() => getStoredValue('garantiaCl', garantiasList));
  const [componente, setComponente] = useState(() => getStoredValue('componenteCl', componentesList));

  // Atualiza os filtros quando qualquer valor relevante mudar
  useEffect(() => {
    dispatch(
      getFromGaji9('clausulas', {
        inativos,
        titularId: titular?.id || null,
        solta: seccao?.label === 'Solta',
        garantiaId: garantia?.id || null,
        componenteId: componente?.id || null,
        caixa: seccao?.label === 'Secção de identificação',
        identificacao: seccao?.label === 'Secção de identificação Caixa',
      })
    );
  }, [dispatch, inativos, titular, garantia, seccao, componente]);

  return (
    <Card sx={{ p: 1, mb: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={1} sx={{ width: 1 }}>
          <SelectItem label="Secção" value={seccao} setItem={setSeccao} options={seccoesList} />
          <SelectItem label="Tipo de titular" value={titular} setItem={setTitular} options={titularesList} />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={1} sx={{ width: 1 }}>
          <SelectItem label="Componente" value={componente} setItem={setComponente} options={componentesList} />
          <SelectItem label="Tipo de garantia" value={garantia} setItem={setGarantia} options={garantiasList} />
        </Stack>
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

SelectItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.object,
  setItem: PropTypes.func,
  options: PropTypes.array,
};

function SelectItem({ label, value, setItem, options }) {
  const item =
    (label === 'Secção' && 'clSeccao') ||
    (label === 'Componente' && 'componenteCl') ||
    (label === 'Tipo de titular' && 'titularCl') ||
    (label === 'Tipo de garantia' && 'garantiaCl') ||
    '';
  return (
    <Autocomplete
      fullWidth
      value={value}
      options={options}
      getOptionLabel={(option) => option?.label}
      isOptionEqualToValue={(option, val) => option?.id === val?.id}
      onChange={(_, newValue) => {
        setItem(newValue);
        if (item) localStorage.setItem(item, newValue?.id || '');
      }}
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function dadosComColaborador(dados, colaboradores) {
  return dados?.map((row) => ({
    ...row,
    nome: colaboradores?.find((item) => item?.perfil_id === row?.perfil_id)?.perfil?.displayName || row?.perfil_id,
  }));
}

function headerTable(item) {
  return [
    ...((item === 'tiposTitulares' && [{ id: 'descritivo', label: 'Descritivo' }]) ||
      ((item === 'tiposGarantias' || item === 'grupos') && [{ id: 'designacao', label: 'Designação' }]) ||
      (item === 'clausulas' && [
        { id: 'titulo', label: 'Título' },
        { id: 'tipo_titular', label: 'Tipo titular' },
        { id: 'tipo_garantia', label: 'Tipo garantia' },
        { id: 'componente', label: 'Produto' },
        { id: '', label: 'Secção' },
      ]) ||
      (item === 'representantes' && [{ id: 'nome', label: 'Nome' }]) ||
      ((item === 'variaveis' || item === 'recursos') && [
        { id: 'nome', label: 'Nome' },
        { id: 'descritivo', label: 'Descritivo' },
      ]) ||
      (item === 'marcadores' && [
        { id: 'prefixo', label: 'Prefixo' },
        { id: 'sufixo', label: 'Sufixo' },
      ]) ||
      (item === 'funcoes' && [
        { id: 'utilizador_email', label: 'Colaborador' },
        { id: '_role', label: 'Função' },
      ]) ||
      ((item === 'minutas' || item === 'minutasPublicas') && [
        { id: 'titulo', label: 'Título' },
        { id: 'subtitulo', label: 'Subtiulo' },
        { id: 'tipo_titular', label: 'Tipo titular' },
        { id: 'componente', label: 'Componente' },
        { id: 'versão', label: 'Versão', align: 'center' },
      ]) ||
      (item === 'entidades' && [
        { id: 'nome', label: 'Nome' },
        { id: 'numero', label: 'Nº', align: 'right' },
        { id: 'tipo', label: 'Tipo', align: 'center' },
        { id: 'docuemento', label: 'Doc. ident.' },
        { id: 'nif', label: 'NIF', align: 'center' },
      ]) ||
      (item === 'creditos' && [
        { id: 'cliente', label: 'Cliente' },
        { id: 'numero_proposta', label: 'Nº proposta', align: 'right' },
        { id: 'componente', label: 'Componente' },
        { id: 'montante', label: 'Montante', align: 'right' },
      ]) ||
      []),
    ...(item === 'representantes' ? [{ id: 'uo', label: 'U.O' }] : []),
    ...(item === 'componentes'
      ? [
          { id: 'codigo', label: 'Código' },
          { id: 'descritivo', label: 'Descritivo' },
          { id: 'rotulo', label: 'Rótulo' },
        ]
      : []),
    ...(item === 'tiposTitulares' ? [{ id: 'consumidor', label: 'Consumidor', align: 'center' }] : []),
    { id: 'ativo', label: 'Ativo', align: 'center' },
    { id: '', width: 10 },
  ];
}
