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
import { ptDate, ptDateTime } from '../../utils/formatTime';
import { noDados } from '../../utils/formatText';
import { fCurrency, fPercent } from '../../utils/formatNumber';
import { acessoGaji9, gestaoContrato } from '../../utils/validarAcesso';
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
import { FiadoresForm, DataContrato } from './form-credito';

// ----------------------------------------------------------------------

export default function InfoCredito() {
  const { credito } = useSelector((state) => state.gaji9);

  const sections = [
    {
      title: 'Informações do Cliente',
      content: [
        { label: 'Nº de cliente', value: credito?.cliente },
        { label: 'Conta DO', value: credito?.conta_do },
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
        { label: 'Valor 1ª prestação', value: fCurrency(credito?.valor_prestacao1) },
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
        { label: 'Taxa imposto de selo', value: fPercent(credito?.taxa_imposto_selo) },
        { label: 'Taxa comissão de abertura', value: fPercent(credito?.taxa_comissao_abertura) },
        { label: 'Isento de comissão', value: credito?.isento_comissao ? 'Sim' : 'Não' },
        { label: 'Valor comissão', value: fCurrency(credito?.valor_comissao) },
        { label: 'Valor imposto de selo', value: fCurrency(credito?.valor_imposto_selo) },
        { label: 'Valor do juro', value: fCurrency(credito?.valor_juro) },
        { label: 'Custo total', value: fCurrency(credito?.custo_total) },
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

TableInfoCredito.propTypes = { id: PropTypes.number, dados: PropTypes.array, tab: PropTypes.string };

export function TableInfoCredito({ id, dados = [], tab }) {
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
  const [filter, setFilter] = useState(localStorage.getItem('filterParticipante') || '');
  const { isSaving, isLoading, modalGaji9, selectedItem, utilizador, contratos } = useSelector((state) => state.gaji9);

  useEffect(() => {
    if (
      tab === 'contratos' &&
      (gestaoContrato(utilizador?._role) || acessoGaji9(utilizador?.acessos, ['READ_CONTRATO']))
    )
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

  return (
    <>
      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple item="filterParticipante" filter={filter} setFilter={setFilter} />
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
                        <TableRow hover key={`participante_${index}`}>
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
                              {(gestaoContrato(utilizador?._role) ||
                                acessoGaji9(utilizador?.acessos, ['CREATE_CONTRATO'])) && (
                                <DefaultAction label="EDITAR" onClick={() => openModal('form-participante', row)} />
                              )}
                              <DefaultAction
                                label="DOWNLOAD"
                                onClick={() =>
                                  dispatch(
                                    getDocumento('contrato', {
                                      codigo: row?.codigo,
                                      titulo: `CONTRATO: ${row?.codigo}`,
                                    })
                                  )
                                }
                              />
                              <DefaultAction label="DETALHES" onClick={() => openModal('view-participante', row)} />
                            </Stack>
                          </TableCell>
                        </TableRow>
                      )) ||
                      (tab === 'garantias' && (
                        <TableRow hover key={`participante_${index}`}>
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
                        <TableRow hover key={`participante_${index}`}>
                          <TableCell align="right">{row?.numero_ordem}</TableCell>
                          <TableCell>{row?.numero_entidade}</TableCell>
                          <TableCell>{row?.nome}</TableCell>
                          <TableCell>
                            {row?.designacao}
                            {(row?.fiador && ' (FIADOR)') || (row?.avalista && ' (AVALISTA)') || ''}
                            {row?.entidade_representada_nome ? ` - ${row?.entidade_representada_nome}` : ''}
                          </TableCell>
                          <TableCell align="center" width={10}>
                            {!row.mutuario &&
                              (gestaoContrato(utilizador?._role) ||
                                acessoGaji9(utilizador?.acessos, ['CREATE_CREDITO'])) && (
                                <DefaultAction
                                  small
                                  label="ELIMINAR"
                                  onClick={() => openModal('eliminar-participante', row)}
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

      {modalGaji9 === 'form-participante' && (
        <FiadoresForm dados={dados?.filter(({ mutuario }) => mutuario)} id={id} onCancel={() => openModal('', null)} />
      )}
      {modalGaji9 === 'data-contrato' && <DataContrato creditoId={id} onCancel={() => openModal('', null)} />}
      {modalGaji9 === 'view-contrato' && <DetalhesGaji9 closeModal={() => openModal('', null)} item="contrato" />}

      {modalGaji9 === 'eliminar-participante' && (
        <DialogConfirmar
          isSaving={isSaving}
          desc="eliminar este participante"
          onClose={() => openModal('', null)}
          handleOk={() =>
            dispatch(
              deleteItem('participantes', {
                id,
                getItem: 'credito',
                numero: selectedItem?.participante_id,
                afterSuccess: () => openModal('', null),
                msg: 'Participante do crédito eliminado',
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
