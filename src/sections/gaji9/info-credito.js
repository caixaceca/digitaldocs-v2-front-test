import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fNumber } from '../../utils/formatNumber';
import { ptDateTime, ptDate } from '../../utils/formatTime';
import { acessoGaji9, gestaoContrato } from '../../utils/validarAcesso';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { getDocumento, getFromGaji9, deleteItem, setModal } from '../../redux/slices/gaji9';
// Components
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import { CellChecked } from '../../components/Panel';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { DialogConfirmar } from '../../components/CustomDialog';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import DetalhesGaji9 from './DetalhesGaji9';
import { applySortFilter } from './applySortFilter';
import { FiadoresForm, DataContrato } from './form-credito';

// ----------------------------------------------------------------------

export default function InfoCredito() {
  const { credito, tiposGarantias } = useSelector((state) => state.gaji9);

  const sections = [
    {
      title: 'Informações do Cliente',
      content: [
        { label: 'Balcão domicílio', value: credito?.balcao_domicilio },
        { label: 'Nº de cliente', value: credito?.cliente },
        { label: 'Conta DO', value: credito?.conta_do },
        {
          label: 'Tipo de titular',
          value: `${credito?.tipo_titular}${credito?.consumidor ? ' (Consumidor)' : ''}`,
        },
        { label: 'Email', value: credito?.morada_eletronico_cliente },
        { label: 'Morada', value: credito?.morada_cliente },
      ],
    },
    {
      title: 'Detalhes do Crédito',
      content: [
        { label: 'Componente', value: credito?.rotulo || credito?.componente },
        { label: 'Nº de proposta', value: credito?.numero_proposta },
        { label: 'Montante', value: `${fNumber(credito?.montante)} ${credito?.moeda}` },
        { label: 'Finalidade', value: credito?.finalidade },
        { label: 'Prazo contratual', value: credito?.prazo_contratual },
        { label: 'Meses vencimento', value: credito?.meses_vencimento },
        { label: 'Prémio do seguro', value: `${fNumber(credito?.valor_premio_seguro)} ${credito?.moeda}` },
        {
          label: 'Garantias',
          value:
            credito?.garantias?.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {credito?.garantias.map((garantia, idx) => (
                  <Chip
                    size="small"
                    key={`garantia_${idx}`}
                    label={
                      tiposGarantias?.find((row) => row?.id === garantia?.tipo_garantia_id)?.designacao ||
                      garantia?.tipo_garantia_id
                    }
                  />
                ))}
              </Box>
            ) : (
              ''
            ),
        },
      ],
    },
    {
      title: 'Taxas e Custos',
      visual: {
        type: 'chip',
        items: [
          { label: 'Taxa de juro negociada', color: 'success', value: `${credito?.taxa_juro_negociado}%` },
          { label: 'Taxa de juro precário', color: '', value: `${credito?.taxa_juro_precario}%` },
          { label: 'Taxa de juro desconto', color: 'info', value: `${credito?.taxa_Juro_desconto}%` },
        ],
      },
      content: [
        { label: 'TAEG', value: `${credito?.taxa_taeg}%` },
        { label: 'Isento de comissão', value: credito?.isento_comissao ? 'Sim' : 'Não' },
        { label: 'Comissão', value: `${fNumber(credito?.valor_comissao)} ${credito?.moeda}` },
        { label: 'Comissão de abertura', value: `${fNumber(credito?.comissao_abertura)} ${credito?.moeda}` },
        { label: 'Imposto de selo', value: `${fNumber(credito?.valor_imposto_selo)} ${credito?.moeda}` },
        { label: 'Valor do juro', value: `${fNumber(credito?.valor_juro)} ${credito?.moeda}` },
        { label: 'Custo total', value: `${fNumber(credito?.custo_total)} ${credito?.moeda}` },
      ],
    },
    {
      title: 'Prestações',
      content: [
        { label: 'Nº de prestações', value: credito?.numero_prestacao },
        { label: 'Valor da prestação', value: `${fNumber(credito?.valor_prestacao)} ${credito?.moeda}` },
        { label: 'Valor 1ª prestação', value: `${fNumber(credito?.valor_prestacao1)} ${credito?.moeda}` },
        { label: 'Vencimento da 1ª prestação', value: ptDate(credito?.data_vencimento_prestacao1) },
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
        { label: 'ID do processo', value: credito?.processo_origem_id || '!-!' },
        { label: 'Aplicação de origem', value: credito?.aplicacao_origem },
        { label: 'Criado em', value: ptDateTime(credito?.criado_em) },
        { label: 'Criado por', value: credito?.criado_por },
        { label: 'Modificado em', value: credito?.modificado_em ? ptDateTime(credito?.modificado_em) : '!-!' },
        { label: 'Modificado por', value: credito?.modificado_por || '!-!' },
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
            flex: { xs: '1 1 calc(100% - 16px)', sm: '1 1 calc(50% - 16px)', lg: '1 1 calc(33.333% - 16px)' },
          }}
        >
          <CardHeader title={section.title} titleTypographyProps={{ variant: 'subtitle1', color: 'primary.main' }} />
          <CardContent sx={{ pt: 1.5 }}>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1}>
              {section.visual && section.visual.type === 'chip' && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {section.visual.items.map((chip, idx) => (
                    <Chip
                      size="small"
                      variant="outlined"
                      color={chip.color}
                      sx={{ fontWeight: 'bold' }}
                      key={`${section.visual.type}_${idx}`}
                      label={`${chip.label}: ${chip.value}`}
                    />
                  ))}
                </Box>
              )}
              {section.content.map((item, idx) =>
                item.value === '!-!' ? (
                  ''
                ) : (
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
                      {item.value || 'Não definido'}
                    </Typography>
                  </Stack>
                )
              )}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

