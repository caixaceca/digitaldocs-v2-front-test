import { useMemo } from 'react';
import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
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
import { DefaultAction } from '../../../components/Actions';
import { DialogTitleAlt } from '../../../components/CustomDialog';
import { Checked, CellChecked, Criado } from '../../../components/Panel';
//
import { colorProcesso } from '../../tabela/TableProcessos';
// _mock
import { dis } from '../../../_mock';

// ----------------------------------------------------------------------

const itemStyle = { py: 0.75, px: 1, my: 0.5, borderRadius: 0.5, backgroundColor: 'background.neutral', minHeight: 36 };

// ----------------------------------------------------------------------

DetalhesProcesso.propTypes = { isPS: PropTypes.bool, processo: PropTypes.object };

export default function DetalhesProcesso({ isPS, processo }) {
  const { origens } = useSelector((state) => state.parametrizacao);
  const { colaboradores, uos } = useSelector((state) => state.intranet);

  const entidadesList = useMemo(() => entidadesParse(processo?.entidade), [processo?.entidade]);
  const devolvido = useMemo(() => processo?.htransicoes?.[0]?.modo === 'Devolução', [processo?.htransicoes]);
  const origem = useMemo(() => origens?.find(({ id }) => id === processo?.origem_id), [origens, processo?.origem_id]);
  const uo = useMemo(() => uos?.find(({ id }) => id === Number(processo?.uo_origem_id)), [processo?.uo_origem_id, uos]);
  const bd = useMemo(
    () => uos?.find(({ balcao }) => balcao === processo?.balcao_domicilio)?.label,
    [processo?.balcao_domicilio, uos]
  );

  return (
    <>
      <List sx={{ pt: 0 }}>
        <ListItem disableGutters divider sx={{ pb: 0.5 }}>
          <Typography variant="subtitle1">Processo</Typography>
        </ListItem>
        <TextItem title="Nº de entrada:" text={processo?.numero_entrada} />
        <TextItem title="Agência/U.O:" text={uo?.tipo === 'Agências' ? `Agência ${uo?.label}` : uo?.label} />
        <TextItem title="Assunto:" text={processo?.fluxo} />
        {!isPS && !!processo?.data_entrada && (
          <TextItem
            title="Data de entrada:"
            text={`${ptDate(processo?.data_entrada)}${processo?.canal ? ` (Via ${processo?.canal})` : ''}`}
          />
        )}
        <TextItem title="Referência:" text={processo?.referencia} />
        {(processo?.estados?.length > 0 || processo?.estado) && (
          <TextItem
            title="Estado:"
            situacao={
              devolvido && (
                <Stack useFlexGap flexWrap="wrap" spacing={0.5} direction="row">
                  {devolvido && (
                    <Label color="error" startIcon={<ErrorOutlineIcon />}>
                      Devolvido
                    </Label>
                  )}
                </Stack>
              )
            }
            label={
              <Stack spacing={0.75} divider={<Divider flexItem sx={{ borderStyle: 'dotted' }} />}>
                {(processo?.estados?.length > 0 ? processo?.estados : [processo?.estado])?.map((row, index) => {
                  const colaboradorAfeto = colaboradores?.find((item) => item?.perfil_id === row?.perfil_id);
                  return (
                    <Stack key={`estado_${row?.id}_${index}`} sx={{ pl: 0.25 }}>
                      <Stack direction="row" alignItems="flex-end" useFlexGap flexWrap="wrap">
                        <Typography variant="subtitle1" sx={{ pr: 1 }}>
                          {row?.estado}
                        </Typography>
                        {row?.data_entrada && (
                          <Stack direction="row" sx={{ color: 'text.secondary' }}>
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
                      </Stack>

                      {colaboradorAfeto && (
                        <Typography sx={{ typography: 'caption', color: 'info.main' }}>
                          {row?.preso ? '' : 'Atribuído a '}
                          <Typography variant="spam" sx={{ fontWeight: 900 }}>
                            {baralharString(colaboradorAfeto?.perfil?.displayName)}
                          </Typography>
                          {row?.preso ? ' está trabalhando neste processo' : ''}.
                        </Typography>
                      )}

                      {row?.pendente && !row?.preso && (
                        <Typography sx={{ typography: 'caption', color: 'warning.main' }}>
                          Processo pendente: {row?.motivo_pendencia}
                        </Typography>
                      )}
                    </Stack>
                  );
                })}
              </Stack>
            }
          />
        )}
        {processo?.observacao && <TextItem title="Observação:" text={newLineText(processo?.observacao)} />}
        <TextItem
          title="Criado:"
          label={
            <>
              <Criado tipo="data" value={ptDateTime(processo?.criado_em)} />
              <Criado tipo="user" value={processo?.criador ?? ''} baralhar />
            </>
          }
        />
      </List>

      {(entidadesList ||
        processo?.email ||
        processo?.conta ||
        processo?.bi_cni ||
        processo?.doc_idp ||
        processo?.doc_ids ||
        processo?.cliente ||
        processo?.titular) && (
        <List>
          <ListItem disableGutters divider sx={{ pb: 0.5 }}>
            <Typography variant="subtitle1">Identificação</Typography>
          </ListItem>
          <TextItem text={processo?.titular} title={isPS ? 'Descrição:' : 'Titular:'} baralhar={!isPS} />
          <TextItem
            baralhar
            text={processo?.email}
            title={processo?.fluxo === 'Formulário' ? 'Codificação/Nome:' : 'Email:'}
          />
          {processo?.doc_idp && (
            <TextItem
              baralhar
              text={processo?.doc_idp?.toString()}
              title={`${dis?.find(({ id }) => id === processo?.tipo_doc_idp)?.label || 'Doc. primário'}:`}
            />
          )}
          {processo?.doc_ids && (
            <TextItem
              baralhar
              text={processo?.doc_ids?.toString()}
              title={`${dis?.find(({ id }) => id === processo?.tipo_doc_ids)?.label || 'Doc. secundário'}:`}
            />
          )}
          {entidadesList && <TextItem title="Nº de entidade(s):" text={entidadesList} baralhar />}
          {processo?.cliente && <TextItem title="Nº de cliente:" text={processo?.cliente?.toString()} baralhar />}
          {processo?.conta && <TextItem title="Nº de conta:" text={processo?.conta?.toString()} baralhar />}
          <TextItem
            title="Segmento:"
            text={(processo?.segmento === 'P' && 'Particular') || (processo?.segmento === 'E' && 'Empresa') || ''}
          />
          <TextItem title="Balcão de domicílio:" text={`${processo?.balcao_domicilio ?? ''}${bd ? ` - ${bd}` : ''}`} />
        </List>
      )}

      {((!!processo?.numero_operacao && !processo?.con) || !!processo?.operacao || !!origem) && (
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
                <Stack>
                  {origem?.designacao && <Typography>{origem.designacao}</Typography>}
                  {origem?.seguimento && <Typography>{origem.seguimento}</Typography>}
                  {(origem?.tipo || origem?.codigo || origem?.telefone || origem?.email) && (
                    <Stack useFlexGap spacing={1} flexWrap="wrap" direction="row" alignItems="center">
                      {origem?.codigo && <SubItem value={origem.codigo} label="Código:" />}
                      {origem?.tipo && <SubItem value={origem.tipo} label="Tipo:" />}
                      {origem?.telefone && <SubItem value={origem.telefone} label="Telefone:" />}
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
  situacao: PropTypes.node,
};

export function TextItem({ title = '', text = '', label = null, baralhar = false, situacao = null }) {
  return (title && text) || label ? (
    <Stack useFlexGap flexWrap="wrap" spacing={0.5} direction="row" alignItems="center" sx={{ ...itemStyle }}>
      {title && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {title}
        </Typography>
      )}
      {text && (
        <Typography
          sx={text === 'Não definido' && { fontStyle: 'italic', color: 'text.disabled', typography: 'body2' }}
        >
          {baralhar ? baralharString(text) : text}
        </Typography>
      )}
      {situacao ? <Box>{situacao}</Box> : ''}
      {label ? <Box sx={{ flexGrow: 1 }}>{label}</Box> : ''}
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
      <Typography variant="spam" sx={{ color: 'text.secondary' }}>
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
          <DefaultAction onClick={() => onOpen()} small color="info" label="INFO. DAS CONTAS" />
          {open && (
            <Dialog open onClose={onClose} fullWidth maxWidth="md">
              <DialogTitleAlt title="Contas para cativo" onClose={onClose} />
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
                                <Criado tipo="user" value={row?.cativador} baralhar />
                                <Criado tipo="data" value={ptDate(row?.data_cativo)} />
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
