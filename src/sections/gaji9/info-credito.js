import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// @mui
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';
// utils
import { noDados } from '../../utils/formatText';
import { ptDate, ptDateTime } from '../../utils/formatTime';
import { actionAcessoGaji9 } from '../../utils/validarAcesso';
import { fCurrency, fPercent } from '../../utils/formatNumber';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { getDocumento, getFromGaji9, deleteItem, setModal } from '../../redux/slices/gaji9';
// Components
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { CellChecked, Criado } from '../../components/Panel';
import { DialogConfirmar } from '../../components/CustomDialog';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import DetalhesGaji9 from './DetalhesGaji9';
import { applySortFilter } from './applySortFilter';
import { Resgisto } from '../parametrizacao/Detalhes';
import { IntervenienteForm, DataContrato } from './form-credito';

// ----------------------------------------------------------------------

export default function InfoCredito() {
  const { credito } = useSelector((state) => state.gaji9);

  const sections = [
    {
      title: 'Informações do Cliente',
      content: [
        { label: 'Nº de cliente', value: credito?.cliente },
        { label: 'Conta DO crédito', value: credito?.conta_do },
        { label: 'Conta DO débito', value: credito?.conta_do_renda },
        {
          label: 'Tipo de titular',
          value: `${credito?.tipo_titular}${credito?.consumidor ? ' (Consumidor)' : ''}`,
        },
        { label: 'Email', value: credito?.morada_eletronico_cliente },
        { label: 'Morada', value: credito?.morada_cliente },
        { label: 'Balcão domicílio', value: credito?.balcao_domicilio },
      ],
    },
    {
      title: 'Detalhes do Crédito',
      content: [
        { label: 'Componente', value: credito?.rotulo || credito?.componente },
        { label: 'Montante', value: fCurrency(credito?.montante) },
        {
          label: 'Prémio do seguro',
          value: credito?.valor_premio_seguro ? fCurrency(credito?.valor_premio_seguro) : '',
        },
        { label: 'Nº de prestações', value: credito?.numero_prestacao },
        { label: 'Valor da prestação', value: fCurrency(credito?.valor_prestacao) },
        { label: 'Valor prestação sem desconto', value: fCurrency(credito?.valor_prestacao_sem_desconto) },
        { label: 'Vencimento da 1ª prestação', value: ptDate(credito?.data_vencimento_prestacao1) },
        { label: 'Prazo contratual', value: credito?.prazo_contratual },
        { label: 'Meses vencimento', value: credito?.meses_vencimento },
        { label: 'Finalidade', value: credito?.finalidade },
      ],
    },
    {
      title: 'Taxas e Custos',
      content: [
        { label: 'Taxa juro negociada', color: 'success', value: fPercent(credito?.taxa_juro_negociado) },
        { label: 'Taxa juro precário', color: '', value: fPercent(credito?.taxa_juro_precario) },
        { label: 'Taxa juro desconto', color: 'info', value: fPercent(credito?.taxa_Juro_desconto) },
        { label: 'Taxa TAEG', value: fPercent(credito?.taxa_taeg) },
        { label: 'Taxa comissão de abertura', value: fPercent(credito?.taxa_comissao_abertura) },
        { label: 'Isento de comissão', value: credito?.isento_comissao ? 'Sim' : 'Não' },
        { label: 'Valor total de comissões', value: fCurrency(credito?.valor_comissao) },
        { label: 'Valor total de imposto selo', value: fCurrency(credito?.valor_imposto_selo) },
        { label: 'Valor total de juros', value: fCurrency(credito?.valor_juro) },
        { label: 'Custo total TAEG', value: fCurrency(credito?.custo_total) },
      ],
    },
    {
      title: 'Informações do Processo',
      content: [
        {
          label: 'Ativo',
          value: <Label color={credito?.ativo ? 'success' : 'default'}>{credito?.ativo ? 'Sim' : 'Não'}</Label>,
        },
        { label: 'Versão', value: credito?.versao },
        { label: 'Nº de proposta', value: credito?.numero_proposta },
        { label: 'Aplicação de origem', value: credito?.aplicacao_origem },
        { label: 'ID do processo origem', value: credito?.processo_origem_id || '' },
      ],
    },
  ];

  return (
    <Stack spacing={3} useFlexGap flexWrap="wrap" direction="row" alignItems="stretch">
      {sections.map((section, index) => (
        <Card
          key={index}
          sx={{
            maxWidth: '100%',
            flex: { xs: '1 1 calc(100% - 16px)', md: '1 1 calc(50% - 16px)', xl: '1 1 calc(33.333% - 16px)' },
          }}
        >
          <CardHeader title={section.title} sx={{ color: 'primary.main' }} />
          <CardContent sx={{ pt: 1 }}>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1}>
              {section.content.map((item, idx) => (
                <Stack
                  key={idx}
                  useFlexGap
                  direction="row"
                  flexWrap="wrap"
                  alignItems="center"
                  sx={{ color: !item.value && 'text.disabled' }}
                >
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {item.label}:&nbsp;
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: !item.value && 'italic' }}>
                    {item.value || '(Não definido)'}
                  </Typography>
                </Stack>
              ))}
              {section.title === 'Informações do Processo' && (
                <List>
                  <ListItem disableGutters divider sx={{ pb: 0.5 }}>
                    <Typography variant="subtitle1">Registo</Typography>
                  </ListItem>
                  <Stack useFlexGap flexWrap="wrap" direction="row" sx={{ pt: 1 }} spacing={2}>
                    <Resgisto label="Criado" por={credito?.criado_por} em={credito?.criado_em} />
                    <Resgisto label="Modificado" em={credito?.modificado_em} por={credito?.modificado_por} />
                  </Stack>
                </List>
              )}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

// ----------------------------------------------------------------------

TableInfoCredito.propTypes = { params: PropTypes.object, dados: PropTypes.array };

export function TableInfoCredito({ params, dados = [] }) {
  const { contratado = false, id, tab } = params;
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
  } = useTable({});

  const dispatch = useDispatch();
  const [filter, setFilter] = useState(localStorage.getItem(`${tab}_form`) || '');
  const { isSaving, isLoading, modalGaji9, selectedItem, utilizador, contratos } = useSelector((state) => state.gaji9);

  useEffect(() => {
    if (tab === 'contratos' && actionAcessoGaji9(utilizador, ['READ_CONTRATO']))
      dispatch(getFromGaji9('contratos', { id }));
  }, [dispatch, utilizador, tab, id]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const dataFiltered = applySortFilter({
    filter,
    comparator: getComparator(order, orderBy),
    dados: tab === 'contratos' ? contratos : dados,
  });
  const isNotFound = !dataFiltered.length;

  const openModal = (item, dados) => {
    dispatch(setModal({ item, dados }));
  };

  const downloadContrato = (codigo) => {
    dispatch(getDocumento('contrato', { codigo, titulo: `CONTRATO: ${codigo}` }));
  };

  return (
    <>
      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple item={`${tab}_form`} filter={filter} setFilter={setFilter} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={headerTable(tab)} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable row={10} column={6} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(
                    (row, index) =>
                      (tab === 'contratos' && (
                        <TableRow hover key={`contratos_${index}`}>
                          <TableCell>{row?.codigo}</TableCell>
                          <TableCell>
                            {row?.minuta}
                            {row?.subtitulo ? ` - ${row?.subtitulo}` : ''}
                          </TableCell>
                          <TableCell>{row?.representante}</TableCell>
                          <TableCell align="center">{row?.versao}</TableCell>
                          <CellChecked check={row.ativo} />
                          <TableCell align="center" width={10}>
                            <Stack direction="row" spacing={0.75}>
                              <DefaultAction small label="DOWNLOAD" onClick={() => downloadContrato(row?.codigo)} />
                              {actionAcessoGaji9(utilizador, ['CREATE_CONTRATO']) && (
                                <DefaultAction small label="EDITAR" onClick={() => openModal('data-contrato', row)} />
                              )}
                              <DefaultAction small label="DETALHES" onClick={() => openModal('view-contrato', row)} />
                            </Stack>
                          </TableCell>
                        </TableRow>
                      )) ||
                      (tab === 'garantias' && (
                        <TableRow hover key={`garantia_${index}`}>
                          <TableCell>{row?.tipo}</TableCell>
                          <TableCell>{row?.valor ? fCurrency(row?.valor) : noDados}</TableCell>
                          <TableCell>{row?.nota || noDados('--')}</TableCell>
                          <CellChecked check={row.ativo} />
                          <TableCell width={10}>
                            <Criado caption tipo="user" value={row?.feito_por} />
                            <Criado caption tipo="data" value={ptDateTime(row?.ultima_modificacao)} />
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow hover key={`interveniente_${index}`}>
                          <TableCell align="right">{row?.numero_ordem}</TableCell>
                          <TableCell>{row?.numero_entidade}</TableCell>
                          <TableCell>{row?.nome}</TableCell>
                          <TableCell>
                            {row?.designacao}
                            {(row?.fiador && ' (FIADOR)') || (row?.avalista && ' (AVALISTA)') || ''}
                            {row?.entidade_representada_nome ? ` - ${row?.entidade_representada_nome}` : ''}
                          </TableCell>
                          <TableCell align="center" width={10}>
                            {!contratado && !row.mutuario && actionAcessoGaji9(utilizador, ['CREATE_CREDITO']) && (
                              <DefaultAction
                                small
                                label="ELIMINAR"
                                onClick={() => openModal('eliminar-interveniente', row)}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      )
                  )
                )}
              </TableBody>
              {!isLoading && isNotFound && <TableSearchNotFound message="Nenhum registo disponível..." />}
            </Table>
          </TableContainer>
        </Scrollbar>

        {!isNotFound && dataFiltered.length > 10 && (
          <TablePaginationAlt
            page={page}
            dense={dense}
            rowsPerPage={rowsPerPage}
            onChangePage={onChangePage}
            count={dataFiltered.length}
            onChangeDense={onChangeDense}
            onChangeRowsPerPage={onChangeRowsPerPage}
          />
        )}
      </Card>

      {modalGaji9 === 'form-interveniente' && (
        <IntervenienteForm
          id={id}
          onCancel={() => openModal('', null)}
          dados={dados?.filter(({ mutuario, fiador }) => mutuario || fiador)}
        />
      )}
      {modalGaji9 === 'data-contrato' && <DataContrato creditoId={id} onCancel={() => openModal('', null)} />}
      {modalGaji9 === 'view-contrato' && <DetalhesGaji9 closeModal={() => openModal('', null)} item="contrato" />}

      {modalGaji9 === 'eliminar-interveniente' && (
        <DialogConfirmar
          isSaving={isSaving}
          desc="eliminar este interveniente"
          onClose={() => openModal('', null)}
          handleOk={() =>
            dispatch(
              deleteItem('intervenientes', {
                id,
                getItem: 'credito',
                msg: 'Interveniente eliminado',
                numero: selectedItem?.participante_id,
                afterSuccess: () => openModal('', null),
              })
            )
          }
        />
      )}
    </>
  );
}

function headerTable(tab) {
  return [
    ...((tab === 'contratos' && [
      { id: 'codigo', label: 'Código' },
      { id: 'minuta', label: 'Minuta' },
      { id: 'representante', label: 'Representante' },
      { id: 'versao', label: 'Versão', align: 'center', width: 10 },
      { id: 'ativo', label: 'Ativo', align: 'center' },
      { id: '', width: 10 },
    ]) ||
      (tab === 'garantias' && [
        { id: 'tipo', label: 'Garantia' },
        { id: 'valor', label: 'Valor' },
        { id: 'nota', label: 'Nota' },
        { id: 'ativo', label: 'Ativo', align: 'center' },
        { id: '', label: 'Registo' },
      ]) || [
        { id: 'numero_ordem', label: 'Ordem', align: 'right', width: 10 },
        { id: 'numero_entidade', label: 'Nº entidade' },
        { id: 'nome', label: 'Nome' },
        { id: 'designacao', label: 'Designação' },
        { id: '', width: 10 },
      ]),
  ];
}
