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
import { colorLabel } from '../../../utils/getColorPresets';
import { ptDate, fToNow, ptDateTime } from '../../../utils/formatTime';
import { fNumber, fCurrency, fPercent } from '../../../utils/formatNumber';
import { newLineText, entidadesParse, baralharString, numeroPorExtenso } from '../../../utils/formatText';
// redux
import { useSelector } from '../../../redux/store';
// hooks
import useToggle from '../../../hooks/useToggle';
// components
import Label from '../../../components/Label';
import { Checked, Criado } from '../../../components/Panel';
import { DefaultAction, DTFechar } from '../../../components/Actions';
//
import { colorProcesso } from '../../tabela/TableProcessos';
// _mock
import { dis, estadosCivis } from '../../../_mock';

// ----------------------------------------------------------------------

const itemStyle = { py: 0.75, px: 1, my: 0.5, borderRadius: 0.5, backgroundColor: 'background.neutral' };

// ----------------------------------------------------------------------

DetalhesProcesso.propTypes = { isPS: PropTypes.bool, processo: PropTypes.object };

export default function DetalhesProcesso({ isPS, processo }) {
  const { colaboradores, uos } = useSelector((state) => state.intranet);
  const { origens, isAdmin } = useSelector((state) => state.parametrizacao);

  const con = useMemo(() => processo?.con || null, [processo?.con]);
  const credito = useMemo(() => processo?.credito || null, [processo?.credito]);
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
        {isAdmin && <TextItem title="Versão:" text={processo?.versao} />}
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
                          {processo?.estado_processo?.estado === 'Arquivo' && processo?.historico && (
                            <Label color="info" startIcon={<ErrorOutlineIcon sx={{ transform: 'rotate(180deg)' }} />}>
                              Histórico
                            </Label>
                          )}
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

      {(!!processo?.numero_operacao || !!con || !!processo?.operacao || !!origem) && (
        <List>
          <ListItem disableGutters divider sx={{ pb: 0.5 }}>
            <Typography variant="subtitle1">Operação</Typography>
          </ListItem>
          <TextItem title="Nº da operação:" text={processo?.numero_operacao} />
          {con && processo?.valor && <TextItem title="Valor:" text={fCurrency(processo?.valor)} />}
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

      {!!credito && (
        <List>
          <ListItem disableGutters divider sx={{ pb: 0.5 }}>
            <Typography variant="subtitle1">Info. crédito</Typography>
          </ListItem>
          {credito?.situacao_final_mes && (
            <TextItem
              title="Situação:"
              label={<Label color={colorLabel(credito?.situacao_final_mes)}>{credito?.situacao_final_mes}</Label>}
            />
          )}
          <TextItem title="Nº de proposta:" text={credito?.nproposta} />
          <TextItem title="Segmento:" text={credito?.segmento} />
          <TextItem title="Linha de crédito:" text={credito?.linha} />
          {credito?.montante_solicitado && (
            <TextItem title="Montante solicitado:" text={fCurrency(credito?.montante_solicitado)} />
          )}
          <TextItem title="Entidade patronal:" text={credito?.setor_atividade} />
          <TextItem title="Finalidade:" text={credito?.finalidade} />
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
          <TextItem title="Prazo de amortização:" text={credito?.prazo_amortizacao} />
          {credito?.taxa_juro && <TextItem title="Taxa de juro:" text={fPercent(credito?.taxa_juro)} />}
          <TextItem title="Garantia:" text={credito?.garantia} />
          <TextItem title="Escalão de decisão:" text={credito?.escalao_decisao} />
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

      {!!con && (
        <List>
          <ListItem disableGutters divider sx={{ pb: 0.5 }}>
            <Typography variant="subtitle1">Dados do ordenante</Typography>
          </ListItem>
          <TextItem title="Depositante é o próprio titular:" text={con?.titular_ordenador ? 'SIM' : 'NÃO'} />
          <TextItem title="Titular da conta beneficiária é residente:" text={con?.residente ? 'SIM' : 'NÃO'} />
          <TextItem title="Nome:" text={con?.ordenador} />
          <TextItem
            title="Tipo doc. identificação:"
            text={dis?.find((row) => row.id === con?.tipo_docid)?.label || con?.tipo_docid}
          />
          <TextItem title="Nº doc. identificação:" text={con?.docid} />
          <TextItem title="NIF:" text={con?.nif} />
          <TextItem title="Nome do Pai:" text={con?.pai} />
          <TextItem title="Nome da Mãe:" text={con?.mae} />
          <TextItem
            title="Estado civil:"
            text={estadosCivis?.find((row) => row.id === con?.estado_civil)?.label || con?.estado_civil}
          />
          {con?.data_nascimento && <TextItem title="Data nascimento:" text={ptDate(con?.data_nascimento)} />}
          <TextItem title="Nacionalidade:" text={con?.nacionalidade} />
          <TextItem title="Local/País de nascimento:" text={con?.local_pais_nascimento} />
          <TextItem title="Morada:" text={con?.morada} />
          <TextItem title="Profissão:" text={con?.profissao} />
          <TextItem title="Local de trabalho:" text={con?.local_trabalho} />
          <TextItem title="Telefone:" text={con?.telefone} />
          <TextItem title="Telemóvel:" text={con?.telemovel} />
          <TextItem title="Email(s):" text={con?.emails} />
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
  baralhar: PropTypes.bool,
};

function TextItem({ title = '', text = '', label = null, baralhar = false, ...sx }) {
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
          &nbsp;({numeroPorExtenso(valor)})
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
                          <TableCell align="center">
                            <Checked check={row?.enviado_banka} />
                          </TableCell>
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
