// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';
// utils
import useToggle from '../../../hooks/useToggle';
import { ptDate } from '../../../utils/formatTime';
import { fCurrency, fPercent } from '../../../utils/formatNumber';
// Components
import Label from '../../../components/Label';
import GridItem from '../../../components/GridItem';
import { LabelSN } from '../../parametrizacao/Detalhes';
import { DefaultAction } from '../../../components/Actions';
import MetadadosCreditoForm from '../form/credito/form-metadados-credito';
import { SearchNotFoundSmall } from '../../../components/table/SearchNotFound';

// ---------------------------------------------------------------------------------------------------------------------

export default function MetadadosCredito({ dados, prazo = '', modificar = false, ids = null }) {
  const theme = useTheme();
  const { toggle: open, onOpen, onClose } = useToggle();

  const financeiroPrincipal = [
    { label: 'Valor da prestação', value: fCurrency(dados?.valor_prestacao), color: 'primary' },
    { label: 'Custo total', value: fCurrency(dados?.custo_total), color: 'info' },
    { label: 'TAEG', value: fPercent(dados?.taxa_taeg), color: 'error' },
    { label: 'TAN', value: fPercent(Number(dados?.taxa_tan)), color: 'warning' },
  ];

  const allCards = [
    {
      titulo: 'Regime & Isenções',
      dados: [
        ...(dados?.bonificado || dados?.revolving || dados?.jovem_bonificado || dados?.colaborador_empresa_parceira
          ? [
              {
                title: 'Regime',
                value: (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="flex-end">
                    {dados?.bonificado && <Label color="success">Bonificado</Label>}
                    {dados?.jovem_bonificado && <Label color="info">Jovem Bonificado</Label>}
                    {dados?.revolving && <Label color="warning">Revolving</Label>}
                    {dados?.colaborador_empresa_parceira && <Label color="secondary">Parceiro</Label>}
                  </Stack>
                ),
              },
            ]
          : []),
        { title: 'Isento Comissão', value: <LabelSN item={dados?.isento_comissao} /> },
        { title: 'Isento Imposto Selo', value: <LabelSN item={dados?.tem_isencao_imposto_selo} /> },
        {
          title: 'Capital Máx. Isento Selo',
          value:
            Number(dados?.capital_max_isento_imposto_selo) > 0 ? fCurrency(dados?.capital_max_isento_imposto_selo) : '',
        },
        { title: 'Conta DO Renda', value: dados?.conta_do_renda, bold: true },
      ],
    },
    {
      titulo: 'Ciclo & Prazos',
      dados: [
        { title: 'Data da 1ª prestação', value: ptDate(dados?.data_vencimento_prestacao1) },
        { title: 'Data de utilização', value: ptDate(dados?.data_utilizacao) },
        { title: 'Nº de prestações', value: dados?.numero_prestacao && `${dados?.numero_prestacao} meses`, bold: true },
        { title: 'Meses de vencimento', value: dados?.meses_vencimento && `${dados?.meses_vencimento} meses` },
        { title: 'Período de carência', value: dados?.periodo_carencia && `${dados?.periodo_carencia} meses` },
        { title: 'Prazo de utilização', value: dados?.prazo_utilizacao && `${dados?.prazo_utilizacao} meses` },
      ],
    },
    {
      titulo: 'Taxas Detalhadas',
      dados: [
        { title: 'Juro precário', value: fPercent(dados?.taxa_juro_precario) },
        {
          title: 'Juro desconto',
          value: Number(dados?.taxa_juro_desconto) > 0 ? fPercent(dados?.taxa_juro_desconto) : '',
          bold: true,
        },
        { title: 'Comissão de abertura', value: fPercent(dados?.taxa_comissao_abertura) },
        {
          title: 'Comissão de imobilização',
          value: Number(dados?.taxa_comissao_imobilizacao) > 0 ? fPercent(dados?.taxa_comissao_imobilizacao) : '',
        },
        { title: 'Taxa de imposto selo', value: fPercent(dados?.taxa_imposto_selo) },
        {
          title: 'Taxa imp. selo utilização',
          value: Number(dados?.taxa_imposto_selo_utilizacao) > 0 ? fPercent(dados?.taxa_imposto_selo_utilizacao) : '',
        },
      ],
    },
    {
      titulo: 'Cálculos (Valores)',
      dados: [
        { title: 'Valor do juro', value: fCurrency(dados?.valor_juro) },
        { title: 'Valor da comissão', value: fCurrency(dados?.valor_comissao) },
        { title: 'Valor do imposto selo', value: fCurrency(dados?.valor_imposto_selo) },
        { title: 'Prestação s/ desconto', value: fCurrency(dados?.valor_prestacao_sem_desconto) },
      ],
    },
    {
      id: 'objeto_ensino',
      titulo: 'Objeto & Ensino/Credibolsa',
      dados: [
        { title: 'Tipo de imóvel', value: dados?.tipo_imovel?.label || dados?.tipo_imovel || dados?.tipo_imovel_id },
        { title: 'Bem/Serviço', value: dados?.bem_servico_financiado },
        { title: 'Finalidade', value: dados?.finalidade_credito_habitacao },
        { title: 'Nível de formação', value: dados?.nivel_formacao },
        { title: 'Curso', value: dados?.designacao_curso },
        {
          title: 'Tranches da credibolsa',
          value: Number(dados?.montante_tranches_credibolsa) > 0 ? fCurrency(dados?.montante_tranches_credibolsa) : '',
        },
        { title: 'Estabelecimento de ensino', value: dados?.estabelecimento_ensino },
        { title: 'Localização', value: dados?.localizacao_estabelecimento_ensino },
      ],
    },
    {
      id: 'entidade_transferencia',
      titulo: 'Entidade & Transferência',
      dados: [
        { title: 'Empresa fornecedora', value: dados?.nome_empresa_fornecedora },
        { title: 'NIB', value: dados?.nib_vendedor_ou_fornecedor },
        { title: 'Banco/Instituição', value: dados?.instituicao_credito_conta_vendedor_ou_fornecedor },
        {
          title: 'Valor a transferir',
          value:
            Number(dados?.valor_transferir_conta_vendedor_ou_fornecedor) > 0
              ? fCurrency(dados?.valor_transferir_conta_vendedor_ou_fornecedor)
              : '',
          bold: true,
          color: 'primary.main',
        },
      ],
    },
  ];

  const cardsVisible = allCards.filter((card) => {
    if (card.id === 'objeto_ensino' || card.id === 'entidade_transferencia') {
      return card.dados.some((d) => d.value && d.value !== '');
    }
    return true;
  });

  return (
    <Box sx={{ p: 1 }}>
      {dados ? (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {financeiroPrincipal.map((item) => (
              <GridItem xs={6} sm={6} md={3} key={item.label}>
                <Card
                  sx={{
                    p: 1.5,
                    textAlign: 'center',
                    boxShadow: theme.customShadows.cardAlt,
                    bgcolor: alpha(theme.palette[item.color].main, 0.025),
                  }}
                >
                  <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                    {item.label}
                  </Typography>
                  <Typography variant="h6" sx={{ color: `${item.color}.main` }}>
                    {item.value || '---'}
                  </Typography>
                </Card>
              </GridItem>
            ))}
          </Grid>

          <Box
            gap={3}
            display="grid"
            gridTemplateColumns={{
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: `repeat(${cardsVisible?.length > 4 ? 3 : 2}, 1fr)`,
              xl: `repeat(${cardsVisible?.length > 4 ? 3 : cardsVisible?.length}, 1fr)`,
            }}
            alignItems="center"
          >
            {cardsVisible.map((card, index) => (
              <Card key={index} sx={{ height: '100%', boxShadow: theme.customShadows.cardAlt }}>
                <CardHeader
                  title={card.titulo}
                  titleTypographyProps={{
                    variant: 'subtitle2',
                    sx: { color: 'primary.main', textTransform: 'uppercase' },
                  }}
                  sx={{ py: 1.5, bgcolor: 'background.neutral', borderBottom: `1px solid ${theme.palette.divider}` }}
                />
                <CardContent sx={{ py: 2 }}>
                  <Stack spacing={1} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
                    {card.dados
                      .filter((d) => d.value)
                      .map((item, idx) => (
                        <Box
                          key={idx}
                          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
                        >
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>
                            {item.title}:
                          </Typography>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: item.bold ? 700 : 400,
                                color: item.color || 'text.primary',
                                wordBreak: 'break-word',
                              }}
                            >
                              {item.value}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        </>
      ) : (
        <SearchNotFoundSmall message="Nenhuma informação adicionada..." />
      )}

      {modificar && (
        <Stack direction="row" justifyContent="center" sx={{ mt: 4 }}>
          <DefaultAction variant="contained" button label={dados ? 'Editar' : 'Adicionar'} onClick={onOpen} />
        </Stack>
      )}

      {open && <MetadadosCreditoForm onClose={onClose} dados={{ ...dados, prazo }} ids={ids} />}
    </Box>
  );
}
