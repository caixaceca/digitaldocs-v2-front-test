import { useMemo } from 'react';
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
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
// utils
import { fNumber, fCurrency } from '../../../utils/formatNumber';
import { ptDate, fToNow, ptDateTime } from '../../../utils/formatTime';
import { newLineText, entidadesParse, baralharString, valorPorExtenso } from '../../../utils/formatText';
// redux
import { useSelector } from '../../../redux/store';
// hooks
import useToggle from '../../../hooks/useToggle';
// components
import Label from '../../../components/Label';
import { DefaultAction, DTFechar } from '../../../components/Actions';
import { Checked, CellChecked, Criado } from '../../../components/Panel';
//
import { colorProcesso } from '../../tabela/TableProcessos';
// _mock
import { dis } from '../../../_mock';

// ----------------------------------------------------------------------

const itemStyle = { py: 0.75, px: 1, my: 0.5, borderRadius: 0.5, backgroundColor: 'background.neutral' };

// ----------------------------------------------------------------------

DetalhesProcesso.propTypes = { isPS: PropTypes.bool, processo: PropTypes.object };

export default function DetalhesProcesso({ isPS, processo }) {
  const { colaboradores, uos } = useSelector((state) => state.intranet);
  const { origens, isAdmin, isAuditoria } = useSelector((state) => state.parametrizacao);

  const entidadesList = useMemo(() => entidadesParse(processo?.entidade), [processo?.entidade]);
  const devolvido = useMemo(() => processo?.htransicoes?.[0]?.modo === 'Devolução', [processo?.htransicoes]);
  const origem = useMemo(() => origens?.find((row) => row?.id === processo?.origem_id), [origens, processo?.origem_id]);
  const uo = useMemo(
    () => uos?.find((row) => Number(row?.id) === Number(processo?.uo_origem_id)),
    [processo?.uo_origem_id, uos]
  );
  const criador = useMemo(
    () => colaboradores?.find((row) => row?.perfil?.mail?.toLowerCase() === processo?.criador?.toLowerCase()),
    [colaboradores, processo?.criador]
  );

  return (
    <>
      <List sx={{ pt: 0 }}>
        <ListItem disableGutters divider sx={{ pb: 0.5 }}>
          <Typography variant="subtitle1">Processo</Typography>
        </ListItem>
        {isAdmin || isAuditoria ? <TextItem title="Versão:" text={processo?.versao} /> : ''}
        <TextItem title="Nº de entrada:" text={processo?.numero_entrada} />
        <TextItem title="Agência/U.O:" text={uo?.tipo === 'Agências' ? `Agência ${uo?.label}` : uo?.label} />
        <TextItem title="Assunto:" text={processo?.assunto} />
        <TextItem title="Criado em:" text={processo?.criado_em ? ptDateTime(processo?.criado_em) : ''} />
        <TextItem title="Criado por:" text={criador?.perfil?.displayName} baralhar />
        {!isPS && !!processo?.data_entrada && (
          <TextItem
            title="Data de entrada:"
            text={`${ptDate(processo?.data_entrada)}${processo?.canal ? ` (Via ${processo?.canal})` : ''}`}
          />
        )}
        <TextItem title="Referência:" text={processo?.referencia} />
        {(processo?.estados?.length > 0 || processo?.estado_processo) && (
          <TextItem
            title="Situação:"
            label={
              <Stack spacing={0.75} sx={{ flexGrow: 1 }} divider={<Divider flexItem sx={{ borderStyle: 'dotted' }} />}>
                {(processo?.estados?.length > 0 ? processo?.estados : [processo?.estado_processo])?.map(
                  (row, index) => {
                    const colaboradorAfeto = colaboradores?.find((item) => item?.perfil_id === row?.perfil_id);
                    return (
                      <Stack key={`estado_${row?.id}_${index}`} spacing={0.5}>
                        <Stack direction="row" alignItems="center" useFlexGap flexWrap="wrap">
                          <Typography variant="subtitle1" sx={{ pr: 1 }}>
                            {row?.estado}
                          </Typography>
                          {devolvido && (
                            <Label color="error" startIcon={<ErrorOutlineIcon />}>
                              Devolvido
                            </Label>
                          )}
                        </Stack>
                        {row?.data_entrada && (
                          <Stack direction="row" spacing={1} sx={{ color: 'text.secondary' }}>
                            <Criado caption tipo="data" value={ptDateTime(row?.data_entrada)} />
                            {row?.estado !== 'Arquivo' && (
                              <Criado
                                caption
                                tipo="time"
                                value={fToNow(row?.data_entrada)}
                                sx={{ color: colorProcesso(processo?.cor) }}
                              />
                            )}
                          </Stack>
                        )}
                        {colaboradorAfeto && (
                          <Typography sx={{ typography: 'caption', color: 'info.main' }}>
                            {row?._lock ? '' : 'Atribuído a '}
                            <Typography variant="spam" sx={{ fontWeight: 900 }}>
                              {baralharString(colaboradorAfeto?.perfil?.displayName)}
                            </Typography>
                            {row?._lock ? ' está trabalhando neste processo' : ''}.
                          </Typography>
                        )}
                      </Stack>
                    );
                  }
                )}
                {processo?.pendente && processo?.motivo && (
                  <Stack direction="column" alignItems="start" sx={{ pt: 0.25 }}>
                    <Label color="warning" startIcon={<InfoOutlinedIcon />}>
                      Pendente: {processo?.motivo}
                    </Label>
                    {!!processo?.observacao_motivo_pendencia && (
                      <Typography variant="body2">{processo?.observacao_motivo_pendencia}</Typography>
                    )}
                  </Stack>
                )}
              </Stack>
            }
          />
        )}
        {processo?.observacao && <TextItem title="Obs:" text={newLineText(processo?.observacao)} />}
      </List>

      {(entidadesList ||
        processo?.email ||
        processo?.conta ||
        processo?.bi_cni ||
        processo?.doc_idp ||
        processo?.doc_ids ||
        processo?.cliente ||
        processo?.titular ||
        processo?.segmento) && (
        <List>
          <ListItem disableGutters divider sx={{ pb: 0.5 }}>
            <Typography variant="subtitle1">Identificação</Typography>
          </ListItem>
          <TextItem text={processo?.titular} title={isPS ? 'Descrição:' : 'Titular:'} baralhar={!isPS} />
          <TextItem
            baralhar
            text={processo?.email}
            title={processo?.assunto === 'Formulário' ? 'Codificação/Nome:' : 'Email:'}
          />
          {processo?.doc_idp && (
            <TextItem
              baralhar
              text={processo?.doc_idp?.toString()}
              title={`${dis?.find((row) => row.id === processo?.tipo_doc_idp)?.label || 'Doc. primário'}:`}
            />
          )}
          {processo?.doc_ids && (
            <TextItem
              baralhar
              text={processo?.doc_ids?.toString()}
              title={`${dis?.find((row) => row.id === processo?.tipo_doc_ids)?.label || 'Doc. secundário'}:`}
            />
          )}
          {entidadesList && <TextItem title="Nº de entidade(s):" text={entidadesList} baralhar />}
          {processo?.cliente && <TextItem title="Nº de cliente:" text={processo?.cliente?.toString()} baralhar />}
          {processo?.conta && <TextItem title="Nº de conta:" text={processo?.conta?.toString()} baralhar />}
          <TextItem
            title="Segmento:"
            text={(processo?.segmento === 'P' && 'Particular') || (processo?.segmento === 'E' && 'Empresa') || ''}
          />
        </List>
      )}

      {(!!processo?.numero_operacao || !!processo?.operacao || !!origem) && (
        <List>
          <ListItem disableGutters divider sx={{ pb: 0.5 }}>
            <Typography variant="subtitle1">Operação</Typography>
          </ListItem>
          <TextItem title="Nº da operação:" text={processo?.numero_operacao} />
          <TextItem title="Descrição:" text={processo?.operacao} />
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
          <TextItem title="Periodicidade:" text={processo?.periodicidade} />
          <TextItem title="Dia do mês p/ execução:" text={processo?.dia_mes} />
          {processo?.data_inicio && <TextItem title="Data de início:" text={ptDate(processo?.data_inicio)} />}
          {processo?.data_arquivamento && (
            <TextItem title="Data de término:" text={ptDate(processo?.data_arquivamento)} />
          )}
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
  baralhar: PropTypes.bool,
};

export function TextItem({ title = '', text = '', label = null, baralhar = false, ...sx }) {
  return (title && text) || label ? (
    <Stack spacing={1} direction="row" alignItems="center" sx={{ ...itemStyle }} {...sx}>
      {title && <Typography sx={{ color: 'text.secondary' }}>{title}</Typography>}
      {text && <Typography>{baralhar ? baralharString(text) : text}</Typography>}
      {label}
    </Stack>
  ) : (
    ''
  );
}

// ----------------------------------------------------------------------

SubItem.propTypes = { value: PropTypes.string, label: PropTypes.string };

export function SubItem({ value, label }) {
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
          &nbsp;({valorPorExtenso(Number(valor || 0))})
        </Typography>
      </Typography>
      {cativos?.length > 0 && (
        <>
          <DefaultAction handleClick={onOpen} small color="info" label="INFO. DAS CONTAS" />
          {open && (
            <Dialog open onClose={onClose} fullWidth maxWidth="md">
              <DTFechar title="Contas para cativo" handleClick={() => onClose()} />
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
                          <CellChecked check={row.enviado_banka} />
                          <TableCell align="center">
                            {row?.executado ? (
                              <>
                                {row?.cativador && <Criado tipo="user" value={row?.cativador} baralhar />}
                                {row.data_cativo && <Criado tipo="data" value={ptDate(row.data_cativo)} />}
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
          )}
        </>
      )}
    </Stack>
  );
}
