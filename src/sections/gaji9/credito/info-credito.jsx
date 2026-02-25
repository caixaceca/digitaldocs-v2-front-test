// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
// utils
import { ptDate } from '@/utils/formatTime';
import { useSelector } from '@/redux/store';
import { fCurrency, fPercent } from '@/utils/formatNumber';
//
import { labelTitular } from '../applySortFilter';
import { Resgisto, LabelSN } from '../../parametrizacao/Detalhes';

// ---------------------------------------------------------------------------------------------------------------------

export default function InfoCredito() {
  const { credito, isLoading } = useSelector((state) => state.gaji9);
  const { metadados = null } = credito || {};

  const sections = [
    {
      title: 'Informações do Cliente',
      content: [
        { label: 'Nº de cliente', value: credito?.cliente },
        { label: 'Conta DO crédito', value: credito?.conta_do },
        { label: 'Conta DO débito', value: credito?.conta_do_renda },
        {
          label: 'Tipo de titular',
          value: labelTitular(credito?.tipo_titular, credito?.consumidor),
        },
        { label: 'Email', value: credito?.morada_eletronico_cliente },
        { label: 'Morada', value: credito?.morada_cliente },
        { label: 'Balcão domicílio', value: credito?.balcao_domicilio },
      ],
    },
    {
      title: 'Detalhes do Crédito',
      content: [
        { label: 'Componente', value: credito?.rotulo || credito?.componente },
        { label: 'Montante', value: fCurrency(credito?.montante) },
        {
          label: 'Prémio do seguro',
          value: credito?.valor_premio_seguro ? fCurrency(credito?.valor_premio_seguro) : '',
        },
        { label: 'Nº de prestações', value: credito?.numero_prestacao },
        { label: 'Valor da prestação', value: fCurrency(credito?.valor_prestacao) },
        { label: 'Valor prestação sem desconto', value: fCurrency(credito?.valor_prestacao_sem_desconto) },
        { label: 'Vencimento da 1ª prestação', value: ptDate(credito?.data_vencimento_prestacao1) },
        { label: 'Prazo contratual', value: credito?.prazo_contratual },
        { label: 'Meses vencimento', value: credito?.meses_vencimento },
        { label: 'Finalidade', value: credito?.finalidade },
      ],
    },
    {
      title: 'Taxas e Custos',
      content: [
        { label: 'Taxa juro negociada', value: fPercent(credito?.taxa_juro_negociado) },
        { label: 'Taxa juro precário', value: fPercent(credito?.taxa_juro_precario) },
        { label: 'Taxa juro desconto', value: fPercent(credito?.taxa_juro_desconto) },
        { label: 'Isento de comissão', value: credito?.isento_comissao ? 'Sim' : 'Não' },
        { label: 'Taxa imposto de selo', value: fPercent(credito?.taxa_imposto_selo) },
        { label: 'TAEG', value: fPercent(credito?.taxa_taeg, 3) },
        { label: 'Taxa comissão de abertura', value: fPercent(credito?.taxa_comissao_abertura) },
        { label: 'Valor total de comissões', value: fCurrency(credito?.valor_comissao) },
        { label: 'Valor total de imposto selo', value: fCurrency(credito?.valor_imposto_selo) },
        { label: 'Valor total de juros', value: fCurrency(credito?.valor_juro) },
        { label: 'Custo total TAEG', value: fCurrency(credito?.custo_total) },
      ],
    },
    ...(metadados
      ? [
          {
            title: 'Metadados',
            content: [
              { label: 'Revolving', value: metadados?.revolving ? <LabelSN item={metadados?.revolving} /> : null },
              {
                label: 'Com 3º outorgante',
                value: metadados?.com_terceiro_outorgante ? <LabelSN item={metadados?.com_terceiro_outorgante} /> : '',
              },
              {
                label: 'Colaborador empresa parceira',
                value: metadados?.colaborador_empresa_parceira ? (
                  <LabelSN item={metadados?.colaborador_empresa_parceira} />
                ) : null,
              },
              { label: 'Bonificado', value: metadados?.bonificado ? <LabelSN item={metadados?.bonificado} /> : '' },
              {
                label: 'Jovem bonificado',
                value: metadados?.jovem_bonificado ? <LabelSN item={metadados?.jovem_bonificado} /> : '',
              },

              { label: 'Nível de formação', value: credito?.nivel_formacao },
              { label: 'Designação do curso', value: credito?.designacao_curso },
              { label: 'Estabelecimento de ensino', value: credito?.estabelecimento_ensino },
              { label: 'Localização do estabelecimento', value: credito?.localizacao_estabelecimento_ensino },

              { label: 'Prazo de utilização', value: credito?.prazo_utilizacao },
              { label: 'Tipo de imóvel', value: credito?.tipo_imovel },
              { label: 'Finalidade de crédito habitação', value: credito?.finalidade_credito_habitacao },
              { label: 'Montante de crédito habitação', value: credito?.montante_tranches_credibolsa },
              { label: 'NIB vendedor ou fornecedor', value: credito?.nib_vendedor_ou_fornecedor },
              { label: 'Nome da empresa fornecedora', value: credito?.nome_empresa_fornecedora },
              {
                label: 'Instituição crédito conta vendedor ou fornecedor',
                value: credito?.instituicao_credito_conta_vendedor_ou_fornecedor,
              },
              {
                label: 'Valor da transferência conta vendedor ou fornecedor',
                value: credito?.valor_transferir_conta_vendedor_ou_fornecedor,
              },
              { label: 'Bem/Serviço financiado', value: credito?.bem_servico_financiado },
              { label: 'Tipo de seguro', value: credito?.tipo_seguro },
              { label: 'Taxa comissão imobilizacao', value: credito?.taxa_comissao_imobilizacao },
            ],
          },
        ]
      : []),
    {
      title: 'Informações do Processo',
      content: [
        { label: 'Ativo', value: <LabelSN item={credito?.ativo} /> },
        { label: 'Versão', value: credito?.versao },
        { label: 'Nº de proposta', value: credito?.numero_proposta },
        { label: 'Aplicação de origem', value: credito?.aplicacao_origem },
        { label: 'ID do processo origem', value: credito?.processo_origem_id || '' },
      ],
    },
  ];

  return (
    <Stack spacing={3} useFlexGap flexWrap="wrap" direction="row" alignItems="stretch">
      {!credito && isLoading ? (
        <Skeleton variant="text" sx={{ width: 1, height: 660, transform: 'scale(1)' }} />
      ) : (
        sections?.map((section, index) => (
          <Card
            key={index}
            sx={{
              maxWidth: '100%',
              flex: { xs: '1 1 calc(100% - 16px)', md: '1 1 calc(50% - 16px)', xl: '1 1 calc(33.333% - 16px)' },
            }}
          >
            <CardHeader title={section.title} sx={{ color: 'primary.main' }} />
            <CardContent sx={{ pt: 1 }}>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                {section.content.map(({ value, label }, idx) => {
                  if (!value && label !== 'Email' && label !== 'Morada') return null;

                  return (
                    <Stack key={idx} useFlexGap direction="row" flexWrap="wrap" alignItems="center">
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {label}:&nbsp;
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: 'pre-line', ...(!value && { fontStyle: 'italic', color: 'error.main' }) }}
                      >
                        {value || '(Não definido)'}
                      </Typography>
                    </Stack>
                  );
                })}

                {section.title === 'Informações do Processo' && (
                  <Stack>
                    <Divider sx={{ my: 1 }} />
                    <Stack useFlexGap flexWrap="wrap" direction="row" spacing={3} justifyContent="center">
                      <Resgisto label="Criado" por={credito?.criado_por} em={credito?.criado_em} />
                      <Resgisto label="Modificado" em={credito?.modificado_em} por={credito?.modificado_por} />
                    </Stack>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))
      )}
    </Stack>
  );
}
