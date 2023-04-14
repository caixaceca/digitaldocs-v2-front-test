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
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
// utils
import { newLineText } from '../../utils/normalizeText';
import { ptDate, ptDateTime } from '../../utils/formatTime';
import { valorPorExtenso } from '../../utils/numeroPorExtenso';
import { fNumber, fCurrency, fPercent } from '../../utils/formatNumber';
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

DetalhesProcesso.propTypes = { processo: PropTypes.object };

export default function DetalhesProcesso({ processo }) {
  const { colaboradores, uos } = useSelector((state) => state.intranet);
  const { motivosPendencias } = useSelector((state) => state.digitaldocs);
  const uo = uos?.find((row) => Number(row?.id) === Number(processo?.uo_origem_id));
  const criador = colaboradores?.find((row) => row?.perfil?.mail?.toLowerCase() === processo?.criador?.toLowerCase());
  const colaboradorLock = processo.is_lock ? colaboradores?.find((row) => row?.perfil_id === processo?.perfil_id) : '';
  let _entidades = '';
  processo?.entidades?.split(';')?.forEach((row, index) => {
    _entidades += processo?.entidades?.split(';')?.length - 1 === index ? row : `${row} / `;
  });
  const docPLabel = dis?.find((row) => row.id === processo.tipodocidp)?.label || 'Primário';
  const docSLabel = dis?.find((row) => row.id === processo.tipodocids)?.label || 'Secundário';
  const motivo = motivosPendencias?.find((row) => row?.id?.toString() === processo?.mpendencia?.toString());

  const pareceresNaoValidados = () => {
    let pareceres = '';
    processo?.pareceres?.forEach((row, index) => {
      if (!row?.validado) {
        pareceres += processo?.pareceres?.length - 1 === index ? row?.nome : `${row?.nome} / `;
      }
      return pareceres;
    });
    return pareceres;
  };

  return (
    <Scrollbar sx={{ mt: -2 }}>
      {(processo?.referencia ||
        processo?.assunto ||
        processo?.data_entrada ||
        processo?.nome ||
        processo.criado_em ||
        uo ||
        criador ||
        processo?.obs ||
        processo.ispendente) && (
        <List>
          <ListItem disableGutters divider secondaryAction="">
            <Typography variant="subtitle1">Processo</Typography>
          </ListItem>
          {processo?.referencia && <TextItem title="Referência:" text={processo.referencia} />}
          {processo?.assunto && <TextItem title="Fluxo:" text={processo.assunto} />}
          {processo?.data_entrada && <TextItem title="Data de entrada:" text={ptDate(processo.data_entrada)} />}
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
                      <Typography sx={{ typography: 'body2', color: 'text.primary' }}>
                        <Typography variant="spam" sx={{ fontWeight: 900 }}>
                          {colaboradorLock?.perfil?.displayName}
                        </Typography>
                        &nbsp;está trabalhando neste processo
                      </Typography>
                    )}
                  </>
                )}
              </Typography>
            </Stack>
          )}
          {(processo.criado_em || uo || criador) && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 0.75 }}>
              <Typography sx={{ color: 'text.secondary' }}>Criado:</Typography>
              <Stack spacing={0.5}>
                {processo.criado_em && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <AccessTimeOutlinedIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />
                    <Typography variant="body2">{ptDateTime(processo.criado_em)}</Typography>
                  </Stack>
                )}
                {uo && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <BusinessOutlinedIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {uo?.tipo === 'Agências' ? `Agência ${uo?.label}` : uo?.label}
                    </Typography>
                  </Stack>
                )}
                {criador && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <AccountCircleOutlinedIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />
                    <Typography variant="body2">{criador?.perfil?.displayName}</Typography>
                  </Stack>
                )}
              </Stack>
            </Stack>
          )}
          {processo?.obs && (
            <Paper sx={{ p: 2, bgcolor: 'background.neutral', flexGrow: 1, my: 0.75 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography sx={{ color: 'text.secondary' }}>Obs:</Typography>
                <Typography>{newLineText(processo.obs)}</Typography>
              </Stack>
            </Paper>
          )}
          {(processo.ispendente || motivo || processo.mobs) && (
            <Paper sx={{ p: 2, pb: 1, bgcolor: 'background.neutral', flexGrow: 1, my: 0.75 }}>
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
          {processo.titular && <TextItem title="Titular:" text={processo.titular} />}
          {(processo.docidp || processo.docids) && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 0.75 }}>
              <Typography sx={{ color: 'text.secondary' }}>Documento:</Typography>
              <Stack spacing={0.5}>
                {processo.docidp && (
                  <Typography>
                    {processo.docidp}{' '}
                    <Typography variant="spam" sx={{ color: 'text.secondary' }}>
                      ({docPLabel})
                    </Typography>
                  </Typography>
                )}
                {processo.docids && (
                  <Typography>
                    {processo.docids}{' '}
                    <Typography variant="spam" sx={{ color: 'text.secondary' }}>
                      ({docSLabel})
                    </Typography>
                  </Typography>
                )}
              </Stack>
            </Stack>
          )}
          {_entidades && (
            <TextItem title={_entidades?.includes('/') ? 'Nº de entidade(s)' : 'Nº de entidade:'} text={_entidades} />
          )}
          {processo.cliente && <TextItem title="Nº de cliente:" text={processo.cliente} />}
          {processo.conta && <TextItem title="Nº de conta:" text={processo.conta} />}
          {processo.segcliente && (
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
          {(processo.designacao || processo?.seguimento || processo?.telefone || processo?.email) && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 0.75 }}>
              <Typography sx={{ color: 'text.secondary' }}>Origem:</Typography>
              <Stack spacing={0.5}>
                <Typography>
                  {processo?.designacao} {processo?.seguimento && `- ${processo?.seguimento}`}
                </Typography>
                {processo?.telefone ||
                  (processo?.email && (
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
                  ))}
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
      {processo.is_credito && processo?.credito && (
        <List>
          <ListItem disableGutters divider>
            <Typography variant="subtitle1">Info. crédito</Typography>
          </ListItem>
          {processo?.credito?.nproposta && <TextItem title="Nº de proposta:" text={processo?.credito?.nproposta} />}
          {processo?.credito?.segmento && <TextItem title="Segmento:" text={processo?.credito?.segmento} />}
          {processo?.credito?.linha?.linha && (
            <TextItem title="Linha de crédito:" text={processo?.credito?.linha?.linha} />
          )}
          {processo?.credito?.montantes && (
            <TextItem title="Montante:" text={fCurrency(processo?.credito?.montantes)} />
          )}
          {processo?.credito?.setor_atividade && (
            <TextItem title="Setor de atividade:" text={processo?.credito?.setor_atividade} />
          )}
          {processo?.credito?.finalidade && <TextItem title="Finalidade:" text={processo?.credito?.finalidade} />}
          {processo?.credito?.montante_aprovado && (
            <TextItem title="Montante aprovado:" text={fCurrency(processo?.credito?.montante_aprovado)} />
          )}
          {processo?.credito?.data_aprovacao && (
            <TextItem title="Data de aprovação:" text={ptDate(processo?.credito?.data_aprovacao)} />
          )}
          {processo?.credito?.montante_contratado && (
            <TextItem title="Montante contratado:" text={fCurrency(processo?.credito?.montante_contratado)} />
          )}
          {processo?.credito?.data_contratacao && (
            <TextItem title="Data de contratação:" text={ptDate(processo?.credito?.data_contratacao)} />
          )}
          {processo?.credito?.prazo_amortizacao && (
            <TextItem title="Prazo de amortização:" text={processo?.credito?.prazo_amortizacao} />
          )}
          {processo?.credito?.taxa_juro && (
            <TextItem title="Taxa de juro:" text={fPercent(processo?.credito?.taxa_juro)} />
          )}
          {processo?.credito?.garantia && <TextItem title="Garantia:" text={processo?.credito?.garantia} />}
          {processo?.credito?.escalao_decisao && (
            <TextItem title="Escalão de decisão:" text={processo?.credito?.escalao_decisao} />
          )}
          {processo?.credito?.situacao_final_mes && (
            <TextItem title="Situação final do mês:" text={processo?.credito?.situacao_final_mes} />
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
