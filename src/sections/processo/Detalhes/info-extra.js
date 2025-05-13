import { useState } from 'react';
import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import ListItem from '@mui/material/ListItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
// utils
import { ptDate } from '../../../utils/formatTime';
import { colorLabel } from '../../../utils/getColorPresets';
import { newLineText, noDados } from '../../../utils/formatText';
import { fNumber, fCurrency, fPercent } from '../../../utils/formatNumber';
// hooks
import { deleteItem } from '../../../redux/slices/digitaldocs';
import { useSelector, useDispatch } from '../../../redux/store';
// components
import Label from '../../../components/Label';
import { TextItem } from './DetalhesProcesso';
import { CellChecked } from '../../../components/Panel';
import { DefaultAction } from '../../../components/Actions';
import { SearchNotFoundSmall } from '../../../components/table';
import { TabsWrapperSimple } from '../../../components/TabsWrapper';
import { GarantiasSeparados } from '../form/credito/form-garantias-credito';
import { Resgisto, TableRowItem, LabelSN } from '../../parametrizacao/Detalhes';
import { DialogConfirmar, DialogTitleAlt } from '../../../components/CustomDialog';
import { FormSituacao, EliminarDadosSituacao } from '../form/credito/situacao-form';
// _mock
import { dis, estadosCivis } from '../../../_mock';

// ----------------------------------------------------------------------

InfoCredito.propTypes = { dados: PropTypes.object };

export function InfoCredito({ dados }) {
  const [currentTab, setCurrentTab] = useState('Dados');

  const tabsList = [
    { value: 'Dados', component: <DadosCredito dados={dados} /> },
    { value: 'Garantias', component: <Garantias dados={dados} /> },
  ];

  return (
    <Stack sx={{ p: { xs: 1, sm: 3 } }}>
      <TabsWrapperSimple
        sx={{ mb: 3 }}
        tabsList={tabsList}
        currentTab={currentTab}
        changeTab={(_, newValue) => setCurrentTab(newValue)}
      />
      <Box>{tabsList?.find((tab) => tab?.value === currentTab)?.component}</Box>
    </Stack>
  );
}

// ----------------------------------------------------------------------

DadosCredito.propTypes = { dados: PropTypes.object };

function DadosCredito({ dados }) {
  const [openSituacao, setOpenSituacao] = useState('');
  const situacao = dados?.situacao_final_mes || 'Em análise';

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 4 }}>
      <List sx={{ width: 1, pt: 0 }}>
        <ListItem disableGutters divider sx={{ pb: 0.5, pt: 0.75, mb: 0.5 }}>
          <Typography variant="subtitle1">Pedido</Typography>
        </ListItem>
        <TextItem title="Nº de proposta:" text={dados?.numero_proposta || 'Não definido'} />
        <TextItem title="Montante solicitado:" text={fCurrency(dados?.montante_solicitado)} />
        {situacao === 'Em análise' && (
          <>
            <TextItem title="Prazo de amortização:" text={`${dados?.prazo_amortizacao} meses`} />
            {dados?.taxa_juro && <TextItem title="Taxa de juro:" text={fPercent(dados?.taxa_juro)} />}
          </>
        )}
        <TextItem title="Finalidade:" text={dados?.finalidade} />
        <TextItem title="Componente:" text={dados?.componente || 'Não definido'} />
        <TextItem title="Linha de crédito:" text={dados?.linha} />
        <TextItem title="Tipo de titular:" text={dados?.tipo_titular || 'Não definido'} />
        <TextItem title="Segmento:" text={dados?.segmento} />
        <TextItem title="Ent. patronal/Set. atividade:" text={dados?.setor_atividade} />
        {dados?.valor_divida && (
          <Paper sx={{ p: 1, pb: 0.75, my: 0.5, bgcolor: 'background.neutral', flexGrow: 1 }}>
            <Label color="info" startIcon={<InfoOutlinedIcon />}>
              Entidade com crédito em dívida
            </Label>
            <TextItem title="Valor:" text={fCurrency(dados?.valor_divida * 1000)} />
            {dados?.periodo && <TextItem title="Data:" text={ptDate(dados?.periodo)} />}
          </Paper>
        )}
      </List>
      <List sx={{ width: 1, pt: 0 }}>
        <ListItem disableGutters divider sx={{ pb: 0.5, pt: 0, mb: 0.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle1">Situação</Typography>
              <Label color={colorLabel(situacao || 'Em análise')} sx={{ typography: 'subtitle1' }}>
                {situacao || 'Em análise'}
              </Label>
            </Stack>
            {dados?.modificar && (
              <Stack direction="row" alignItems="center" spacing={1}>
                {(situacao === 'Em análise' || situacao === 'Aprovado') && (
                  <DefaultAction button small label="EDITAR" onClick={() => setOpenSituacao('atualizar')} />
                )}
                {situacao !== 'Em análise' && (
                  <DefaultAction button small label="ELIMINAR" onClick={() => setOpenSituacao('eliminar')} />
                )}
              </Stack>
            )}
          </Stack>
        </ListItem>

        {dados?.montante_aprovado && <TextItem title="Montante aprovado:" text={fCurrency(dados?.montante_aprovado)} />}
        {dados?.data_aprovacao && <TextItem title="Data de aprovação:" text={ptDate(dados?.data_aprovacao)} />}
        {dados?.montante_contratado && (
          <TextItem title="Montante contratado:" text={fCurrency(dados?.montante_contratado)} />
        )}
        {dados?.data_contratacao && <TextItem title="Data de contratação:" text={ptDate(dados?.data_contratacao)} />}
        <TextItem title="Prazo de amortização:" text={`${dados?.prazo_amortizacao} meses`} />
        {dados?.taxa_juro && <TextItem title="Taxa de juro:" text={fPercent(dados?.taxa_juro)} />}
        <TextItem title="Garantia:" text={dados?.garantia} />
        <TextItem title="Decisor:" text={dados?.escalao_decisao} />
        {dados?.data_desistido && <TextItem title="Data de desistência:" text={ptDate(dados?.data_desistido)} />}
        {dados?.data_indeferido && <TextItem title="Data de indeferimento:" text={ptDate(dados?.data_indeferido)} />}
      </List>
      {openSituacao === 'atualizar' && <FormSituacao onCancel={() => setOpenSituacao('')} />}
      {openSituacao === 'eliminar' && <EliminarDadosSituacao onCancel={() => setOpenSituacao('')} />}
    </Stack>
  );
}

