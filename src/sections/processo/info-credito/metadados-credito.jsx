// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
// utils
import useToggle from '../../../hooks/useToggle';
import { ptDate } from '../../../utils/formatTime';
import { fCurrency, fPercent } from '../../../utils/formatNumber';
// Components
import { LabelSN } from '../../parametrizacao/Detalhes';
import { DefaultAction } from '../../../components/Actions';
import MetadadosCreditoForm from '../form/credito/form-metadados-credito';
import { SearchNotFoundSmall } from '../../../components/table/SearchNotFound';

// ---------------------------------------------------------------------------------------------------------------------

export default function MetadadosCredito({ dados, modificar = false, ids = null, action = null }) {
  const { toggle: open, onOpen, onClose } = useToggle();

  const cards = [
    {
      step: 0,
      titulo: 'Identificação e Contexto',
      dados: [
        { title: 'Bonificado', value: dados?.bonificado ? 'Sim' : '' },
        { title: 'Jovem bonificado', value: dados?.jovem_bonificado ? 'Sim' : '' },
        { title: 'Revolving', value: dados?.revolving ? 'Sim' : '' },
        { title: 'Isento de comissão', value: dados?.isento_comissao ? 'Sim' : 'Não' },
        { title: 'Colab. empresa parceira', value: dados?.colaborador_empresa_parceira ? 'Sim' : '' },
        { title: 'Com 3º outorgante', value: dados?.com_terceiro_outorgante ? 'Sim' : '' },
        { title: 'Conta DO renda', value: dados?.conta_do_renda },
        { title: 'Finalidade crédito habitação', value: dados?.finalidade_credito_habitacao },
        { title: 'Data 1ª prestação', value: ptDate(dados?.data_vencimento_prestacao1) },
        { title: 'Tranches credibolsa', value: fCurrency(dados?.montante_tranches_credibolsa) },
        { title: 'Nível formação', value: dados?.nivel_formacao },
        { title: 'Curso', value: dados?.designacao_curso },
        { title: 'Estabelecimento ensino', value: dados?.estabelecimento_ensino },
        { title: 'Localização', value: dados?.localizacao_estabelecimento_ensino },
      ],
    },
    {
      step: 1,
      titulo: 'Condições & Taxas',
      dados: [
        { title: 'Nº prestações', value: dados?.numero_prestacao ? `${dados?.numero_prestacao} meses` : '' },
        { title: 'Meses vencimento', value: dados?.meses_vencimento ? `${dados?.meses_vencimento} meses` : '' },
        { title: 'Prazo utilização', value: dados?.prazo_utilizacao ? `${dados?.prazo_utilizacao} meses` : '' },
        { title: 'Taxa TAEG', value: fPercent(dados?.taxa_taeg) },
        { title: 'Taxa juro precário', value: fPercent(dados?.taxa_juro_precario) },
        { title: 'Taxa juro desconto', value: fPercent(dados?.taxa_juro_desconto) },
        { title: 'Taxa imposto selo', value: fPercent(dados?.taxa_imposto_selo) },
        { title: 'Taxa comissão abertura', value: fPercent(dados?.taxa_comissao_abertura) },
        { title: 'Taxa comissão imobilização', value: fPercent(dados?.taxa_comissao_imobilizacao) },
      ],
    },
    {
      step: 2,
      titulo: 'Custos & Cálculos',
      dados: [
        { title: 'Valor prestação', value: fCurrency(dados?.valor_prestacao) },
        { title: 'Valor prestação s/ desconto', value: fCurrency(dados?.valor_prestacao_sem_desconto) },
        { title: 'Valor juros', value: fCurrency(dados?.valor_juro) },
        { title: 'Valor comissão', value: fCurrency(dados?.valor_comissao) },
        { title: 'Valor imposto selo', value: fCurrency(dados?.valor_imposto_selo) },
        { title: 'Custo total', value: fCurrency(dados?.custo_total) },
      ],
    },
    {
      step: 3,
      titulo: 'Imóvel / Bem Financiado',
      dados: [
        {
          title: 'Tipo de imóvel',
          value: dados?.tipo_imovel?.id || dados?.tipo_imovel_id?.id || dados?.tipo_imovel || dados?.tipo_imovel_id,
        },
        { title: 'Bem/Serviço financiado', value: dados?.bem_servico_financiado },
        { title: 'Tipo de seguro', value: dados?.tipo_seguro },
      ],
    },
    {
      step: 4,
      titulo: 'Entidade Vendedora / Fornecedora',
      dados: [
        { title: 'Nome empresa fornecedora', value: dados?.nome_empresa_fornecedora },
        { title: 'NIB vendedor/fornecedor', value: dados?.nib_vendedor_ou_fornecedor },
        { title: 'Instituição crédito', value: dados?.instituicao_credito_conta_vendedor_ou_fornecedor },
        {
          title: 'Valor a transferir',
          value: fCurrency(dados?.valor_transferir_conta_vendedor_ou_fornecedor),
        },
      ],
    },
  ];

  return (
    <>
      <Stack spacing={3} useFlexGap flexWrap="wrap" direction="row" alignItems="stretch" sx={{ pt: action ? 1 : 0 }}>
        {!dados ? (
          <Stack alignItems="center" sx={{ width: 1, pt: 3 }}>
            <SearchNotFoundSmall message="Nenhuma informação adicionada..." />
          </Stack>
        ) : (
          cards?.map((row, index) => (
            <Card
              key={index}
              sx={{
                maxWidth: '100%',
                flex: {
                  xs: '1 1 calc(100% - 16px)',
                  sm: '1 1 calc(50% - 16px)',
                  lg: !action && '1 1 calc(33.333% - 16px)',
                },
                boxShadow: (theme) => theme.customShadows.cardAlt,
              }}
            >
              <CardHeader
                title={row?.titulo}
                titleTypographyProps={{ variant: 'subtitle1', color: 'primary.main' }}
                action={action ? <DefaultAction small label="EDITAR" onClick={() => action(row?.step)} /> : null}
              />

              <CardContent sx={{ p: { xs: 1, sm: 3 }, pt: '12px !important' }}>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={0.5}>
                  {(() => {
                    const validData = row?.dados?.filter((d) => d?.value) || [];
                    if (validData.length === 0) {
                      return <SearchNotFoundSmall message="Nenhuma informação adicionada..." xs />;
                    }

                    return validData.map(({ value, title }, idx) => (
                      <Stack key={idx} useFlexGap direction="row" flexWrap="wrap" alignItems="center">
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {title}:&nbsp;
                        </Typography>
                        <Typography variant="body2">
                          {(value === 'Sim' && <LabelSN item />) ||
                            (value === 'Não' && <LabelSN />) ||
                            value ||
                            '(Não definido)'}
                        </Typography>
                      </Stack>
                    ));
                  })()}
                </Stack>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>

      {modificar && (
        <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
          <DefaultAction variant="contained" button label={dados ? 'Editar' : 'Adicionar'} onClick={onOpen} />
        </Stack>
      )}

      {open && <MetadadosCreditoForm onClose={onClose} dados={dados} ids={ids} />}
    </>
  );
}
