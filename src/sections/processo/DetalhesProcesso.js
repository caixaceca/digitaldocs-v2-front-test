import PropTypes from 'prop-types';
// @mui
import {
  Fab,
  List,
  Stack,
  Paper,
  Table,
  Dialog,
  Tooltip,
  Divider,
  ListItem,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  TableContainer,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
// utils
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
import Scrollbar from '../../components/Scrollbar';
// _mock
import { dis } from '../../_mock';

// ----------------------------------------------------------------------

DetalhesProcesso.propTypes = { processo: PropTypes.object, isPS: PropTypes.bool };

export default function DetalhesProcesso({ processo, isPS }) {
  const _entidades = entidadesParse(processo?.entidades);
  const { colaboradores, uos } = useSelector((state) => state.intranet);
  const { motivosPendencias, origem } = useSelector((state) => state.digitaldocs);
  const uo = uos?.find((row) => Number(row?.id) === Number(processo?.uo_origem_id));
  const colaboradorLock = colaboradores?.find((row) => row?.perfil_id === processo?.perfil_id);
  const docPLabel = dis?.find((row) => row.id === processo.tipodocidp)?.label || 'Doc. primário';
  const docSLabel = dis?.find((row) => row.id === processo.tipodocids)?.label || 'Doc. secundário';
  const motivo = motivosPendencias?.find((row) => row?.id?.toString() === processo?.mpendencia?.toString());
  const criador = colaboradores?.find((row) => row?.perfil?.mail?.toLowerCase() === processo?.criador?.toLowerCase());
  const credito = processo?.credito || null;
  const situacao = credito?.situacao_final_mes || '';
  const isOrigemProcesso = origem?.id === processo.origem_id;

  const pareceresNaoValidados = () => {
    let pareceres = '';
    const pnv = processo?.pareceres?.filter((item) => !item?.validado);
    pnv?.forEach((row, index) => {
      pareceres += pnv?.length - 1 === index ? row?.nome : `${row?.nome} / `;
      return pareceres;
    });
    return pareceres;
  };

  return (
    <Scrollbar sx={{ mt: -2 }}>
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
          <ListItem disableGutters divider secondaryAction="">
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
            <Stack direction="row" alignItems="center" justifyContent="left" spacing={1} sx={{ py: 0.75 }}>
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
            <Stack sx={{ py: 0.75 }}>
              <Paper sx={{ p: 2, bgcolor: 'background.neutral', flexGrow: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography sx={{ color: 'text.secondary' }}>Obs:</Typography>
                  <Typography>{newLineText(processo.obs)}</Typography>
                </Stack>
              </Paper>
            </Stack>
          )}
          {(processo.ispendente || motivo || processo.mobs) && (
            <Stack sx={{ py: 0.75 }}>
              <Paper sx={{ p: 2, pb: 1, bgcolor: 'background.neutral', flexGrow: 1 }}>
                {processo.ispendente ? (
                  <Label color="warning" startIcon={<InfoOutlinedIcon />}>
                    Processo pendente
                  </Label>
                ) : (
                  <Label color="default" startIcon={<InfoOutlinedIcon />}>
                    Este processo esteve pendente
                  </Label>
                )}
                {motivo && <TextItem title="Motivo:" text={motivo?.motivo} />}
                {processo.mobs && <TextItem title="Obs:" text={processo.mobs} />}
              </Paper>
            </Stack>
          )}
        </List>
      )}
      {(processo?.titular ||
        processo?.docidp ||
        processo?.docids ||
        processo?.bi_cni ||
        _entidades ||
        processo?.cliente ||
        processo?.conta ||
        processo?.segcliente) && (
        <List>
          <ListItem disableGutters divider>
            <Typography variant="subtitle1">Identificação</Typography>
          </ListItem>
          {processo.titular && <TextItem text={processo.titular} title={isPS ? 'Descrição:' : 'Titular:'} />}
          {processo?.docidp && <TextItem title={`${docPLabel}:`} text={processo.docidp} />}
          {processo?.docids && <TextItem title={`${docSLabel}:`} text={processo.docids} />}
          {_entidades && (
            <TextItem title={_entidades?.includes('/') ? 'Nº de entidade(s)' : 'Nº de entidade:'} text={_entidades} />
          )}
          {processo.cliente && <TextItem title="Nº de cliente:" text={processo.cliente} />}
          {processo.conta && <TextItem title="Nº de conta:" text={processo.conta} />}
          {processo.segcliente && !processo?.is_credito && (
            <TextItem
              title="Segmento:"
              text={(processo.segcliente === 'P' && 'Particular') || (processo.segcliente === 'E' && 'Empresa')}
            />
          )}
        </List>
      )}
      {(processo.operacao || processo?.noperacao) && (
        <List>
          <ListItem disableGutters divider>
            <Typography variant="subtitle1">Operação</Typography>
          </ListItem>
          {processo.noperacao && <TextItem title="Nº de operação:" text={processo.noperacao} />}
          {processo.operacao && <TextItem title="Descrição:" text={processo.operacao} />}
          {(processo.origem || processo?.telefone || processo?.email) && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 0.75 }}>
              <Typography sx={{ color: 'text.secondary' }}>Origem:</Typography>
              <Stack spacing={0.5}>
                <Typography>{processo?.designacao}</Typography>
                {isOrigemProcesso && origem?.seguimento && (
                  <Typography>{processo?.seguimento || origem?.seguimento}</Typography>
                )}
                {isOrigemProcesso && (origem?.tipo || origem?.codigo) && (
                  <Stack
                    spacing={1}
                    direction="row"
                    alignItems="center"
                    divider={<Divider orientation="vertical" flexItem sx={{ borderColor: 'text.primary' }} />}
                  >
                    {origem?.tipo && (
                      <Typography variant="body2">
                        <Typography variant="spam" sx={{ color: 'text.secondary', fontWeight: 900 }}>
                          Tipo:
                        </Typography>
                        &nbsp;{origem?.tipo}
                      </Typography>
                    )}
                    {origem?.codigo && (
                      <Typography variant="body2">
                        <Typography variant="spam" sx={{ color: 'text.secondary', fontWeight: 900 }}>
                          Código:
                        </Typography>
                        &nbsp;{origem?.codigo}
                      </Typography>
                    )}
                  </Stack>
                )}
                {(processo?.telefone || processo?.email) && (
                  <Stack
                    spacing={1}
                    direction="row"
                    alignItems="center"
                    divider={<Divider orientation="vertical" flexItem sx={{ borderColor: 'text.primary' }} />}
                  >
                    {processo?.telefone && (
                      <Typography variant="body2">
                        <Typography variant="spam" sx={{ color: 'text.secondary', fontWeight: 900 }}>
                          Tel:
                        </Typography>
                        &nbsp;{processo.telefone}
                      </Typography>
                    )}
                    {processo?.email && (
                      <Typography variant="body2">
                        <Typography variant="spam" sx={{ color: 'text.secondary', fontWeight: 900 }}>
                          Email:
                        </Typography>
                        &nbsp;{processo.email}
                      </Typography>
                    )}
                  </Stack>
                )}
              </Stack>
            </Stack>
          )}
          {processo.valor > 0 && <ValorItem title="Valor para cativo:" valor={processo.valor} />}
          {processo.saldoca > 0 && (
            <ValorItem
              title={processo.situacao === 'X' ? 'Valor cativado:' : 'Saldo disponível p/ cativo:'}
              valor={processo.saldoca}
              contas={processo.situacao === 'X' ? processo?.contasCativado : processo?.contasEleitosCativo}
            />
          )}
        </List>
      )}
      {processo.agendado && (
        <List>
          <ListItem disableGutters divider>
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
          <ListItem disableGutters divider>
            <Typography variant="subtitle1">Info. crédito</Typography>
          </ListItem>
          {situacao && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 0.75 }}>
              <Typography sx={{ color: 'text.secondary' }}>Situação:</Typography>
              <Label
                color={
                  (situacao === 'Em análise' && 'default') ||
                  (situacao === 'Aprovado' && 'success') ||
                  (situacao === 'Contratado' && 'primary') ||
                  'error'
                }
                sx={{ typography: 'subtitle2', py: 1.5 }}
              >
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
            <Stack sx={{ py: 0.75 }}>
              <Paper sx={{ p: 2, pb: 1, bgcolor: 'background.neutral', flexGrow: 1 }}>
                <Label color="info" startIcon={<InfoOutlinedIcon />}>
                  Entidade com crédito em dívida
                </Label>
                <TextItem title="Valor:" text={fCurrency(credito?.valor_divida)} />
                {credito?.periodo && <TextItem title="Data:" text={ptDate(credito?.periodo)} />}
              </Paper>
            </Stack>
          )}
        </List>
      )}
    </Scrollbar>
  );
}

