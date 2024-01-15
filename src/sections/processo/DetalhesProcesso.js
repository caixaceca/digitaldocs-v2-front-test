import PropTypes from 'prop-types';
// @mui
import Fab from '@mui/material/Fab';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
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
import { colorLabel } from '../../utils/getColorPresets';
import { ptDate, ptDateTime } from '../../utils/formatTime';
import { valorPorExtenso } from '../../utils/numeroPorExtenso';
import { fNumber, fCurrency, fPercent } from '../../utils/formatNumber';
import { newLineText, entidadesParse } from '../../utils/normalizeText';
// redux
import { useSelector } from '../../redux/store';
// hooks
import useToggle from '../../hooks/useToggle';
// components
import Label from '../../components/Label';
import { Fechar } from '../../components/Actions';
import Scrollbar from '../../components/Scrollbar';
// _mock
import { dis, estadosCivis } from '../../_mock';

// ----------------------------------------------------------------------

const itemStyle = { py: 0.75, px: 1, my: 0.5, borderRadius: 0.5, backgroundColor: 'background.neutral' };

// ----------------------------------------------------------------------

DetalhesProcesso.propTypes = { isPS: PropTypes.bool };

export default function DetalhesProcesso({ isPS }) {
  const { processo } = useSelector((state) => state.digitaldocs);
  const { colaboradores, uos } = useSelector((state) => state.intranet);
  const { origem, motivosPendencias } = useSelector((state) => state.parametrizacao);
  const _entidades = entidadesParse(processo?.entidades);
  const uo = uos?.find((row) => Number(row?.id) === Number(processo?.uo_origem_id));
  const colaboradorLock = colaboradores?.find((row) => row?.perfil_id === processo?.perfil_id);
  const docPLabel = dis?.find((row) => row.id === processo.tipodocidp)?.label || 'Doc. primário';
  const docSLabel = dis?.find((row) => row.id === processo.tipodocids)?.label || 'Doc. secundário';
  const motivo = motivosPendencias?.find((row) => row?.id?.toString() === processo?.mpendencia?.toString());
  const criador = colaboradores?.find((row) => row?.perfil?.mail?.toLowerCase() === processo?.criador?.toLowerCase());
  const credito = processo?.credito || null;
  const con = processo.con || null;
  const situacao = credito?.situacao_final_mes || '';

  const pareceresNaoValidados = () => {
    let pareceres = '';
    const pnv = processo?.pareceres?.filter((item) => !item?.validado);
    pnv?.forEach((row, index) => {
      pareceres +=
        pnv?.length - 1 === index ? row?.nome?.replace(' - P/S/P', '') : `${row?.nome?.replace(' - P/S/P', '')} / `;
      return pareceres;
    });
    return pareceres;
  };

  return (
    <Scrollbar sx={{ mt: -2, mb: -1 }}>
      {(uo ||
        criador ||
        processo?.obs ||
        processo?.nome ||
        processo?.assunto ||
        processo?.nentrada ||
        processo.criado_em ||
        processo?.referencia ||
        processo?.data_entrada ||
        processo.ispendente) && (
        <List>
          <ListItem disableGutters divider sx={{ pb: 0.5 }}>
            <Typography variant="subtitle1">Processo</Typography>
          </ListItem>
          {processo?.nentrada && <TextItem title="Nº de entrada:" text={processo.nentrada} />}
          {uo?.label && (
            <TextItem title="Agência/U.O:" text={uo?.tipo === 'Agências' ? `Agência ${uo?.label}` : uo?.label} />
          )}
          {processo?.assunto && <TextItem title="Assunto:" text={processo.assunto} />}
          {processo?.criado_em && <TextItem title="Criado em:" text={ptDateTime(processo.criado_em)} />}
          {criador?.perfil?.displayName && <TextItem title="Criado por:" text={criador?.perfil?.displayName} />}
          {processo?.data_entrada && !isPS && (
            <TextItem title="Data de entrada:" text={ptDate(processo.data_entrada)} />
          )}
          {processo?.referencia && <TextItem title="Referência:" text={processo.referencia} />}
          {(processo?.nome || processo?.in_paralelo_mode) && (
            <Stack spacing={1} direction="row" alignItems="center" justifyContent="left" sx={{ ...itemStyle }}>
              <Typography sx={{ color: 'text.secondary' }}>Estado atual:</Typography>
              <Typography sx={{ fontWeight: 900, color: 'success.main' }}>
                {processo?.in_paralelo_mode ? (
                  pareceresNaoValidados()
                ) : (
                  <>
                    {processo.nome}
                    {colaboradorLock && (
                      <>
                        {processo.is_lock ? (
                          <Typography sx={{ typography: 'body2', color: 'text.primary' }}>
                            <Typography variant="spam" sx={{ fontWeight: 900 }}>
                              {colaboradorLock?.perfil?.displayName}
                            </Typography>
                            &nbsp;está trabalhando neste processo
                          </Typography>
                        ) : (
                          <Typography sx={{ typography: 'body2', color: 'text.primary' }}>
                            Este processo foi atribuído a&nbsp;
                            <Typography variant="spam" sx={{ fontWeight: 900 }}>
                              {colaboradorLock?.perfil?.displayName}
                            </Typography>
                          </Typography>
                        )}
                      </>
                    )}
                  </>
                )}
              </Typography>
            </Stack>
          )}
          {processo?.obs && (
            <Paper sx={{ py: 0.75, px: 1, bgcolor: 'background.neutral', flexGrow: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography sx={{ color: 'text.secondary' }}>Obs:</Typography>
                <Typography>{newLineText(processo.obs)}</Typography>
              </Stack>
            </Paper>
          )}
          {(processo.ispendente || motivo || processo.mobs) && (
            <Paper sx={{ p: 1, pb: 0.75, my: 0.5, bgcolor: 'background.neutral', flexGrow: 1 }}>
              {processo.ispendente ? (
                <Label color="warning" startIcon={<InfoOutlinedIcon />}>
                  Processo pendente
                </Label>
              ) : (
                <Label color="default" startIcon={<InfoOutlinedIcon />}>
                  Este processo esteve pendente
                </Label>
              )}
              {motivo && <TextItem title="Motivo:" text={motivo?.motivo} sx={{ mt: 1, p: 0 }} />}
              {processo.mobs && <TextItem title="Obs:" text={processo.mobs} sx={{ pt: 0.5, px: 0 }} />}
            </Paper>
          )}
        </List>
      )}
      {(processo?.titular ||
        processo?.email ||
        processo?.docidp ||
        processo?.docids ||
        processo?.bi_cni ||
        _entidades ||
        processo?.cliente ||
        processo?.conta ||
        processo?.segcliente) && (
        <List>
          <ListItem disableGutters divider sx={{ pb: 0.5 }}>
            <Typography variant="subtitle1">Identificação</Typography>
          </ListItem>
          {processo.titular && <TextItem text={processo.titular} title={isPS ? 'Descrição:' : 'Titular:'} />}
          {processo.email && <TextItem title="Email:" text={processo.email} />}
          {processo?.docidp && <TextItem title={`${docPLabel}:`} text={processo.docidp?.toString()} />}
          {processo?.docids && <TextItem title={`${docSLabel}:`} text={processo.docids?.toString()} />}
          {_entidades && (
            <TextItem title={_entidades?.includes('/') ? 'Nº de entidade(s)' : 'Nº de entidade:'} text={_entidades} />
          )}
          {processo.cliente && <TextItem title="Nº de cliente:" text={processo.cliente?.toString()} />}
          {processo.conta && <TextItem title="Nº de conta:" text={processo.conta?.toString()} />}
          {processo.segcliente && !processo?.is_credito && (
            <TextItem
              title="Segmento:"
              text={(processo.segcliente === 'P' && 'Particular') || (processo.segcliente === 'E' && 'Empresa')}
            />
          )}
        </List>
      )}
      {(!processo?.is_interno || processo?.noperacao) && (
        <List>
          <ListItem disableGutters divider sx={{ pb: 0.5 }}>
            <Typography variant="subtitle1">Operação</Typography>
          </ListItem>
          {processo?.noperacao && <TextItem title="Nº de operação:" text={processo.noperacao} />}
          {con && <TextItem title="Titular da conta beneficiária é residente:" text={con?.residente ? 'SIM' : 'NÃO'} />}
          {processo?.operacao && <TextItem title="Descrição:" text={processo.operacao} />}
          {origem && origem?.id === processo.origem_id && (
            <Stack spacing={1} direction="row" alignItems="center" sx={{ ...itemStyle }}>
              <Typography sx={{ color: 'text.secondary' }}>Origem:</Typography>
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
            </Stack>
          )}
          {processo?.operacao === 'Cativo/Penhora' && (
            <>
              {processo?.valor > 0 && <ValorItem title="Valor para cativo:" valor={processo.valor} />}
              {processo?.saldoca > 0 && (
                <ValorItem
                  title={processo?.situacao === 'X' ? 'Valor cativado:' : 'Saldo disponível p/ cativo:'}
                  valor={processo.saldoca}
                  contas={processo?.situacao === 'X' ? processo?.contasCativado : processo?.contasEleitosCativo}
                />
              )}
            </>
          )}
        </List>
      )}
      {processo.agendado && (
        <List>
          <ListItem disableGutters divider sx={{ pb: 0.5 }}>
            <Typography variant="subtitle1">Agendamento</Typography>
          </ListItem>
          {processo.periodicidade && <TextItem title="Periodicidade:" text={processo.periodicidade} />}
          {processo.diadomes && <TextItem title="Dia do mês para execução:" text={processo.diadomes} />}
          {processo.data_inicio && <TextItem title="Data de início:" text={ptDate(processo.data_inicio)} />}
          {processo.data_arquivamento && (
            <TextItem title="Data de término:" text={ptDate(processo.data_arquivamento)} />
          )}
        </List>
      )}
      {processo.is_credito && credito && (
        <List>
          <ListItem disableGutters divider sx={{ pb: 0.5 }}>
            <Typography variant="subtitle1">Info. crédito</Typography>
          </ListItem>
          {situacao && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ ...itemStyle }}>
              <Typography sx={{ color: 'text.secondary' }}>Situação:</Typography>
              <Label color={colorLabel(situacao)} sx={{ typography: 'subtitle2', py: 1.5 }}>
                {situacao}
              </Label>
            </Stack>
          )}
          {credito?.nproposta && <TextItem title="Nº de proposta:" text={credito?.nproposta} />}
          {credito?.segmento && <TextItem title="Segmento:" text={credito?.segmento} />}
          {credito?.linha?.linha && <TextItem title="Linha de crédito:" text={credito?.linha?.linha} />}
          {credito?.montantes && <TextItem title="Montante solicitado:" text={fCurrency(credito?.montantes)} />}
          {credito?.setor_atividade && <TextItem title="Setor de atividade:" text={credito?.setor_atividade} />}
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
          {credito?.valor_divida && (
            <Paper sx={{ p: 1, pb: 0.75, my: 0.5, bgcolor: 'background.neutral', flexGrow: 1 }}>
              <Label color="info" startIcon={<InfoOutlinedIcon />}>
                Entidade com crédito em dívida
              </Label>
              <TextItem title="Valor:" text={fCurrency(credito?.valor_divida)} />
              {credito?.periodo && <TextItem title="Data:" text={ptDate(credito?.periodo)} />}
            </Paper>
          )}
        </List>
      )}
      {con && (
        <List>
          <ListItem disableGutters divider sx={{ pb: 0.5 }}>
            <Typography variant="subtitle1">Dados do ordenante</Typography>
          </ListItem>
          <TextItem title="Depositante é o próprio titular:" text={con?.titular_ordenador ? 'SIM' : 'NÃO'} />
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
    </Scrollbar>
  );
}

// ----------------------------------------------------------------------

TextItem.propTypes = { title: PropTypes.string, text: PropTypes.string };

function TextItem({ title, text, ...sx }) {
  return (
    <Stack spacing={1} direction="row" alignItems="center" sx={{ ...itemStyle }} {...sx}>
      <Typography sx={{ color: 'text.secondary' }}>{title}</Typography>
      <Typography>{text}</Typography>
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

ValorItem.propTypes = { title: PropTypes.string, valor: PropTypes.number, contas: PropTypes.array };

function ValorItem({ title, valor, contas }) {
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
      {title === 'Saldo disponível p/ cativo:' && contas?.length > 0 && (
        <>
          <Stack>
            <Tooltip title="DETALHES" arrow>
              <Fab color="inherit" size="small" variant="soft" onClick={onOpen} sx={{ width: 30, height: 30 }}>
                <InfoOutlinedIcon sx={{ width: 20 }} />
              </Fab>
            </Tooltip>
          </Stack>
          <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                Contas eleitas para cativo
                <Fechar handleClick={onClose} />
              </Stack>
            </DialogTitle>
            <DialogContent>
              <TableContainer sx={{ minWidth: 500, mt: 2, position: 'relative', overflow: 'hidden' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Conta</TableCell>
                      <TableCell align="right">Saldo</TableCell>
                      <TableCell align="right">Saldo em CVE</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {contas?.map((row) => {
                      const labelId = `checkbox-list-label-${row}`;
                      return (
                        <TableRow hover key={labelId}>
                          <TableCell>{row?.conta}</TableCell>
                          <TableCell align="right">
                            {fNumber(row?.saldo)} {row?.moeda}
                          </TableCell>
                          <TableCell align="right">{fCurrency(row?.saldocve)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
          </Dialog>
        </>
      )}
      {title === 'Valor cativado:' && contas?.length > 0 && (
        <>
          <Stack>
            <Tooltip title="DETALHES" arrow>
              <Fab color="inherit" size="small" variant="soft" onClick={onOpen} sx={{ width: 30, height: 30 }}>
                <InfoOutlinedIcon sx={{ width: 20 }} />
              </Fab>
            </Tooltip>
          </Stack>
          <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                Contas cativadas
                <Fechar handleClick={onClose} />
              </Stack>
            </DialogTitle>
            <DialogContent>
              <TableContainer sx={{ minWidth: 500, mt: 2, position: 'relative', overflow: 'hidden' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Conta</TableCell>
                      <TableCell>Utilizador</TableCell>
                      <TableCell align="center">Data</TableCell>
                      <TableCell align="right">Valor</TableCell>
                      <TableCell align="right">Valor em CVE</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {contas?.map((row) => {
                      const labelId = `checkbox-list-label-${row}`;
                      return (
                        <TableRow hover key={labelId}>
                          <TableCell>{row?.conta}</TableCell>
                          <TableCell>{row?.usercativador}</TableCell>
                          <TableCell align="center">{ptDate(row?.datacativo)}</TableCell>
                          <TableCell align="right">
                            {fNumber(row?.saldo)} {row?.moeda}
                          </TableCell>
                          <TableCell align="right">{fCurrency(row?.saldocve)}</TableCell>
                        </TableRow>
                      );
                    })}
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
