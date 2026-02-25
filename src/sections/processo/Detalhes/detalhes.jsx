import { useMemo } from 'react';
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
// utils
import { tiposDocumentos } from '@/_mock';
import { fNumber, fCurrency } from '@/utils/formatNumber';
import { ptDate, fToNow, ptDateTime } from '@/utils/formatTime';
import { entidadesParse, valorPorExtenso } from '@/utils/formatText';
// redux
import useToggle from '@/hooks/useToggle';
import { useSelector } from '@/redux/store';
// components
import Label from '@/components/Label';
import { DefaultAction } from '@/components/Actions';
import { DialogTitleAlt } from '@/components/CustomDialog';
import { Checked, CellChecked, Criado } from '@/components/Panel';
//
import { colorProcesso } from '../../tabela/table-processos';

const itemStyle = { py: 0.75, px: 1, my: 0.5, borderRadius: 0.5, backgroundColor: 'background.neutral', minHeight: 36 };

// ---------------------------------------------------------------------------------------------------------------------

export default function DetalhesProcesso({ isPS = false, processo, versoes = false }) {
  const { origens } = useSelector((state) => state.parametrizacao);
  const { colaboradores } = useSelector((state) => state.intranet);

  const { estados = [], estado = null } = processo;
  const { domicilio, origem_id: origemId = '', fluxo = '', uo } = processo;
  const { entidade = '', cliente = '', conta = '', titular = '', email = '', observacao = '' } = processo;
  const { doc_idp: docIdP = '', tipo_doc_idp: tipoIdP, doc_ids: docIdS, tipo_doc_ids: tipoIdS } = processo;

  const entidadesList = useMemo(() => entidadesParse(entidade), [entidade]);
  const origem = useMemo(() => origens?.find(({ id }) => id === origemId), [origens, origemId]);

  return (
    <>
      {(!versoes ||
        (versoes && (uo?.label || fluxo || observacao || processo?.data_entrada || processo?.duplicado))) && (
        <List sx={{ pt: 0 }}>
          <ListItem disableGutters divider sx={{ pb: 0.5 }}>
            <Typography variant="subtitle1">Processo</Typography>
          </ListItem>
          <TextItem title="Nº de entrada:" text={processo?.numero_entrada} />
          <TextItem title="Agência/U.O:" text={uo?.nome} />
          <TextItem title="Assunto:" text={fluxo} />
          {!isPS && !!processo?.data_entrada && (
            <TextItem
              title="Data de entrada:"
              text={`${ptDate(processo?.data_entrada)}${processo?.canal ? ` (Via ${processo?.canal})` : ''}`}
            />
          )}
          <TextItem title="Referência:" text={processo?.referencia} />
          {(estados?.length > 0 || estado) && (
            <TextItem
              title="Estado:"
              situacao={
                (estado?.via_devolucao || estado?.duplicado || estado?.via_resgate) && (
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {estado?.via_resgate && <Label color="warning">Processo Resgatado</Label>}
                    {estado?.via_devolucao && <Label color="error">Processo devolvido</Label>}
                    {estado?.duplicado && <Duplicado ccDup={estado?.ccDup} dataDup={estado?.dataDup} />}
                  </Stack>
                )
              }
              label={
                <Stack spacing={0.75} divider={<Divider flexItem sx={{ borderStyle: 'dotted' }} />}>
                  {(estados?.length > 0 ? estados : [estado?.duplicado ? null : estado])?.map((row, index) => {
                    const colaboradorAfeto = colaboradores?.find(({ perfil_id: pid }) => pid === row?.perfil_id);
                    return (
                      <Stack key={`estado_${row?.id}_${index}`} sx={{ pl: 0.25 }}>
                        <Stack direction="row" alignItems="flex-end" useFlexGap flexWrap="wrap">
                          <Typography variant="subtitle2" sx={{ pr: 1 }}>
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
                                  sx={{ pr: 0, color: colorProcesso(processo?.cor) }}
                                />
                              )}
                            </Stack>
                          )}
                        </Stack>

                        {colaboradorAfeto && (
                          <Typography variant="caption" sx={{ color: 'info.main' }}>
                            {row?.preso ? '' : 'Atribuído a '}
                            <Typography component="span" variant="caption" sx={{ fontWeight: 900 }}>
                              {colaboradorAfeto?.nome}
                            </Typography>
                            {row?.preso ? ' está trabalhando neste processo' : ''}.
                          </Typography>
                        )}

                        {row?.pendente && !row?.preso && (
                          <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                            <Typography variant="caption">Pendente: </Typography>
                            {row?.motivo_pendencia}
                          </Typography>
                        )}
                      </Stack>
                    );
                  })}
                  {estados?.length > 0 && estado?.estado && (
                    <Stack>
                      <Label color="info">Focal Point: {estado?.estado}</Label>
                    </Stack>
                  )}
                </Stack>
              }
            />
          )}
          <TextItem title="Observação:" text={observacao} />
          {(processo?.criado_em || processo?.criador) && (
            <TextItem
              title="Criado:"
              label={
                <>
                  <Criado tipo="data" value={ptDateTime(processo?.criado_em)} sx={{ pr: 0 }} />
                  <Criado tipo="user" value={processo?.criador ?? ''} sx={{ pr: 0 }} />
                </>
              }
            />
          )}
        </List>
      )}

      {(email || conta || titular || cliente || entidadesList || docIdP || docIdS) && (
        <List>
          <ListItem disableGutters divider sx={{ pb: 0.5 }}>
            <Typography variant="subtitle1">Identificação</Typography>
          </ListItem>
          <TextItem text={titular} title={isPS ? 'Descrição:' : 'Titular:'} />
          <TextItem text={email} title={fluxo === 'Formulário' ? 'Codificação/Nome:' : 'Email:'} />
          {docIdP && (
            <TextItem
              text={docIdP?.toString()}
              title={`${tiposDocumentos?.find(({ id }) => id === tipoIdP)?.label || 'Doc. primário'}:`}
            />
          )}
          {docIdS && (
            <TextItem
              text={docIdS?.toString()}
              title={`${tiposDocumentos?.find(({ id }) => id === tipoIdS)?.label || 'Doc. secundário'}:`}
            />
          )}
          {entidadesList && <TextItem title="Nº de entidade(s):" text={entidadesList} />}
          {cliente && <TextItem title="Nº de cliente:" text={cliente?.toString()} />}
          {conta && <TextItem title="Nº de conta:" text={conta?.toString()} />}
          <TextItem
            title="Segmento:"
            text={(processo?.segmento === 'P' && 'Particular') || (processo?.segmento === 'E' && 'Empresa') || ''}
          />
          <TextItem
            title="Balcão de domicílio:"
            text={`${domicilio?.balcao || ''}${domicilio?.label ? ` - ${domicilio?.label}` : ''}`}
          />
        </List>
      )}

      {((!!processo?.numero_operacao && !processo?.con) || !!processo?.operacao || !!origem) && (
        <List>
          <ListItem disableGutters divider sx={{ pb: 0.5 }}>
            <Typography variant="subtitle1">Operação</Typography>
          </ListItem>
          <TextItem title="Nº da operação:" text={processo?.numero_operacao} />
          <TextItem title="Descrição:" text={processo?.operacao} />
          {origem && origem?.id === origemId && (
            <TextItem
              title="Origem:"
              label={
                <Stack>
                  {origem?.designacao && <Typography>{origem.designacao}</Typography>}
                  {origem?.seguimento && <Typography>{origem.seguimento}</Typography>}
                  {(origem?.tipo || origem?.codigo || origem?.telefone || origem?.email) && (
                    <Stack useFlexGap spacing={1} flexWrap="wrap" direction="row" alignItems="center">
                      <SubItem value={origem.codigo} label="Código:" />
                      <SubItem value={origem.tipo} label="Tipo:" />
                      <SubItem value={origem.telefone} label="Telefone:" />
                      <SubItem value={origem.email} label="Email:" />
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

// ---------------------------------------------------------------------------------------------------------------------

export function TextItem({ title = '', text = '', label = null, situacao = null, sx = null }) {
  return (title && text) || label ? (
    <Stack useFlexGap flexWrap="wrap" spacing={0.5} direction="row" alignItems="center" sx={{ ...itemStyle, ...sx }}>
      {title && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {title}
        </Typography>
      )}
      {text && (
        <Typography
          variant="body2"
          sx={text === 'Não definido' && { fontStyle: 'italic', color: 'text.disabled', whiteSpace: 'pre-line' }}
        >
          {text}
        </Typography>
      )}
      {situacao ? <Box>{situacao}</Box> : ''}
      {label ? <Box sx={{ flexGrow: 1 }}>{label}</Box> : ''}
    </Stack>
  ) : null;
}

// ---------------------------------------------------------------------------------------------------------------------

export function Duplicado({ ccDup, dataDup }) {
  return (
    <>
      <Label color="error">Eliminado</Label>
      {(ccDup || dataDup) && (
        <Stack direction="row" sx={{ color: 'text.secondary' }}>
          <Criado caption tipo="user" value={ccDup} />
          <Criado caption tipo="data" value={ptDateTime(dataDup)} sx={{ pr: 0 }} />
        </Stack>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function SubItem({ value, label }) {
  return value ? (
    <Typography variant="body2">
      <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      &nbsp;{value}
    </Typography>
  ) : null;
}

// ---------------------------------------------------------------------------------------------------------------------

function ValorItem({ title, valor, cativos }) {
  const { toggle: open, onOpen, onClose } = useToggle();
  return (
    <Stack
      useFlexGap
      flexWrap="wrap"
      spacing={0.5}
      direction="row"
      alignItems="center"
      justifyContent="left"
      sx={{ ...itemStyle }}
    >
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {title}
      </Typography>
      <Typography>
        {fCurrency(valor)}
        <Typography component="span" variant="body2">
          &nbsp;({valorPorExtenso(Number(valor || 0))})
        </Typography>
      </Typography>
      {cativos?.length > 0 && (
        <>
          <DefaultAction button onClick={() => onOpen()} small color="info" label="Contas" />
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
                            {fNumber(row?.saldo, 2)} {row?.moeda}
                          </TableCell>
                          <TableCell align="right">{fCurrency(row?.saldo_cve)}</TableCell>
                          <CellChecked check={row.enviado_banka} />
                          <TableCell align="center">
                            {row?.executado ? (
                              <>
                                <Criado tipo="user" value={row?.cativador} sx={{ pr: 0 }} />
                                <Criado tipo="data" value={ptDate(row?.data_cativo)} sx={{ pr: 0 }} />
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
