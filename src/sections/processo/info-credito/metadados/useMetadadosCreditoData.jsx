import { useMemo } from 'react';
// @mui
import Stack from '@mui/material/Stack';
// utils
import { ptDate } from '@/utils/formatTime';
import { fCurrency, fPercent } from '@/utils/formatNumber';
// components
import Label from '@/components/Label';
import { LabelSN } from '../../../parametrizacao/Detalhes';

// ---------------------------------------------------------------------------------------------------------------------

export function useMetadadosCreditoData(dados) {
  return useMemo(() => {
    if (!dados) return { financeiroPrincipal: [], cardsVisible: [] };

    const financeiroPrincipal = [
      { label: 'Valor da prestação', value: fCurrency(dados?.valor_prestacao), color: 'primary' },
      { label: 'Custo total', value: fCurrency(dados?.custo_total), color: 'info' },
      { label: 'TAEG', value: fPercent(dados?.taxa_taeg, 3), color: 'error' },
      { label: 'TAN', value: fPercent(Number(dados?.taxa_tan), 3), color: 'warning' },
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
                      {dados?.bonificado && <Label color="info">Bonificado</Label>}
                      {dados?.jovem_bonificado && <Label color="info">Jovem Bonificado</Label>}
                      {dados?.revolving && <Label color="info">Revolving</Label>}
                      {dados?.colaborador_empresa_parceira && <Label color="info">Parceiro</Label>}
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
              Number(dados?.capital_max_isento_imposto_selo) > 0
                ? fCurrency(dados?.capital_max_isento_imposto_selo)
                : '',
          },
          { title: 'Conta DO Renda', value: dados?.conta_do_renda, bold: true },
        ],
      },
      {
        titulo: 'Ciclo & Prazos',
        dados: [
          { title: 'Data da 1ª prestação', value: ptDate(dados?.data_vencimento_prestacao1) },
          { title: 'Data de utilização', value: ptDate(dados?.data_utilizacao) },
          {
            title: 'Nº de prestações',
            value: dados?.numero_prestacao && `${dados?.numero_prestacao} meses`,
            bold: true,
          },
          { title: 'Meses de vencimento', value: dados?.meses_vencimento && `${dados?.meses_vencimento} meses` },
          { title: 'Período de carência', value: dados?.periodo_carencia && `${dados?.periodo_carencia} meses` },
          { title: 'Prazo de utilização', value: dados?.prazo_utilizacao && `${dados?.prazo_utilizacao} meses` },
        ],
      },
      {
        titulo: 'Taxas Detalhadas',
        dados: [
          {
            title: 'Modo da taxa',
            value: <Label color="info">{dados?.modo_taxa_equivalente ? 'Equivalente' : 'Proporcional'}</Label>,
          },
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
          { title: 'Bem/Serviço', value: dados?.bem_servico_financiado, noWrap: false },
          { title: 'Finalidade', value: dados?.finalidade_credito_habitacao, noWrap: false },
          { title: 'Nível de formação', value: dados?.nivel_formacao },
          { title: 'Curso', value: dados?.designacao_curso, noWrap: false },
          {
            title: 'Tranches da credibolsa',
            value:
              Number(dados?.montante_tranches_credibolsa) > 0 ? fCurrency(dados?.montante_tranches_credibolsa) : '',
          },
          { title: 'Estabelecimento de ensino', value: dados?.estabelecimento_ensino, noWrap: false },
          { title: 'Localização', value: dados?.localizacao_estabelecimento_ensino, noWrap: false },
        ],
      },
      {
        id: 'entidade_transferencia',
        titulo: 'Entidade & Transferência',
        dados: [
          { title: 'Empresa fornecedora', value: dados?.nome_empresa_fornecedora, noWrap: false },
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

    return { financeiroPrincipal, cardsVisible };
  }, [dados]);
}
