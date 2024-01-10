import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import NumbersIcon from '@mui/icons-material/Numbers';
import AbcOutlinedIcon from '@mui/icons-material/AbcOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import EditCalendarOutlinedIcon from '@mui/icons-material/EditCalendarOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import PermContactCalendarOutlinedIcon from '@mui/icons-material/PermContactCalendarOutlined';
// utils
import { newLineText } from '../../../utils/normalizeText';
import { ptDate, ptDateTime } from '../../../utils/formatTime';
import { fCurrency, fPercent } from '../../../utils/formatNumber';
// redux
import { useSelector } from '../../../redux/store';
// components
import Label from '../../../components/Label';
import { SearchNotFound404 } from '../../../components/table';
import { SkeletonPedidoCredito } from '../../../components/skeleton';

// ----------------------------------------------------------------------

const itemStyle = { py: 1, px: 1, my: 0.5, borderRadius: 0.5, backgroundColor: 'background.neutral' };

// ----------------------------------------------------------------------

export default function DadosGerais() {
  const { pedidoCC, isLoading } = useSelector((state) => state.cc);
  const { uos, colaboradores } = useSelector((state) => state.intranet);
  const credito = pedidoCC?.credito || null;
  const situacao = pedidoCC?.credito?.situacao || '';
  const uo = uos?.find((row) => Number(row?.id) === pedidoCC?.uo_id);
  const colabAR = colaboradores?.find((row) => row?.perfil_id === pedidoCC?.estados?.[0]?.perfil_id);
  const balcaoDomicilio = uos?.find((row) => Number(row?.balcao) === Number(pedidoCC?.balcao_domicilio));
  const criador = colaboradores?.find((row) => row?.perfil?.mail?.toLowerCase() === pedidoCC?.criador?.toLowerCase());
  return (
    <CardContent>
      {isLoading ? (
        <SkeletonPedidoCredito />
      ) : (
        <>
          {!pedidoCC ? (
            <SearchNotFound404 message="Pedido de crédito não encontrada..." noShadow />
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Grid container spacing={3} alignItems="center">
                  <DetailItem icon={<NumbersIcon />} title="Nº de entrada" text={pedidoCC?.n_entrada?.toString()} />
                  <DetailItem icon={<AbcOutlinedIcon />} title="Assunto" text={pedidoCC?.assunto} />
                  <DetailItem icon={<PushPinOutlinedIcon />} title="Estado atual" text={pedidoCC?.ultimo_estado} />
                  {uo?.label && (
                    <DetailItem
                      title="Unidade orgânica"
                      icon={<FlagOutlinedIcon />}
                      text={uo?.tipo === 'Agências' ? `Agência ${uo?.label}` : uo?.label}
                    />
                  )}
                  {pedidoCC?.criado_em && (
                    <DetailItem
                      title="Criado em:"
                      icon={<EventOutlinedIcon />}
                      text={ptDateTime(pedidoCC?.criado_em)}
                    />
                  )}
                  {criador?.perfil?.displayName && (
                    <DetailItem
                      title="Criado por"
                      text={criador?.perfil?.displayName}
                      icon={<AccountCircleOutlinedIcon />}
                    />
                  )}
                  {pedidoCC?.estado_origem && (
                    <DetailItem icon={<FlagOutlinedIcon />} title="Estado de origem" text={pedidoCC?.estado_origem} />
                  )}
                  {pedidoCC?.referencia && (
                    <DetailItem icon={<NumbersIcon />} title="Referência" text={pedidoCC?.referencia} />
                  )}
                  {pedidoCC?.data_entrada && (
                    <DetailItem
                      icon={<EventOutlinedIcon />}
                      title="Data de entrada:"
                      text={ptDate(pedidoCC?.data_entrada)}
                    />
                  )}
                  {pedidoCC?.modificado_em && (
                    <DetailItem
                      title="Última modificação"
                      icon={<EditCalendarOutlinedIcon />}
                      text={ptDateTime(pedidoCC?.modificado_em)}
                    />
                  )}
                  {pedidoCC?.modificador && (
                    <DetailItem
                      icon={<PermContactCalendarOutlinedIcon />}
                      title="Modificado por"
                      text={pedidoCC?.modificador}
                    />
                  )}
                  {pedidoCC?.data_ultima_transicao && (
                    <DetailItem
                      title="Última transição"
                      icon={<SwapHorizOutlinedIcon />}
                      text={ptDateTime(pedidoCC?.data_ultima_transicao)}
                    />
                  )}
                  {pedidoCC?.data_arquivamento && (
                    <DetailItem
                      title="Arquivado"
                      icon={<ArchiveOutlinedIcon />}
                      text={ptDateTime(pedidoCC?.data_arquivamento)}
                    />
                  )}
                </Grid>
              </Grid>

              {pedidoCC?.estados?.length === 1 &&
                pedidoCC?.estados?.[0]?.pareceres?.length === 0 &&
                (pedidoCC?.pendente || pedidoCC?.afeto || pedidoCC?.preso) && (
                  <Grid item xs={12}>
                    <Grid container spacing={3} alignItems="center">
                      {pedidoCC?.pendente && (
                        <DetailLabel label="Pendente" divide={pedidoCC?.afeto || pedidoCC?.preso} />
                      )}
                      {colabAR && pedidoCC?.preso && (
                        <DetailLabel label="Preso" colaborador={colabAR} divide={pedidoCC?.pendente} />
                      )}
                      {colabAR && pedidoCC?.afeto && !pedidoCC?.preso && (
                        <DetailLabel
                          label="Afeto"
                          colaborador={colabAR}
                          divide={pedidoCC?.pendente || pedidoCC?.preso}
                        />
                      )}
                    </Grid>
                  </Grid>
                )}

              {pedidoCC?.observacao && (
                <Grid item xs={12}>
                  <Paper sx={{ py: 0.75, px: 1, bgcolor: 'background.neutral', flexGrow: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography sx={{ color: 'text.secondary' }}>Obs:</Typography>
                      <Typography>{newLineText(pedidoCC?.observacao)}</Typography>
                    </Stack>
                  </Paper>
                </Grid>
              )}

              <Grid item xs={12} md={6}>
                {pedidoCC?.cliente && <TextItem title="Cliente:" text={pedidoCC?.cliente} />}
                {pedidoCC?.segmento && <TextItem title="Segmento:" text={pedidoCC?.segmento} />}
                {pedidoCC?.email && <TextItem title="Email:" text={pedidoCC?.email} />}
                {pedidoCC?.email_extrato && <TextItem title="Email p/ extrato:" text={pedidoCC?.email_extrato} />}
                {pedidoCC?.morada && <TextItem title="Morada:" text={pedidoCC?.morada} />}
                {balcaoDomicilio && (
                  <TextItem
                    title="Balcão de domicílio:"
                    text={`${balcaoDomicilio?.balcao} - ${balcaoDomicilio?.label}`}
                  />
                )}
                {pedidoCC?.conta_salario && <TextItem title="Conta salário:" text={pedidoCC?.conta_salario} />}
                {pedidoCC?.salario && <TextItem title="Salário:" text={fCurrency(pedidoCC?.salario)} />}
                {pedidoCC?.salario_conjuge && (
                  <TextItem title="Salário do conjuge:" text={fCurrency(pedidoCC?.salario_conjuge)} />
                )}
                {pedidoCC?.entidade_patronal_conjuge && (
                  <TextItem title="Entidade patronal conjuge:" text={pedidoCC?.entidade_patronal_conjuge} />
                )}
                {pedidoCC?.categoria_nivel && <TextItem title="Categoria/Nível:" text={pedidoCC?.categoria_nivel} />}
              </Grid>

              <Grid item xs={12} md={6}>
                {situacao && (
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ ...itemStyle }}>
                    <Typography sx={{ color: 'text.secondary' }}>Situação:</Typography>
                    <Label
                      color={
                        (situacao === 'Em análise' && 'default') ||
                        (situacao === 'Entrada' && 'default') ||
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
                <TextItem title="Montante solicitado:" text={fCurrency(credito?.montante_solicitado)} />
                <TextItem title="Prazo de amortização:" text={`${credito?.prazo_amortizacao} meses`} />
                <TextItem title="Taxa de juro:" text={fPercent(credito?.taxa_juros)} />
                <TextItem title="Linha de crédito:" text={credito?.linha} />
                <TextItem title="Setor de atividade:" text={credito?.setor_atividade} />
                <TextItem title="Finalidade:" text={credito?.finalidade} />
                {credito?.montante_aprovado && (
                  <TextItem title="Montante aprovado:" text={fCurrency(credito?.montante_aprovado)} />
                )}
                {credito?.data_aprovacao && (
                  <TextItem title="Data de aprovação:" text={ptDate(credito?.data_aprovacao)} />
                )}
                {credito?.escalao_decisao && <TextItem title="Escalão de decisão:" text={credito?.escalao_decisao} />}
                {credito?.montante_contratado && (
                  <TextItem title="Montante contratado:" text={fCurrency(credito?.montante_contratado)} />
                )}
                {credito?.data_contratacao && (
                  <TextItem title="Data de contratação:" text={ptDate(credito?.data_contratacao)} />
                )}
                {credito?.data_desistido && (
                  <TextItem title="Data de desistência:" text={ptDate(credito?.data_desistido)} />
                )}
                {credito?.data_indeferido && (
                  <TextItem title="Data de indeferimento:" text={ptDate(credito?.data_indeferido)} />
                )}
                {credito?.garantia && <TextItem title="Garantia:" text={credito?.garantia} />}
              </Grid>
            </Grid>
          )}
        </>
      )}
    </CardContent>
  );
}

// ----------------------------------------------------------------------

DetailItem.propTypes = { icon: PropTypes.node, text: PropTypes.string, title: PropTypes.string };

function DetailItem({ title, text, icon }) {
  return (
    <Grid item xs={12} sm={6} lg={4} xl={3}>
      <Stack spacing={1.5} direction="row" alignItems="center">
        <Box
          sx={{
            p: 1,
            margin: 'auto',
            display: 'flex',
            borderRadius: '50%',
            color: 'success.main',
            backgroundColor: (theme) => `${alpha(theme.palette.text.primary, 0.1)}`,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {title}
          </Typography>
          <Typography>{text}</Typography>
        </Box>
      </Stack>
    </Grid>
  );
}

// ----------------------------------------------------------------------

DetailLabel.propTypes = { label: PropTypes.string, divide: PropTypes.bool, colaborador: PropTypes.object };

function DetailLabel({ label, divide, colaborador = null }) {
  return (
    <Grid item xs={12} sm={divide ? 6 : 12}>
      <Stack>
        <Label
          sx={{ typography: 'body1', p: 2, textTransform: 'none' }}
          color={
            (label === 'Pendente' && 'warning') || (label === 'Afeto' && 'info') || (label === 'Preso' && 'success')
          }
        >
          {(label === 'Pendente' && 'Processo pendente') ||
            (label === 'Afeto' && (
              <>
                Este processo foi atribuído a<b>&nbsp;{colaborador?.perfil?.displayName}</b>
              </>
            )) ||
            (label === 'Preso' && (
              <>
                <b>{colaborador?.perfil?.displayName}</b>&nbsp;está trabalhando neste processo
              </>
            ))}
        </Label>
      </Stack>
    </Grid>
  );
}

TextItem.propTypes = { title: PropTypes.string, text: PropTypes.string, label: PropTypes.node };

export function TextItem({ title, text = '', label = null, ...sx }) {
  return (
    <Stack spacing={1} direction="row" justifyContent="left" alignItems="center" sx={{ ...itemStyle }} {...sx}>
      <Typography sx={{ color: 'text.secondary' }}>{title}</Typography>
      {text && <Typography>{text}</Typography>}
      {label}
    </Stack>
  );
}
