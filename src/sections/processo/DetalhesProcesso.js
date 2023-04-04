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
import { fNumber, fCurrency } from '../../utils/formatNumber';
import { valorPorExtenso } from '../../utils/numeroPorExtenso';
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

  return (
    <Scrollbar>
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
          <ListItem disableGutters secondaryAction="">
            <Typography variant="subtitle1">Processo</Typography>
          </ListItem>
          <Divider />
          {processo?.referencia && (
            <ListItem disableGutters>
              <TextItem title="Referência:" text={processo.referencia} />
            </ListItem>
          )}
          {processo?.assunto && (
            <ListItem disableGutters>
              <TextItem title="Fluxo:" text={processo.assunto} />
            </ListItem>
          )}
          {processo?.data_entrada && (
            <ListItem disableGutters>
              <TextItem title="Data de entrada:" text={ptDate(processo.data_entrada)} />
            </ListItem>
          )}
          {processo?.nome && (
            <ListItem disableGutters>
              <Stack direction="row" alignItems="center" justifyContent="left" spacing={1}>
                <Typography sx={{ color: 'text.secondary' }}>Estado atual:</Typography>
                <Typography sx={{ fontWeight: 900, color: 'success.main' }}>
                  {processo.nome}
                  {colaboradorLock && (
                    <Typography sx={{ typography: 'body2', color: 'text.primary' }}>
                      <Typography variant="spam" sx={{ fontWeight: 900 }}>
                        {colaboradorLock?.perfil?.displayName}
                      </Typography>
                      &nbsp;está trabalhando neste processo
                    </Typography>
                  )}
                </Typography>
              </Stack>
            </ListItem>
          )}
          {(processo.criado_em || uo || criador) && (
            <ListItem disableGutters>
              <Stack direction="row" alignItems="center" spacing={1}>
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
            </ListItem>
          )}
          {processo?.obs && (
            <ListItem disableGutters>
              <Paper sx={{ p: 2, bgcolor: 'background.neutral', flexGrow: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography sx={{ color: 'text.secondary' }}>Obs:</Typography>
                  <Typography>{newLineText(processo.obs)}</Typography>
                </Stack>
              </Paper>
            </ListItem>
          )}
          {processo.ispendente && (
            <List>
              <Paper sx={{ p: 2, bgcolor: 'background.neutral', flexGrow: 1 }}>
                <ListItem disableGutters>
                  <Label color="warning">
                    <InfoOutlinedIcon sx={{ width: 15, mr: 1 }} /> Processo pendente
                  </Label>
                </ListItem>
                {motivo && (
                  <ListItem disableGutters>
                    <TextItem title="Motivo:" text={motivo?.motivo} />
                  </ListItem>
                )}
                {processo.mobs && (
                  <ListItem disableGutters>
                    <TextItem title="Obs:" text={processo.mobs} />
                  </ListItem>
                )}
              </Paper>
            </List>
          )}
        </List>
      )}
      {(processo?.titular ||
        processo?.docidp ||
        processo?.docids ||
        processo?.bi_cni ||
        _entidades ||
        processo?.cliente ||
        processo?.conta) && (
        <List>
          <ListItem disableGutters>
            <Typography variant="subtitle1">Identificação</Typography>
          </ListItem>
          <Divider />
          {processo.titular && (
            <ListItem disableGutters>
              <TextItem title="Titular:" text={processo.titular} />
            </ListItem>
          )}
          {(processo.docidp || processo.docids) && (
            <ListItem disableGutters>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography sx={{ color: 'text.secondary' }}>Doc. identificação:</Typography>
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
            </ListItem>
          )}
          {_entidades && (
            <ListItem disableGutters>
              <TextItem title="Nº de entidade(s):" text={_entidades} />
            </ListItem>
          )}
          {processo.cliente && (
            <ListItem disableGutters>
              <TextItem title="Nº de cliente:" text={processo.cliente} />
            </ListItem>
          )}
          {processo.conta && (
            <ListItem disableGutters>
              <TextItem title="Nº de conta:" text={processo.conta} />
            </ListItem>
          )}
        </List>
      )}
      {(processo.operacao || processo?.noperacao) && (
        <List>
          <ListItem disableGutters>
            <Typography variant="subtitle1">Operação</Typography>
          </ListItem>
          <Divider />
          {processo.noperacao && (
            <ListItem disableGutters>
              <TextItem title="Nº de operação:" text={processo.noperacao} />
            </ListItem>
          )}
          {processo.operacao && (
            <ListItem disableGutters>
              <TextItem title="Descrição:" text={processo.operacao} />
            </ListItem>
          )}
          {(processo.designacao || processo?.seguimento || processo?.telefone || processo?.email) && (
            <ListItem disableGutters>
              <Stack direction="row" alignItems="center" spacing={1}>
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
            </ListItem>
          )}
          {processo.valor > 0 && (
            <ListItem disableGutters>
              <ValorItem title="Valor para cativo:" valor={processo.valor} />
            </ListItem>
          )}
          {processo.saldoca > 0 && (
            <ListItem disableGutters>
              <ValorItem
                title={processo.situacao === 'X' ? 'Valor cativado:' : 'Saldo disponível p/ cativo:'}
                valor={processo.saldoca}
                contas={processo.situacao === 'X' ? processo?.contasCativado : processo?.contasEleitosCativo}
              />
            </ListItem>
          )}
        </List>
      )}
      {processo.agendado && (
        <List>
          <ListItem disableGutters>
            <Typography variant="subtitle1">Agendamento</Typography>
          </ListItem>
          <Divider />
          {processo.periodicidade && (
            <ListItem disableGutters>
              <TextItem title="Periodicidade:" text={processo.periodicidade} />
            </ListItem>
          )}
          {processo.diadomes && (
            <ListItem disableGutters>
              <TextItem title="Dia do mês para execução:" text={processo.diadomes} />
            </ListItem>
          )}
          {processo.data_inicio && (
            <ListItem disableGutters>
              <TextItem title="Data de início:" text={ptDate(processo.data_inicio)} />
            </ListItem>
          )}
          {processo.data_arquivamento && (
            <ListItem disableGutters>
              <TextItem title="Data de término:" text={ptDate(processo.data_arquivamento)} />
            </ListItem>
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
    <Stack direction="row" alignItems="center" spacing={1}>
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
