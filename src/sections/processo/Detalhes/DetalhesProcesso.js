import PropTypes from 'prop-types';
// @mui
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
// utils
import { colorLabel } from '../../../utils/getColorPresets';
import { valorPorExtenso } from '../../../utils/numeroPorExtenso';
import { ptDate, fToNow, ptDateTime } from '../../../utils/formatTime';
import { fNumber, fCurrency, fPercent } from '../../../utils/formatNumber';
import { newLineText, entidadesParse, shuffleString } from '../../../utils/normalizeText';
// redux
import { useSelector } from '../../../redux/store';
// hooks
import useToggle from '../../../hooks/useToggle';
// components
import Label from '../../../components/Label';
import { Checked, Criado } from '../../../components/Panel';
import { DefaultAction, Fechar } from '../../../components/Actions';
//
import { colorProcesso } from '../../tabela/TableProcessos';
// _mock
import { dis, estadosCivis } from '../../../_mock';

// ----------------------------------------------------------------------

const itemStyle = { py: 0.75, px: 1, my: 0.5, borderRadius: 0.5, backgroundColor: 'background.neutral' };

// ----------------------------------------------------------------------

DetalhesProcesso.propTypes = { isPS: PropTypes.bool, processo: PropTypes.object };

export default function DetalhesProcesso({ isPS, processo }) {
  const entidadesList = entidadesParse(processo?.entidade);
  const { origens } = useSelector((state) => state.parametrizacao);
  const { colaboradores, uos } = useSelector((state) => state.intranet);
  const origem = origens?.find((row) => row?.id === processo?.origem_id);
  const uo = uos?.find((row) => Number(row?.id) === Number(processo?.uo_origem_id));
  const colaboradorLock = colaboradores?.find((row) => row?.perfil_id === processo?.perfil_id);
  const docPLabel = dis?.find((row) => row.id === processo?.tipo_doc_idp)?.label || 'Doc. primário';
  const docSLabel = dis?.find((row) => row.id === processo?.tipo_doc_ids)?.label || 'Doc. secundário';
  const criador = colaboradores?.find((row) => row?.perfil?.mail?.toLowerCase() === processo?.criador?.toLowerCase());
  const con = processo?.con || null;
  const credito = processo?.credito || null;
  const situacao = credito?.situacao_final_mes || '';

  const pareceresNaoValidados = () => {
    let pareceres = '';
    const pnv = processo?.pareceres_estado?.filter((item) => !item?.validado);
    pnv?.forEach((row, index) => {
      pareceres +=
        pnv?.length - 1 === index ? row?.nome?.replace(' - P/S/P', '') : `${row?.nome?.replace(' - P/S/P', '')} / `;
      return pareceres;
    });
    return pareceres;
  };

  return (
    <>
      {(uo ||
        criador ||
        processo?.assunto ||
        processo?.criado_em ||
        processo?.observacao ||
        processo?.referencia ||
        processo?.estado_atual ||
        processo?.data_entrada ||
        processo?.numero_entrada ||
        processo?.pendente) && (
        <List sx={{ pt: 0 }}>
          <ListItem disableGutters divider sx={{ pb: 0.5 }}>
            <Typography variant="subtitle1">Processo</Typography>
          </ListItem>
          {processo?.numero_entrada && <TextItem title="Nº de entrada:" text={processo?.numero_entrada} />}
          {uo?.label && (
            <TextItem title="Agência/U.O:" text={uo?.tipo === 'Agências' ? `Agência ${uo?.label}` : uo?.label} />
          )}
          {processo?.assunto && <TextItem title="Assunto:" text={processo?.assunto} />}
          {processo?.criado_em && <TextItem title="Criado em:" text={ptDateTime(processo?.criado_em)} />}
          {criador?.perfil?.displayName && <TextItem title="Criado por:" text={criador?.perfil?.displayName} shuffle />}
          {processo?.data_entrada && !isPS && (
            <TextItem
              title="Data de entrada:"
              text={`${ptDate(processo?.data_entrada)}${processo?.canal ? ` (Via ${processo?.canal})` : ''}`}
            />
          )}
          {processo?.referencia && <TextItem title="Referência:" text={processo?.referencia} />}
          {(processo?.estado_atual || processo?.em_paralelo) && (
            <TextItem
              title="Estado atual:"
              label={
                <Stack spacing={0.5}>
                  <Typography variant="subtitle1">
                    {processo?.em_paralelo ? pareceresNaoValidados() : processo?.estado_atual?.replace(' - P/S/P', '')}
                  </Typography>
                  {processo?.data_ultima_transicao && (
                    <Stack direction="row" spacing={1} sx={{ color: 'text.secondary' }}>
                      <Criado caption tipo="date" value={ptDateTime(processo?.data_ultima_transicao)} />
                      {processo?.estado_atual !== 'Arquivo' && (
                        <Criado
                          caption
                          tipo="time"
                          sx={{ color: colorProcesso(processo?.cor) }}
                          value={fToNow(processo?.data_ultima_transicao)}
                        />
                      )}
                    </Stack>
                  )}
                  {colaboradorLock && (
                    <>
                      {processo?.preso ? (
                        <Typography sx={{ typography: 'body2', color: 'text.primary' }}>
                          <Typography variant="spam" sx={{ fontWeight: 900 }}>
                            {shuffleString(colaboradorLock?.perfil?.displayName)}
                          </Typography>
                          &nbsp;está trabalhando neste processo
                        </Typography>
                      ) : (
                        <Typography sx={{ typography: 'body2', color: 'text.primary' }}>
                          Este processo foi atribuído a&nbsp;
                          <Typography variant="spam" sx={{ fontWeight: 900 }}>
                            {shuffleString(colaboradorLock?.perfil?.displayName)}
                          </Typography>
                        </Typography>
                      )}
                    </>
                  )}
                </Stack>
              }
            />
          )}
          {processo?.observacao && <TextItem title="Observação:" text={newLineText(processo?.observacao)} />}
          {processo?.pendente && (
            <TextItem
              label={
                <Stack sx={{ width: 1 }}>
                  <Stack direction="row">
                    <Label color="warning" startIcon={<InfoOutlinedIcon />}>
                      Processo pendente
                    </Label>
                  </Stack>
                  {processo?.motivo && <TextItem title="Motivo:" text={processo?.motivo} sx={{ mt: 1 }} />}
                  {processo?.observacao_motivo_pendencia && (
                    <TextItem title="Observação:" text={processo?.observacao_motivo_pendencia} sx={{ pt: 0.5 }} />
                  )}
                </Stack>
              }
            />
          )}
        </List>
      )}
      {(entidadesList ||
        processo?.email ||
        processo?.conta ||
        processo?.doc_idp ||
        processo?.doc_ids ||
        processo?.bi_cni ||
        processo?.cliente ||
        processo?.titular ||
        processo?.segmento) && (
        <List>
          <ListItem disableGutters divider sx={{ pb: 0.5 }}>
            <Typography variant="subtitle1">Identificação</Typography>
          </ListItem>
          {processo?.titular && (
            <TextItem text={processo?.titular} title={isPS ? 'Descrição:' : 'Titular:'} shuffle={!isPS} />
          )}
          {processo?.email && <TextItem title="Email:" text={processo?.email} shuffle />}
          {processo?.doc_idp && <TextItem title={`${docPLabel}:`} text={processo?.doc_idp?.toString()} shuffle />}
          {processo?.doc_ids && <TextItem title={`${docSLabel}:`} text={processo?.doc_ids?.toString()} shuffle />}
          {entidadesList && <TextItem title="Nº de entidade(s):" text={entidadesList} shuffle />}
          {processo?.cliente && <TextItem title="Nº de cliente:" text={processo?.cliente?.toString()} shuffle />}
          {processo?.conta && <TextItem title="Nº de conta:" text={processo?.conta?.toString()} shuffle />}
          {processo?.segmento && (
            <TextItem
              title="Segmento:"
              text={(processo?.segmento === 'P' && 'Particular') || (processo?.segmento === 'E' && 'Empresa')}
            />
          )}
        </List>
      )}
      {(processo?.numero_operacao || con || processo?.operacao || origem) && (
        <List>
          <ListItem disableGutters divider sx={{ pb: 0.5 }}>
            <Typography variant="subtitle1">Operação</Typography>
          </ListItem>
          {processo?.numero_operacao && <TextItem title="Nº da operação:" text={processo?.numero_operacao} />}
          {processo?.operacao && <TextItem title="Descrição:" text={processo?.operacao} />}
          {origem && origem?.id === processo?.origem_id && (
            <TextItem
              title="Origem:"
              label={
                <Stack spacing={0.75}>
                  {origem?.designacao && <Typography>{origem.designacao}</Typography>}
                  {origem?.seguimento && <Typography>{origem.seguimento}</Typography>}
                  {(origem?.tipo || origem?.codigo) && (
                    <Stack
                      spacing={1}
                      direction="row"
                      alignItems="center"
                      divider={<Divider orientation="vertical" flexItem sx={{ borderColor: 'text.primary' }} />}
                    >
                      {origem?.tipo && <SubItem value={origem.tipo} label="Tipo:" />}
                      {origem?.codigo && <SubItem value={origem.codigo} label="Código:" />}
                    </Stack>
                  )}
                  {(origem?.telefone || origem?.email) && (
                    <Stack
                      spacing={1}
                      direction="row"
                      alignItems="center"
                      divider={<Divider orientation="vertical" flexItem sx={{ borderColor: 'text.primary' }} />}
                    >
                      {origem?.telefone && <SubItem value={origem.telefone} label="Telfone:" />}
                      {origem?.email && <SubItem value={origem.email} label="Email:" />}
                    </Stack>
                  )}
                </Stack>
              }
            />
          )}
          {(processo?.operacao === 'Cativo/Penhora' ||
            (!processo?.operacao === 'Cativo/Penhora' && processo?.valor > 0)) && (
            <ValorItem
              valor={processo?.valor}
              title={processo?.operacao === 'Cativo/Penhora' ? 'Valor para cativo:' : 'Valor:'}
            />
          )}
          {processo?.cativos?.length > 0 && processo?.operacao === 'Cativo/Penhora' && (
            <ValorItem cativos={processo?.cativos} valor={processo?.saldo_cativo} title="Saldo disponível p/ cativo:" />
          )}
        </List>
      )}
      {processo?.agendado && (
        <List>
          <ListItem disableGutters divider sx={{ pb: 0.5 }}>
            <Typography variant="subtitle1">Agendamento</Typography>
          </ListItem>
          {processo?.periodicidade && <TextItem title="Periodicidade:" text={processo?.periodicidade} />}
          {processo?.dia_mes && <TextItem title="Dia do mês para execução:" text={processo?.dia_mes} />}
          {processo?.data_inicio && <TextItem title="Data de início:" text={ptDate(processo?.data_inicio)} />}
          {processo?.data_arquivamento && (
            <TextItem title="Data de término:" text={ptDate(processo?.data_arquivamento)} />
          )}
        </List>
      )}
      {credito && (
        <List>
          <ListItem disableGutters divider sx={{ pb: 0.5 }}>
            <Typography variant="subtitle1">Info. crédito</Typography>
          </ListItem>
          {situacao && <TextItem title="Situação:" label={<Label color={colorLabel(situacao)}>{situacao}</Label>} />}
          {credito?.nproposta && <TextItem title="Nº de proposta:" text={credito?.nproposta} />}
          {/* {credito?.segmento && <TextItem title="Segmento:" text={credito?.segmento} />} */}
          {credito?.linha && <TextItem title="Linha de crédito:" text={credito?.linha} />}
          {credito?.montante_solicitado && (
            <TextItem title="Montante solicitado:" text={fCurrency(credito?.montante_solicitado)} />
          )}
          {credito?.setor_atividade && <TextItem title="Entidade patronal:" text={credito?.setor_atividade} />}
          {credito?.finalidade && <TextItem title="Finalidade:" text={credito?.finalidade} />}
          {credito?.montante_aprovado && (
            <TextItem title="Montante aprovado:" text={fCurrency(credito?.montante_aprovado)} />
          )}
          {credito?.data_aprovacao && <TextItem title="Data de aprovação:" text={ptDate(credito?.data_aprovacao)} />}
          {credito?.montante_contratado && (
            <TextItem title="Montante contratado:" text={fCurrency(credito?.montante_contratado)} />
          )}
          {credito?.data_contratacao && (
            <TextItem title="Data de contratação:" text={ptDate(credito?.data_contratacao)} />
          )}
          {credito?.prazo_amortizacao && <TextItem title="Prazo de amortização:" text={credito?.prazo_amortizacao} />}
          {credito?.taxa_juro && <TextItem title="Taxa de juro:" text={fPercent(credito?.taxa_juro)} />}
          {credito?.garantia && <TextItem title="Garantia:" text={credito?.garantia} />}
          {credito?.escalao_decisao && <TextItem title="Escalão de decisão:" text={credito?.escalao_decisao} />}
          {credito?.data_desistido && <TextItem title="Data de desistência:" text={ptDate(credito?.data_desistido)} />}
          {credito?.data_indeferido && (
            <TextItem title="Data de indeferimento:" text={ptDate(credito?.data_indeferido)} />
          )}
          {/* {credito?.valor_divida && (
            <Paper sx={{ p: 1, pb: 0.75, my: 0.5, bgcolor: 'background.neutral', flexGrow: 1 }}>
              <Label color="info" startIcon={<InfoOutlinedIcon />}>
                Entidade com crédito em dívida
              </Label>
              <TextItem title="Valor:" text={fCurrency(credito?.valor_divida)} />
              {credito?.periodo && <TextItem title="Data:" text={ptDate(credito?.periodo)} />}
            </Paper>
          )} */}
        </List>
      )}
      {con && (
        <List>
          <ListItem disableGutters divider sx={{ pb: 0.5 }}>
            <Typography variant="subtitle1">Dados do ordenante</Typography>
          </ListItem>
          <TextItem title="Depositante é o próprio titular:" text={con?.titular_ordenador ? 'SIM' : 'NÃO'} />
          <TextItem title="Titular da conta beneficiária é residente:" text={con?.residente ? 'SIM' : 'NÃO'} />
          {con?.ordenador && <TextItem title="Nome:" text={con?.ordenador} />}
          {con?.tipo_docid && (
            <TextItem
              title="Tipo doc. identificação:"
              text={dis?.find((row) => row.id === con?.tipo_docid)?.label || con?.tipo_docid}
            />
          )}
          {con?.docid && <TextItem title="Nº doc. identificação:" text={con?.docid} />}
          {con?.nif && <TextItem title="NIF:" text={con?.nif} />}
          {con?.pai && <TextItem title="Nome do Pai:" text={con?.pai} />}
          {con?.mae && <TextItem title="Nome da Mãe:" text={con?.mae} />}
          {con?.estado_civil && (
            <TextItem
              title="Estado civil:"
              text={estadosCivis?.find((row) => row.id === con?.estado_civil)?.label || con?.estado_civil}
            />
          )}
          {con?.data_nascimento && <TextItem title="Data nascimento:" text={ptDate(con?.data_nascimento)} />}
          {con?.nacionalidade && <TextItem title="Nacionalidade:" text={con?.nacionalidade} />}
          {con?.local_pais_nascimento && (
            <TextItem title="Local/País de nascimento:" text={con?.local_pais_nascimento} />
          )}
          {con?.morada && <TextItem title="Morada:" text={con?.morada} />}
          {con?.profissao && <TextItem title="Profissão:" text={con?.profissao} />}
          {con?.local_trabalho && <TextItem title="Local de trabalho:" text={con?.local_trabalho} />}
          {con?.telefone && <TextItem title="Telefone:" text={con?.telefone} />}
          {con?.telemovel && <TextItem title="Telemóvel:" text={con?.telemovel} />}
          {con?.emails && <TextItem title="Email(s):" text={con?.emails} />}
          {con?.origem_fundo && <TextItem title="Origem do fundo:" text={newLineText(con?.origem_fundo)} />}
          {con?.finalidade && <TextItem title="Finalidade do fundo:" text={newLineText(con?.finalidade)} />}
        </List>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

TextItem.propTypes = {
  label: PropTypes.node,
  text: PropTypes.string,
  title: PropTypes.string,
  shuffle: PropTypes.bool,
};

function TextItem({ title = '', text = '', label = null, shuffle = false, ...sx }) {
  return (
    <Stack spacing={1} direction="row" alignItems="center" sx={{ ...itemStyle }} {...sx}>
      {title && <Typography sx={{ color: 'text.secondary' }}>{title}</Typography>}
      {text && <Typography>{shuffle ? shuffleString(text) : text}</Typography>}
      {label}
    </Stack>
  );
}

// ----------------------------------------------------------------------

SubItem.propTypes = { value: PropTypes.string, label: PropTypes.string };

function SubItem({ value, label }) {
  return (
    <Typography variant="body2">
      <Typography variant="spam" sx={{ color: 'text.secondary', fontWeight: 900 }}>
        {label}
      </Typography>
      &nbsp;{value}
    </Typography>
  );
}

// ----------------------------------------------------------------------

ValorItem.propTypes = { title: PropTypes.string, valor: PropTypes.number, cativos: PropTypes.array };

function ValorItem({ title, valor, cativos }) {
  const { toggle: open, onOpen, onClose } = useToggle();
  return (
    <Stack spacing={1} direction="row" alignItems="center" justifyContent="left" sx={{ ...itemStyle }}>
      <Typography sx={{ color: 'text.secondary' }}>{title}</Typography>
      <Typography>
        {fCurrency(valor)}
        <Typography variant="spam" sx={{ typography: 'body2' }}>
          &nbsp;({valorPorExtenso(valor)})
        </Typography>
      </Typography>
      {cativos?.length > 0 && (
        <>
          <DefaultAction handleClick={onOpen} small color="info" label="INFO. DAS CONTAS" />
          <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                Contas para cativo
                <Fechar handleClick={onClose} />
              </Stack>
            </DialogTitle>
            <DialogContent>
              <TableContainer sx={{ minWidth: 500, mt: 3, position: 'relative', overflow: 'hidden' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Conta</TableCell>
                      <TableCell align="right">Saldo</TableCell>
                      <TableCell align="right">Saldo em CVE</TableCell>
                      <TableCell align="center">Enviado a banka</TableCell>
                      <TableCell align="center" width={10}>
                        Executado
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cativos?.map((row, index) => (
                      <TableRow hover key={`${row?.id}_${index}`}>
                        <TableCell>{row?.conta}</TableCell>
                        <TableCell align="right">
                          {fNumber(row?.saldo)} {row?.moeda}
                        </TableCell>
                        <TableCell align="right">{fCurrency(row?.saldo_cve)}</TableCell>
                        <TableCell align="center">
                          <Checked check={row?.enviado_banka} />
                        </TableCell>
                        <TableCell align="center">
                          {row?.executado ? (
                            <>
                              {row?.cativador && <Criado tipo="user" value={row?.cativador} shuffle />}
                              {row.data_cativo && <Criado tipo="date" value={ptDate(row.data_cativo)} />}
                            </>
                          ) : (
                            <Checked check={row?.executado} />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
          </Dialog>
        </>
      )}
    </Stack>
  );
}
