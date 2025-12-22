import { useState, useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Switch from '@mui/material/Switch';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import FormControlLabel from '@mui/material/FormControlLabel';
// utils
import { normalizeText } from '../../../utils/formatText';
import useTable, { getComparator, applySort } from '../../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../../redux/store';
import { getInSuporte, updateInSuporte, setModal } from '../../../redux/slices/suporte-cliente';
// Components
import Scrollbar from '../../../components/Scrollbar';
import { DefaultAction } from '../../../components/Actions';
import { SkeletonTable } from '../../../components/skeleton';
import { SearchToolbarSimple } from '../../../components/SearchToolbar';
import { CellChecked, Colaborador, newLineText, noDados } from '../../../components/Panel';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../../components/table';
//
import {
  FaqForm,
  SlaForm,
  SlaUoForm,
  AssuntoForm,
  RespostaForm,
  UtilizadorForm,
  DepartamentoForm,
} from './form-configuracoes';
import Categorias from './categorias';
import DetalhesPrompt from './detalhes';
import FormPrompt, { Eliminar } from './form-prompt';
import { getApllyLabel, getRolesLabel, getPhasesLabel, getDepartTypeLabel, LabelApply } from '../utils';

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
  } = useTable();

  const { colaboradores } = useSelector((state) => state.intranet);
  const { assuntos, utilizadores, slas, slasUo, faq, departamentos, respostas, prompts, isLoading, modalSuporte } =
    useSelector((state) => state.suporte);

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
      (item === 'slasUo' && slasUo) ||
      (item === 'prompts' && prompts) ||
      (item === 'assuntos' && assuntos) ||
      (item === 'respostas' && respostas) ||
      (item === 'departamentos' && departamentos) ||
      (item === 'utilizadores' &&
        utilizadores?.map((row) => ({ ...colaboradores?.find(({ id }) => id === row?.employee_id), ...row }))) ||
      [],
  });
  const isNotFound = !dataFiltered.length;

  const onClose = () => dispatch(setModal({}));
  const viewItem = (modal, dados) => {
    const getdetail = item === 'prompts' && modal !== 'delete';
    dispatch(setModal({ modal, dados: getdetail ? null : dados, isEdit: modal === 'update' }));
    if (getdetail)
      dispatch(getInSuporte(modal === 'detalhes' ? 'prompt' : 'presets', { id: dados?.id, item: 'selectedItem' }));
  };

  const changeStatus = (dados) => {
    const params = { id: dados?.id, item, msg: `Item ${dados?.active ? 'desativado' : 'ativado'}` };
    dispatch(updateInSuporte(`toggle-${item}`, null, { ...params, patch: true, active: !dados?.active }));
  };

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
                  <SkeletonTable row={10} column={(item === 'prompts' && 3) || (item === 'faq' && 7) || 5} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${item}_${index}`}>
                      {item === 'faq' && <TableCell align="center">{row?.sequence}</TableCell>}
                      {item === 'faq' && <TableCell>{row?.category_name || noDados('(Não definido)')}</TableCell>}
                      <TableCell>
                        {item === 'utilizadores' ? (
                          <Colaborador row={{ colaborador: row }} />
                        ) : (
                          row?.subject || row?.name || row?.question || row?.preset_name || noDados()
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
                      {item === 'slasUo' && <TableCell>{row?.department_name}</TableCell>}
                      {item === 'slasUo' && <TableCell>{row?.subject_name}</TableCell>}
                      {item === 'slas' && <TableCell>{row?.response_time_mn} min</TableCell>}
                      {(item === 'slas' || item === 'slasUo') && <TableCell>{row?.resolution_time_mn} min</TableCell>}

                      {/* RESPOSTAS */}
                      {item === 'respostas' && <TableCell>{newLineText(row?.content)}</TableCell>}
                      {item === 'respostas' && <TableCell align="center">{getPhasesLabel(row?.phase)}</TableCell>}

                      {/* FAQ */}
                      {item === 'faq' && <TableCell>{newLineText(row?.response)}</TableCell>}
                      {item === 'faq' && <CellChecked check={row?.highlighted} />}

                      {(item === 'prompts' || item === 'utilizadores' || item === 'respostas' || item === 'faq') && (
                        <TableCell align="center">
                          <FormControlLabel
                            label={row?.active ? 'Ativo' : 'Inativo'}
                            control={<Switch size="small" checked={row?.active} onChange={() => changeStatus(row)} />}
                          />
                        </TableCell>
                      )}

                      <TableCell align="center" width={10}>
                        <Stack direction="row" spacing={0.75}>
                          <DefaultAction small label="EDITAR" onClick={() => viewItem('update', row)} />
                          {item === 'prompts' && !row?.active && (
                            <DefaultAction small label="ELIMINAR" onClick={() => viewItem('eliminar', row)} />
                          )}
                          {item === 'prompts' && row?.active && (
                            <DefaultAction small label="DETALHES" onClick={() => viewItem('detalhes', row)} />
                          )}
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

      {modalSuporte === 'categories' && <Categorias onClose={onClose} />}
      {modalSuporte === 'detalhes' && <DetalhesPrompt onClose={onClose} />}
      {modalSuporte === 'eliminar' && <Eliminar onClose={onClose} item={item} />}
      {(modalSuporte === 'add' || modalSuporte === 'update') && (
        <>
          {item === 'faq' && <FaqForm onClose={onClose} />}
          {item === 'slas' && <SlaForm onClose={onClose} />}
          {item === 'slasUo' && <SlaUoForm onClose={onClose} />}
          {item === 'prompts' && <FormPrompt onClose={onClose} />}
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
      ({ name, subject, subject_name: subject1, department_name: department, question, response, description }) =>
        (name && normalizeText(name).indexOf(normalizedFilter) !== -1) ||
        (subject && normalizeText(subject).indexOf(normalizedFilter) !== -1) ||
        (subject1 && normalizeText(subject1).indexOf(normalizedFilter) !== -1) ||
        (question && normalizeText(question).indexOf(normalizedFilter) !== -1) ||
        (response && normalizeText(response).indexOf(normalizedFilter) !== -1) ||
        (department && normalizeText(department).indexOf(normalizedFilter) !== -1) ||
        (description && normalizeText(description).indexOf(normalizedFilter) !== -1)
    );
  }

  return dados?.map((row) => ({ ...row, active: row?.active || row?.enabled }));
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
      (item === 'slasUo' && [
        { id: 'nome', label: 'Nome' },
        { id: 'department_name', label: 'Departamento' },
        { id: 'subject_name', label: 'Assunto' },
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
      (item === 'prompts' && [{ id: 'preset_name', label: 'Nome' }]) ||
      []),
    ...(item !== 'assuntos' && item !== 'departamentos' && item !== 'slas' && item !== 'slasUo'
      ? [{ id: 'active', label: 'Estado', align: 'center' }]
      : []),
    { id: '', width: 10 },
  ];
}
