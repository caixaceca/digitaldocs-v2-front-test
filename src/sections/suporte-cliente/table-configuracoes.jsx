import { useState, useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// utils
import { normalizeText } from '../../utils/formatText';
import useTable, { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getInSuporte, setModal } from '../../redux/slices/suporte-cliente';
// Components
import Scrollbar from '../../components/Scrollbar';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { CellChecked, Colaborador, newLineText, noDados } from '../../components/Panel';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import Categorias from './categorias';
import { getApllyLabel, getRolesLabel, getPhasesLabel, getDepartTypeLabel, LabelApply } from './utils';
import { FaqForm, SlaForm, AssuntoForm, UtilizadorForm, RespostaForm, DepartamentoForm } from './form-configuracoes';

// ---------------------------------------------------------------------------------------------------------------------

export default function TableConfiguracoes({ item }) {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState('');

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

  const { colaboradores } = useSelector((state) => state.intranet);
  const { assuntos, utilizadores, slas, faq, departamentos, respostas, isLoading, modalSuporte } = useSelector(
    (state) => state.suporte
  );

  useEffect(() => {
    setFilter(localStorage.getItem(`filter${item}`) || '');
  }, [item]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, filter]);

  useEffect(() => {
    dispatch(getInSuporte(item));
    if (item === 'faq') dispatch(getInSuporte('categorias'));
  }, [dispatch, item]);

  const dataFiltered = applySortFilter({
    filter,
    comparator: getComparator(order, orderBy),
    dados:
      (item === 'faq' && faq) ||
      (item === 'slas' && slas) ||
      (item === 'assuntos' && assuntos) ||
      (item === 'respostas' && respostas) ||
      (item === 'departamentos' && departamentos) ||
      (item === 'utilizadores' &&
        utilizadores?.map((row) => ({ ...row, ...colaboradores?.find(({ id }) => id === row?.employee_id) }))) ||
      [],
  });
  const isNotFound = !dataFiltered.length;

  const viewItem = (modal, dados) => {
    // const itemSingle =
    //   (item === 'faq' && 'pergunta') || (item === 'asuntos' && 'asunto') || (item === 'utilizadores' && 'utilizador');

    dispatch(setModal({ modal, dados, isEdit: modal === 'update' }));
    // const id = item === 'funcoes' ? dados?.utilizador_id : dados?.id;
    // dispatch(getInSuporte(itemSingle, { id, item: 'selectedItem' }));
  };

  const onClose = () => dispatch(setModal({}));

  return (
    <>
      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple item={`filter${item}`} filter={filter} setFilter={setFilter} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={headerTable(item)} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable row={10} column={(item === 'faq' && 7) || 5} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${item}_${index}`}>
                      {item === 'faq' && <TableCell align="center">{row?.sequence}</TableCell>}
                      {item === 'faq' && <TableCell>{row?.category_name || noDados('(Não definido)')}</TableCell>}
                      <TableCell>
                        {item === 'utilizadores' ? (
                          <Colaborador row={{ colaborador: row }} />
                        ) : (
                          <>{row?.subject || row?.name || row?.question || noDados()}</>
                        )}
                      </TableCell>

                      {/* ASSUNTO */}
                      {item === 'assuntos' && <TableCell>{row?.department_name}</TableCell>}
                      {item === 'assuntos' && <TableCell>{row?.sla_name}</TableCell>}
                      {item === 'assuntos' && (
                        <TableCell align="center">
                          <LabelApply label={getApllyLabel(row?.applicability)} />
                        </TableCell>
                      )}

                      {/* UTILIZADOR */}
                      {item === 'utilizadores' && (
                        <TableCell>{row?.department_name || noDados('(Não definido)')}</TableCell>
                      )}
                      {item === 'utilizadores' && <TableCell>{getRolesLabel(row?.role)}</TableCell>}

                      {/* DEPARTAMENTOS */}
                      {item === 'departamentos' && (
                        <TableCell>{row?.abreviation || noDados('(Não definido)')}</TableCell>
                      )}
                      {item === 'departamentos' && (
                        <TableCell align="center">{getDepartTypeLabel(row?.type)}</TableCell>
                      )}

                      {/* SLA */}
                      {item === 'slas' && <TableCell>{newLineText(row?.description)}</TableCell>}
                      {item === 'slas' && <TableCell>{row?.response_time_mn} min</TableCell>}
                      {item === 'slas' && <TableCell>{row?.resolution_time_mn} min</TableCell>}

                      {/* RESPOSTAS */}
                      {item === 'respostas' && <TableCell>{newLineText(row?.content)}</TableCell>}
                      {item === 'respostas' && <TableCell align="center">{getPhasesLabel(row?.phase)}</TableCell>}

                      {/* FAQ */}
                      {item === 'faq' && <TableCell>{newLineText(row?.response)}</TableCell>}
                      {item === 'faq' && <CellChecked check={row?.highlighted} />}

                      {item !== 'assuntos' && item !== 'slas' && <CellChecked check={row?.active || row?.enabled} />}

                      <TableCell align="center" width={10}>
                        <Stack direction="row" spacing={0.5} justifyContent="right">
                          <DefaultAction small label="EDITAR" onClick={() => viewItem('update', row)} />
                          {/* <DefaultAction small label="DETALHES" onClick={() => viewItem('detalhes', row)} /> */}
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

      {/* {modalSuporte === 'detalhes' && <DetalhesGaji9 closeModal={onClose} item={item} />} */}
      {modalSuporte === 'categories' && <Categorias onClose={onClose} />}
      {(modalSuporte === 'add' || modalSuporte === 'update') && (
        <>
          {item === 'faq' && <FaqForm onClose={onClose} />}
          {item === 'slas' && <SlaForm onClose={onClose} />}
          {item === 'assuntos' && <AssuntoForm onClose={onClose} />}
          {item === 'respostas' && <RespostaForm onClose={onClose} />}
          {item === 'utilizadores' && <UtilizadorForm onClose={onClose} />}
          {item === 'departamentos' && <DepartamentoForm onClose={onClose} />}
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function applySortFilter({ dados, filter, comparator }) {
  dados = applySort(dados, comparator);

  if (filter) {
    const normalizedFilter = normalizeText(filter);
    dados = dados.filter(
      ({ name, subject, question, response, description }) =>
        (name && normalizeText(name).indexOf(normalizedFilter) !== -1) ||
        (subject && normalizeText(subject).indexOf(normalizedFilter) !== -1) ||
        (question && normalizeText(question).indexOf(normalizedFilter) !== -1) ||
        (response && normalizeText(response).indexOf(normalizedFilter) !== -1) ||
        (description && normalizeText(description).indexOf(normalizedFilter) !== -1)
    );
  }

  return dados;
}

// ---------------------------------------------------------------------------------------------------------------------

function headerTable(item) {
  return [
    ...((item === 'assuntos' && [
      { id: 'subject', label: 'Assunto' },
      { id: 'department_name', label: 'Departamento' },
      { id: 'sla_name', label: 'SLA' },
      { id: 'applicability', label: 'Aplicabilidade', align: 'center' },
    ]) ||
      (item === 'utilizadores' && [
        { id: 'nome', label: 'Colaborador' },
        { id: 'department', label: 'Departamento' },
        { id: 'role', label: 'Função' },
      ]) ||
      (item === 'departamentos' && [
        { id: 'name', label: 'Nome' },
        { id: 'abreviation', label: 'Abreviação' },
        { id: 'type', label: 'Tipo', align: 'center' },
      ]) ||
      (item === 'slas' && [
        { id: 'nome', label: 'Nome' },
        { id: 'descricao', label: 'Descrição' },
        { id: 'tempo_resposta', label: 'Resposta' },
        { id: 'tempo_resolucao', label: 'Resolução' },
      ]) ||
      (item === 'respostas' && [
        { id: 'subject', label: 'Assunto' },
        { id: 'content', label: 'Conteúdo' },
        { id: 'phase', label: 'Fase', align: 'center' },
      ]) ||
      (item === 'faq' && [
        { id: 'sequuence', label: 'Ordem', align: 'center', width: 10 },
        { id: 'category', label: 'Categoria' },
        { id: 'question', label: 'Questão' },
        { id: 'response', label: 'Resposta' },
        { id: 'highlighted', label: 'Destaque', align: 'center' },
      ]) ||
      []),
    ...(item !== 'assuntos' && item !== 'slas' ? [{ id: 'active', label: 'Ativo', align: 'center' }] : []),
    { id: '', width: 10 },
  ];
}