// ----------------------------------------------------------------------

TextItem.propTypes = { title: PropTypes.string, text: PropTypes.string };

function TextItem({ title, text }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 0.75 }}>
      <Typography sx={{ color: 'text.secondary' }}>{title}</Typography>
      <Typography>{text}</Typography>
    </Stack>
  );
}

// ----------------------------------------------------------------------

ValorItem.propTypes = { title: PropTypes.string, valor: PropTypes.number, contas: PropTypes.array };

function ValorItem({ title, valor, contas }) {
  const { toggle: open, onOpen, onClose } = useToggle();
  return (
    <Stack direction="row" alignItems="center" justifyContent="left" spacing={1}>
      <Typography sx={{ color: 'text.secondary' }}>{title}</Typography>
      <Typography>
        {fCurrency(valor)}
        <Typography variant="spam" sx={{ typography: 'body2' }}>
          &nbsp;({valorPorExtenso(valor)})
        </Typography>
      </Typography>
      {title === 'Saldo disponível p/ cativo:' && contas?.length > 0 && (
        <>
          <Tooltip title="DETALHES" arrow>
            <Fab color="inherit" size="small" variant="soft" onClick={onOpen} sx={{ width: 30, height: 30 }}>
              <InfoOutlinedIcon sx={{ width: 20 }} />
            </Fab>
          </Tooltip>
          <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                Contas eleitas para cativo
                <Tooltip title="Fechar" arrow>
                  <IconButton onClick={onClose}>
                    <CloseOutlinedIcon sx={{ width: 20, opacity: 0.75 }} />
                  </IconButton>
                </Tooltip>
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
          <Tooltip title="DETALHES" arrow>
            <Fab color="inherit" size="small" variant="soft" onClick={onOpen} sx={{ width: 30, height: 30 }}>
              <InfoOutlinedIcon sx={{ width: 20 }} />
            </Fab>
          </Tooltip>
          <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                Contas cativadas
                <Tooltip title="Fechar" arrow>
                  <IconButton onClick={onClose}>
                    <CloseOutlinedIcon sx={{ width: 20, opacity: 0.75 }} />
                  </IconButton>
                </Tooltip>
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