// ----------------------------------------------------------------------

TableInfoCredito.propTypes = { id: PropTypes.number, dados: PropTypes.array, contracts: PropTypes.bool };

export function TableInfoCredito({ id, dados = [], contracts = false }) {
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
    if (id && contracts && (gestaoContrato(utilizador?._role) || acessoGaji9(utilizador?.acessos, ['READ_CONTRATO'])))
      dispatch(getFromGaji9('contratos', { id }));
  }, [dispatch, utilizador, contracts, id]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const dataFiltered = applySortFilter({
    filter,
    dados: contracts ? contratos : dados,
    comparator: getComparator(order, orderBy),
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
              <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={headerTable(contracts)} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable row={10} column={6} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) =>
                    contracts ? (
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
                              <DefaultAction label="EDITAR" handleClick={() => openModal('form-participante', row)} />
                            )}
                            <DefaultAction
                              label="DOWNLOAD"
                              handleClick={() =>
                                dispatch(
                                  getDocumento('contrato', { codigo: row?.codigo, titulo: `CONTRATO: ${row?.codigo}` })
                                )
                              }
                            />
                            <DefaultAction label="DETALHES" handleClick={() => openModal('view-participante', row)} />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow hover key={`participante_${index}`}>
                        <TableCell>{row?.numero_entidade}</TableCell>
                        <TableCell>{row?.nome}</TableCell>
                        <TableCell>{row?.designacao}</TableCell>
                        <TableCell align="right">{row?.numero_ordem}</TableCell>
                        <TableCell>{(row?.fiador && 'FIADOR') || (row?.avalista && 'AVALISTA') || ''}</TableCell>
                        <TableCell align="center" width={10}>
                          {!row.mutuario &&
                            (gestaoContrato(utilizador?._role) ||
                              acessoGaji9(utilizador?.acessos, ['CREATE_CREDITO'])) && (
                              <DefaultAction
                                small
                                label="ELIMINAR"
                                handleClick={() => openModal('eliminar-participante', row)}
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

      {modalGaji9 === 'form-participante' && <FiadoresForm id={id} onCancel={() => openModal('', null)} />}
      {modalGaji9 === 'data-contrato' && <DataContrato creditoId={id} onCancel={() => openModal('', null)} />}
      {modalGaji9 === 'view-contrato' && <DetalhesGaji9 closeModal={() => openModal('', null)} item="contrato" />}

      {modalGaji9 === 'eliminar-participante' && (
        <DialogConfirmar
          isSaving={isSaving}
          desc="eliminar este participante"
          onClose={() => openModal('', null)}
          handleOk={() =>
            dispatch(
              deleteItem('intervenientes', {
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

function headerTable(contracts) {
  return [
    ...((contracts === 'tiposGarantias' && [
      { id: 'codigo', label: 'Código' },
      { id: 'minuta', label: 'Minuta' },
      { id: 'representante', label: 'Representante' },
      { id: 'versao', label: 'Versão', align: 'center', width: 10 },
      { id: 'ativo', label: 'Ativo', align: 'center' },
    ]) || [
      { id: 'numero_entidade', label: 'Nº entidade' },
      { id: 'nome', label: 'Nome' },
      { id: 'designacao', label: 'Designação' },
      { id: 'numero_ordem', label: 'Ordem', align: 'right', width: 10 },
      { id: '', label: 'Responsabilidade' },
    ]),
    { id: '', width: 10 },
  ];
}
