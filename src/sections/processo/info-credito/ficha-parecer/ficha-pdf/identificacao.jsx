import { View, Text } from '@react-pdf/renderer';
// utils
import { getIdade, ptDate } from '@/utils/formatTime';
import { docInfo, colorDoc, estadoCivil, dataNascimento } from '../calculos';
// components
import { styles } from '@/components/exportar-dados/pdf';
import { RowFicha, TitleFicha, EmptyRow, ItemValue } from './pdf-fragments';

const options = { success: true, ficha: true };

// ---------------------------------------------------------------------------------------------------------------------

export default function Identificacao({ numero, entidade, clientes, renderSection }) {
  return (
    <>
      <View>
        <TitleFicha title="1. Identificação" options={{ success: true }} />
        <RowFicha title="Nº de entidade" value={numero || '(Não definido...)'} {...{ options }} />
        <RowFicha title="Nome" value={entidade?.nome || '(Não definido...)'} {...{ options }} />
        <RowFicha
          title="Doc. identificação"
          value={docInfo(entidade?.documento, entidade?.tipo_documento)}
          valueAlt={
            entidade?.data_validade ? (
              <Text style={[{ paddingTop: 2, color: colorDoc(entidade?.data_validade, true) }]}>
                {' '}
                (Validade: {ptDate(entidade?.data_validade)})
              </Text>
            ) : null
          }
          {...{ options }}
        />
        <RowFicha title="NIF" value={entidade?.nif || '(Não definido...)'} {...{ options }} />
        <RowFicha title="Telefone" value={entidade?.telefone} {...{ options }} />
        <RowFicha title="Email" value={entidade?.email} {...{ options }} />
        <RowFicha title="Sexo" value={entidade?.sexo} {...{ options }} />
        <RowFicha title="Data de nascimento" value={dataNascimento(entidade?.data_nascimento)} {...{ options }} />
        <RowFicha
          title="Filiação"
          value={[entidade?.nome_pai, entidade?.nome_mae].filter(Boolean).join(' e ') || ''}
          {...{ options }}
        />
        <RowFicha title="Morada" value={entidade?.morada} {...{ options }} />
        <RowFicha title="Código de risco" value={entidade?.codigo_risco || '(Não definido...)'} {...{ options }} />
        <RowFicha title="Nível de risco" value={entidade?.nivel_risco || '(Não definido...)'} {...{ options }} />
        <RowFicha
          title="Estado civil"
          value={estadoCivil(entidade?.estado_civil, entidade?.regime_casamento)}
          options={{ success: true, ficha: true, final: !entidade?.conjuge }}
        />
        {entidade?.conjuge && (
          <>
            <RowFicha title="Cônjuge" value={entidade?.nome_conjuge} {...{ options }} />
            <RowFicha
              title="Data nascimento cônjuge"
              value={dataNascimento(entidade?.data_nascimento_conjuge)}
              options={{ success: true, ficha: true, final: true }}
            />
          </>
        )}
      </View>
      <EmptyRow />

      {renderSection(
        '2. Clientes associados',
        true,
        false,
        clientes,
        [
          { title: 'Nº do cliente', align: 'center', options: [styles.tCell_13, styles.bgCinza] },
          { title: 'Balcão', align: 'center', options: [styles.tCell_8, styles.bgCinza] },
          { title: 'Titularidade', align: 'center', options: [styles.tCell_13, styles.bgCinza] },
          { title: 'Relação', align: 'center', options: [styles.tCell_10, styles.bgCinza] },
          { title: 'Data Abertura', align: 'center', options: [styles.tCell_20, styles.bgCinza] },
          { title: 'Nome do 1º Titular', options: [styles.tCell_36, styles.bgCinza] },
        ],
        ({ cliente, balcao, titularidade, relacao, data_abertura: da, titular }) => (
          <>
            <ItemValue value={cliente} options={[styles.tCell_13, styles.alignCenter]} />
            <ItemValue value={balcao || '--'} options={[styles.tCell_8, styles.alignCenter]} />
            <ItemValue
              value={titularidade || '--'}
              options={[styles.tCell_13, styles.alignCenter]}
              color={titularidade !== 'Individual' ? '#ff9800' : ''}
            />
            <ItemValue value={relacao || '--'} options={[styles.tCell_10, styles.alignCenter]} />
            <ItemValue
              options={[styles.tCell_20, styles.alignCenter]}
              value={da ? `${ptDate(da)} - ${getIdade(da, new Date())}` : ' '}
            />
            <ItemValue value={titular} options={[styles.tCell_36]} />
          </>
        )
      )}
    </>
  );
}
