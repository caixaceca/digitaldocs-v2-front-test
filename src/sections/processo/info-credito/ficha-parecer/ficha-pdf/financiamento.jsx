import { View, Text } from '@react-pdf/renderer';
// utils
import {
  limiteDsti,
  totalDespesas,
  dstiCorrigido,
  dstiDisponivel,
  calcRendimento,
  percentagemDsti,
  limiteDstiCorrigido,
  dstiAposContratacao,
  dividasConsolidadas,
} from '../calculos';
import { labelMeses } from '@/utils/formatText';
import { fCurrency, fPercent } from '@/utils/formatNumber';
// components
import { styles } from '@/components/exportar-dados/pdf';
import { RowFicha, TitleFicha, Alerta, NadaConsta } from './pdf-fragments';

const options = { success: true, ficha: true };

// ---------------------------------------------------------------------------------------------------------------------

export default function Financiamento({ dados }) {
  const dsti = percentagemDsti(dados);
  const corrigido = dstiCorrigido(dados);
  const total = totalDespesas(dados?.despesas);
  const { valorPrestacao = 0, credito = null, rendimento = null, despesas = [] } = dados || {};

  const consolidadas = dividasConsolidadas(dados, credito?.montante_solicitado, valorPrestacao);
  const prestacaoM40 =
    credito?.componente?.includes('Habitação') && valorPrestacao > calcRendimento(rendimento, false) * 0.4;

  return (
    <>
      <View style={{ marginTop: '4mm' }} wrap={false}>
        <TitleFicha title="12. Novo financiamneto" />
        <RowFicha
          options={{ ficha: true }}
          title="Capital pretendido"
          value={fCurrency(credito?.montante_solicitado)}
        />
        <RowFicha options={{ ficha: true }} title="Tipo de crédito" value={credito?.componente} />
        <RowFicha options={{ ficha: true }} title="Taxa de juros" value={fPercent(credito?.taxa_juro)} />
        <RowFicha
          options={{ ficha: true }}
          title="Prazo de amortização"
          value={labelMeses(credito?.prazo_amortizacao)}
        />
        <RowFicha
          title="Prestação mensal"
          options={{ ficha: true }}
          value={fCurrency(valorPrestacao)}
          valueAlt={
            prestacaoM40 && <Alerta alerta={'A prestação excede 40% do rendimento líquido mensal do agregado'} />
          }
        />
        <View wrap={false} style={[styles.borderCinza, styles.tableRowFicha]}>
          <View style={[styles.viewSubFicha, styles.tCell_100, styles?.bgCinza]}>
            <Text style={[styles.subFicha, styles.alignCenter, styles.uppercase, styles.textBold, styles.px0]}>
              Dívidas consolidadas após o financiamento
            </Text>
          </View>
        </View>
        <RowFicha options={{ ficha: true }} title="Capital inicial" value={fCurrency(consolidadas?.valor)} />
        <RowFicha options={{ ficha: true }} title="Saldo em dívida" value={fCurrency(consolidadas?.saldo_divida)} />
        <RowFicha
          title="Serviço mensal"
          options={{ final: true, ficha: true }}
          value={fCurrency(consolidadas?.valor_prestacao)}
        />
      </View>

      <View style={{ marginTop: '4mm' }} wrap={false}>
        <TitleFicha title="13. DSTI - Debt Service To Income (<=50%)" options={{ success: true }} />
        <RowFicha title="Limite do DSTI" value={fCurrency(limiteDsti(rendimento))} {...{ options }} />
        <RowFicha title="DSTI disponível" value={fCurrency(dstiDisponivel(dados))} {...{ options }} />
        <RowFicha
          title="DSTI"
          {...{ options }}
          value={fPercent(dsti)}
          valueAlt={dsti > 50 && <Alerta alerta="DSTI ultrapassa o limite recomendável" />}
        />
        <RowFicha
          title="DSTI após contratação"
          value={fCurrency(dstiAposContratacao(dados))}
          options={{ ficha: true, success: true, final: true }}
        />
      </View>

      <View style={{ marginTop: '4mm' }} wrap={false}>
        <TitleFicha title="14. Despesas" />
        {despesas?.map(({ despesa, valor }) => (
          <RowFicha
            key={despesa}
            title={despesa}
            value={fCurrency(valor)}
            options={{ final: despesas?.length === 1, ficha: true }}
          />
        ))}
        {despesas?.length > 1 && (
          <RowFicha title="TOTAL" value={fCurrency(total)} options={{ final: true, bold: true, ficha: true }} />
        )}
        {despesas?.length === 0 && <NadaConsta />}
      </View>

      <View style={{ marginTop: '4mm' }} wrap={false}>
        <TitleFicha title="15. DSTI corrigido (<=70%)" options={{ success: true }} />
        <RowFicha title="Limite do DSTI corrigido" value={fCurrency(limiteDstiCorrigido(dados))} {...{ options }} />
        <RowFicha
          title="DSTI corrigido"
          value={fPercent(corrigido)}
          options={{ ficha: true, success: true, final: true }}
          valueAlt={corrigido > 70 && <Alerta alerta="DSTI Corrigido ultrapassa o limite recomendável" />}
        />
      </View>

      <View style={{ marginTop: '4mm' }} wrap={false}>
        <TitleFicha title="16. Limite máximo Aval/Fiança" />
        <RowFicha value={fCurrency(limiteDsti(rendimento) * 2)} options={{ final: true }} />
      </View>
    </>
  );
}
