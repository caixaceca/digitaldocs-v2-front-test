import { View, Text } from '@react-pdf/renderer';
// utils
import { fCurrency } from '@/utils/formatNumber';
import { calcRendimento, formatContagem } from '../calculos';
import useFiadorCalculos from '../fiadores/useFiadorCalculos';
// components
import { styles } from '@/components/exportar-dados/pdf';
import { TitleFicha, ItemValue, RowFicha } from './pdf-fragments';

// ---------------------------------------------------------------------------------------------------------------------

export default function AnaliseFiadoresPdf({ fiadores, financiamento, rendimento, renderSection }) {
  const rend = calcRendimento(rendimento, false);

  return (
    <>
      {fiadores?.map((row, index) => (
        <FiadorFichaPdf
          row={row}
          rend={rend}
          financiamento={financiamento}
          renderSection={renderSection}
          key={row?.numero_entidade || index}
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function FiadorFichaPdf({ row, financiamento, rend, renderSection }) {
  const calc = useFiadorCalculos(row, financiamento, rend);

  if (row?.erroEnriquecimento) {
    return (
      <View wrap={false} style={{ marginBottom: '4mm' }}>
        <TitleFicha sub options={{ success: true }} title={`${calc.numero} - ${calc.nome}`} />
        <Text style={{ fontSize: 8, color: '#FF4842', marginTop: 2 }}>
          *Não foi possível carregar a ficha desta entidade{row?.erroMensagem ? `: ${row.erroMensagem}` : '.'}
        </Text>
      </View>
    );
  }

  const subInfo = [calc.estadoCivil, calc.idade, calc.antiguidade ? `Cliente desde ${calc.antiguidade}` : null]
    .filter(Boolean)
    .join(' · ');

  const dadosAvalFianca = [{ label: 'Crédito em análise', ...financiamento }, ...calc.fiancas, ...calc.avalesExternos];
  const totalAvalFianca = dadosAvalFianca.reduce(
    (acc, item) => ({
      valor: acc.valor + Math.abs(Number(item?.valor || 0)),
      saldo_divida: acc.saldo_divida + Math.abs(Number(item?.saldo_divida || 0)),
      valor_prestacao: acc.valor_prestacao + Math.abs(Number(item?.valor_prestacao || 0)),
    }),
    { valor: 0, saldo_divida: 0, valor_prestacao: 0 }
  );

  const dadosDividas = [...calc.dividas, ...calc.dividasExternas];

  return (
    <View style={{ marginBottom: '4mm' }}>
      <TitleFicha sub options={{ success: true }} title={`${calc.numero} - ${calc.nome}`} />
      {!!subInfo && (
        <View style={[styles.borderCinza, styles.tCell_100, { paddingTop: 5, borderBottom: '0px solid #fff' }]}>
          <Text style={{ color: '#444' }}>{subInfo}</Text>
        </View>
      )}

      <View wrap={false}>
        <RowFicha
          title="Situação laboral"
          options={{ ficha: true, small: true }}
          value={row?.situacao_laboral ? `${row?.situacao_laboral ?? ''} - ${row?.entidade_patronal ?? ''}` : ''}
        />
        <RowFicha
          title="Rendimento líquido"
          value={fCurrency(calc.liquido)}
          options={{ ficha: true, small: true }}
          valueAlt={calc.rendimentoInsuficiente ? alerta('rendimento') : null}
        />
        <RowFicha
          title="Dívidas ativas"
          options={{ ficha: true, small: true }}
          value={fCurrency(calc.totalDividaPropria)}
        />
        <RowFicha
          title="Limite DSTI"
          value={fCurrency(calc.dstiPropria)}
          options={{ ficha: true, small: true }}
          valueAlt={calc.excedeLimiteDsti ? alerta('dsti') : null}
        />
        <RowFicha
          title="Limite máx. Aval/Fiança"
          value={fCurrency(calc.limiteFianca)}
          options={{ ficha: true, small: true }}
        />
        <RowFicha
          title="Comprometido"
          value={fCurrency(calc.totalPres)}
          options={{ ficha: true, final: true, small: true }}
          valueAlt={calc.excedeLimite ? alerta('fianca') : null}
        />
      </View>

      {calc.temDividasAtivas &&
        renderSection(
          `Dívidas ativas ${formatContagem(calc.numDividasInternas, calc.numDividasExternas)}`,
          false,
          false,
          [...dadosDividas, { label: 'TOTAL', totais: true, ...totalizarSeguro(dadosDividas) }],
          [
            { title: 'Tipo de Crédito', options: [styles.tCell_30, styles.bgCinza] },
            { title: 'Capital Inicial', align: 'right', options: [styles.tCell_20, styles.bgCinza] },
            { title: 'Saldo', align: 'right', options: [styles.tCell_18, styles.bgCinza] },
            { title: 'Prestação', align: 'right', options: [styles.tCell_18, styles.bgCinza] },
            { title: 'Situação', align: 'center', options: [styles.tCell_14, styles.bgCinza] },
          ],
          (item) => (
            <>
              <ItemValue fs={7} value={item?.tipo || item?.label || 'Dívida externa'} options={[styles.tCell_30]} />
              <ItemValue
                fs={7}
                value={fCurrency(Math.abs(Number(item?.valor)))}
                options={[styles.tCell_20, styles.alignRight]}
              />
              <ItemValue
                fs={7}
                value={fCurrency(Math.abs(Number(item?.saldo_divida)))}
                options={[styles.tCell_18, styles.alignRight]}
              />
              <ItemValue
                fs={7}
                value={fCurrency(Math.abs(Number(item?.valor_prestacao)))}
                options={[styles.tCell_18, styles.alignRight]}
              />
              <ItemValue fs={7} value={item?.situacao} options={[styles.tCell_14, styles.alignCenter]} />
            </>
          ),
          '1mm'
        )}

      {calc.temAvalFianca &&
        renderSection(
          `Responsabilidades Aval/Fiança ${formatContagem(calc.numAvalFiancaInternas, calc.numAvalFiancaExternas)}`,
          false,
          false,
          [...dadosAvalFianca, { label: 'TOTAL', totais: true, ...totalAvalFianca }],
          [
            { title: 'Aval/Fiança', options: [styles.tCell_30, styles.bgCinza] },
            { title: 'Capital Inicial', align: 'right', options: [styles.tCell_20, styles.bgCinza] },
            { title: 'Saldo', align: 'right', options: [styles.tCell_18, styles.bgCinza] },
            { title: 'Prestação', align: 'right', options: [styles.tCell_18, styles.bgCinza] },
            { title: 'Situação', align: 'center', options: [styles.tCell_14, styles.bgCinza] },
          ],
          (item, i) => (
            <>
              <ItemValue
                fs={7}
                options={[styles.tCell_30]}
                value={item?.tipo_credito || item.label || `Aval/fiança externa ${i + 1}`}
              />
              <ItemValue
                fs={7}
                value={fCurrency(Math.abs(Number(item?.valor)))}
                options={[styles.tCell_20, styles.alignRight]}
              />
              <ItemValue
                fs={7}
                value={fCurrency(Math.abs(Number(item?.saldo_divida)))}
                options={[styles.tCell_18, styles.alignRight]}
              />
              <ItemValue
                fs={7}
                value={fCurrency(Math.abs(Number(item?.valor_prestacao)))}
                options={[styles.tCell_18, styles.alignRight]}
              />
              <ItemValue fs={7} value={item?.situacao} options={[styles.tCell_14, styles.alignCenter]} />
            </>
          ),
          '1mm'
        )}
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function totalizarSeguro(dados) {
  return dados.reduce(
    (acc, item) => ({
      valor: acc.valor + Math.abs(Number(item?.valor || 0)),
      saldo_divida: acc.saldo_divida + Math.abs(Number(item?.saldo_divida || 0)),
      valor_prestacao: acc.valor_prestacao + Math.abs(Number(item?.valor_prestacao || 0)),
    }),
    { valor: 0, saldo_divida: 0, valor_prestacao: 0 }
  );
}

const alerta = (tipo) => {
  const mensagens = {
    rendimento: ' *Valor de salário inferior a 75% do salário do proponente',
    dsti: ' *Dívidas ativas ultrapassam o limite de DSTI',
    fianca: ' *Aval/fiança consolidada ultrapassa o limite recomendável',
  };
  return <Text style={{ color: '#FF4842', fontSize: 8, fontWeight: 'bold' }}>{mensagens[tipo]}</Text>;
};
