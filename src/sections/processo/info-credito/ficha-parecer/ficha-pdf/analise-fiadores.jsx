import { View, Text } from '@react-pdf/renderer';
// utils
import { fCurrency } from '@/utils/formatNumber';
import { responsabilidadesInfo, calcRendimento } from '../calculos';
// components
import { styles } from '@/components/exportar-dados/pdf';
import { TitleFicha, ItemValue, RowFicha } from './pdf-fragments';

// ---------------------------------------------------------------------------------------------------------------------

export default function AnaliseFiadoresPdf({ fiadores, financiamento, rendimento, renderSection }) {
  const rendMinimo = calcRendimento(rendimento, false);

  return (
    <>
      {fiadores?.map((row, index) => {
        const bruto = row?.renda_bruto_mensal;
        const liquido = row?.renda_liquido_mensal;
        const dadosResponsabilidades = [{ ...financiamento, situacao: 'Normal' }, ...(row.fiancas || [])];
        const totalPres = dadosResponsabilidades.reduce((acc, item) => acc + Number(item.valor_prestacao || 0), 0);

        const alertaLimite = totalPres > liquido;
        const alertaRendimento = liquido < rendMinimo * 0.75;

        return (
          <View key={row?.numero_entidade || index} wrap={false}>
            <TitleFicha
              sub
              options={{ success: true }}
              title={`${row?.numero || row?.numero_entidade} - ${row?.nome || row?.nome_entidade} `}
            />

            <View>
              <RowFicha title="Rendimento bruto" value={fCurrency(bruto)} options={{ ficha: true }} />
              <RowFicha
                value={fCurrency(bruto)}
                options={{ ficha: true }}
                title="Rendimento líquido"
                valueAlt={alertaRendimento ? alerta(true) : null}
              />
              <RowFicha title="Limite DSTI (50%)" value={fCurrency(liquido * 0.5)} options={{ ficha: true }} />
              <RowFicha
                value={fCurrency(liquido)}
                title="Limite Max. Aval/Fiança"
                options={{ ficha: true, final: true }}
                valueAlt={alertaLimite ? alerta(false) : null}
              />
            </View>

            {renderSection(
              null,
              false,
              false,
              [
                ...dadosResponsabilidades,
                { label: 'TOTAL', ...responsabilidadesInfo(dadosResponsabilidades), totais: true },
              ],
              [
                { title: 'Aval/Fiança', options: [styles.tCell_20, styles.bgCinza] },
                { title: 'Capital Inicial', align: 'right', options: [styles.tCell_25, styles.bgCinza] },
                { title: 'Saldo', align: 'right', options: [styles.tCell_20, styles.bgCinza] },
                { title: 'Prestação', align: 'right', options: [styles.tCell_20, styles.bgCinza] },
                { title: 'Situação', align: 'center', options: [styles.tCell_15, styles.bgCinza] },
              ],
              (item, index) => (
                <>
                  <ItemValue value={item.label || index + 1} options={[styles.tCell_20]} />
                  <ItemValue value={fCurrency(item?.valor)} options={[styles.tCell_25, styles.alignRight]} />
                  <ItemValue value={fCurrency(item?.saldo_divida)} options={[styles.tCell_20, styles.alignRight]} />
                  <ItemValue value={fCurrency(item?.valor_prestacao)} options={[styles.tCell_20, styles.alignRight]} />
                  <ItemValue value={item?.situacao} options={[styles.tCell_15, styles.alignCenter]} />
                </>
              )
            )}
          </View>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

const alerta = (rendimento) => (
  <Text style={[{ color: '#FF4842', fontSize: 8, fontWeight: 'bold' }]}>
    {rendimento
      ? ' *Valor de salário inferior a 75% do salário do proponente'
      : ' *Aval/fiança consolidada ultrapassa o limite recomendável'}
  </Text>
);