// ----------------------------------------------------------------------

Garantias.propTypes = { id: PropTypes.string, dados: PropTypes.array };

function Garantias({ dados }) {
  const dispatch = useDispatch();
  const [item, setItem] = useState(null);
  const { id, processoId, garantias = [], modificar } = dados;
  const { isSaving } = useSelector((state) => state.digitaldocs);

  const eliminarGarantia = () => {
    const ids = { processoId, id: item?.id, creditoId: id };
    dispatch(deleteItem('garantias', { ...ids, msg: 'Garantia eliminada', onClose: () => setItem(null) }));
  };

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Garantia</TableCell>
            <TableCell align="right">Valor</TableCell>
            <TableCell align="right">Entidade</TableCell>
            <TableCell>Titular</TableCell>
            <TableCell>Conta DP</TableCell>
            <TableCell align="center">Ativo</TableCell>
            <TableCell width={10}>
              {modificar && <DefaultAction small button label="Adicionar" onClick={() => setItem({ isEdit: false })} />}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {garantias?.map((row, index) => (
            <TableRow hover key={`${row?.id}_${id}_${index}`}>
              <TableCell>{row?.tipo_garantia || noDados('(Não definido)')}</TableCell>
              <TableCell align="right">
                {row?.valor_garantia
                  ? `${fNumber(row?.valor_garantia)} ${row?.moeda ?? ''}`
                  : noDados('(Não definido)')}
              </TableCell>
              <TableCell align="right">{row?.numero_entidade || noDados('(Não definido)')}</TableCell>
              <TableCell>{row?.titular || noDados('(Não definido)')}</TableCell>
              <TableCell>{row?.conta_dp || noDados('(Não definido)')}</TableCell>
              <CellChecked check={row?.ativo} />

              <TableCell>
                <Stack direction="row" spacing={0.5} justifyContent="right">
                  {modificar && (
                    <>
                      <DefaultAction small label="ELIMINAR" onClick={() => setItem({ modal: 'eliminar', ...row })} />
                      <DefaultAction small label="EDITAR" onClick={() => setItem({ isEdit: true, garantia: row })} />
                    </>
                  )}
                  <DefaultAction small label="DETALHES" onClick={() => setItem({ modal: 'detail', ...row })} />
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          {(!garantias || garantias?.length === 0) && (
            <TableRow>
              <TableCell colSpan={7}>
                <SearchNotFoundSmall message="Nenhuma garantia adicionada..." />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {(item?.modal === 'detail' && <DetalhesGarantia dados={item} closeModal={() => setItem(null)} />) ||
        (item?.modal === 'eliminar' && (
          <DialogConfirmar
            isSaving={isSaving}
            onClose={() => setItem(null)}
            desc="eliminar esta garantia"
            handleOk={() => eliminarGarantia()}
          />
        )) ||
        (!!item && (
          <GarantiasSeparados dados={{ ...item, creditoId: id, processoId, onCancel: () => setItem(null) }} />
        ))}
    </>
  );
}

// ----------------------------------------------------------------------

DetalhesGarantia.propTypes = { dados: PropTypes.object, closeModal: PropTypes.func };

export function DetalhesGarantia({ dados, closeModal }) {
  return (
    <Dialog open onClose={closeModal} fullWidth maxWidth="sm">
      <DialogTitleAlt title="Detalhes" onClose={closeModal} />
      <DialogContent>
        <List sx={{ width: 1 }}>
          <Table size="small">
            <TableBody>
              <TableRowItem title="Garantia:" text={dados?.tipo_garantia} />
              <TableRowItem
                title="Valor:"
                text={dados?.valor_garantia ? `${fNumber(dados?.valor_garantia)}${dados?.moeda ?? ''}` : ''}
              />
              <TableRowItem title="Nº entidade:" text={dados?.numero_entidade} />
              <TableRowItem title="Titular:" text={dados?.titular} />
              <TableRowItem title="Conta DP:" text={dados?.conta_dp} />
              <TableRowItem title="Hipoteca câmera:" text={dados?.codigo_hipoteca_camara} />
              <TableRowItem title="Hipoteca cartório:" text={dados?.codigo_hipoteca_cartorio} />
              <TableRowItem title="Pessoal:" item={<LabelSN item={dados?.pessoal} />} />
              <TableRowItem title="Avalista:" item={<LabelSN item={dados?.avalista} />} />
              <TableRowItem title="Fiador:" item={<LabelSN item={dados?.fiador} />} />
            </TableBody>
          </Table>
          <ListItem disableGutters divider sx={{ pb: 0.5 }}>
            <Typography variant="subtitle1">Registo</Typography>
          </ListItem>
          <Stack useFlexGap flexWrap="wrap" direction="row" sx={{ pt: 1 }} spacing={2}>
            <Resgisto label="Criado" em={dados?.criado_em} por={dados?.criador} />
            <Resgisto label="Modificado" em={dados?.modificado_em} por={dados?.modificador} />
          </Stack>
        </List>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

InfoCon.propTypes = { dados: PropTypes.object };

export function InfoCon({ dados }) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 4 }} sx={{ p: { xs: 1, sm: 3 } }}>
      <List sx={{ width: 1, pt: 0 }}>
        <ListItem disableGutters divider sx={{ pb: 0.5, pt: 0, mb: 0.5 }}>
          <Typography variant="subtitle1">Operação</Typography>
        </ListItem>
        <TextItem title="Nº da operação:" text={dados?.numero} />
        {dados?.valor && <TextItem title="Valor:" text={fCurrency(dados?.valor)} />}
        {dados?.origem_fundo && <TextItem title="Origem do fundo:" text={newLineText(dados?.origem_fundo)} />}
        {dados?.finalidade && <TextItem title="Finalidade do fundo:" text={newLineText(dados?.finalidade)} />}
        <TextItem title="Depositante é o próprio titular:" text={dados?.titular_ordenador ? 'SIM' : 'NÃO'} />
        <TextItem title="Beneficiária residente:" text={dados?.residente ? 'SIM' : 'NÃO'} />
      </List>
      <List sx={{ width: 1, pt: 0 }}>
        <ListItem disableGutters divider sx={{ pb: 0.5, pt: 0, mb: 0.5 }}>
          <Typography variant="subtitle1">Dados do ordenante</Typography>
        </ListItem>
        <TextItem title="Nome:" text={dados?.ordenador} />
        <TextItem title="NIF:" text={dados?.nif} />
        <TextItem
          title="Doc. identificação:"
          text={`${dados?.docid}${dados?.tipo_docid ? ` (${dis?.find(({ id }) => id === dados?.tipo_docid)?.label || dados?.tipo_docid})` : ''}`}
        />
        <TextItem
          title="Filiação:"
          text={`${dados?.pai ?? ''}${dados?.pai && dados?.mae ? ' e ' : ''}${dados?.mae ?? ''}`}
        />
        <TextItem
          title="Estado civil:"
          text={estadosCivis?.find(({ id }) => id === dados?.estado_civil)?.label || dados?.estado_civil}
        />
        {dados?.data_nascimento && <TextItem title="Data nascimento:" text={ptDate(dados?.data_nascimento)} />}
        <TextItem title="Nacionalidade:" text={dados?.nacionalidade} />
        <TextItem title="Local/País de nascimento:" text={dados?.local_pais_nascimento} />
        <TextItem title="Morada:" text={dados?.morada} />
        <TextItem title="Profissão:" text={dados?.profissao} />
        <TextItem title="Local de trabalho:" text={dados?.local_trabalho} />
        <TextItem title="Telefone:" text={dados?.telefone} />
        <TextItem title="Telemóvel:" text={dados?.telemovel} />
        <TextItem title="Email(s):" text={dados?.emails} />
      </List>
    </Stack>
  );
}
