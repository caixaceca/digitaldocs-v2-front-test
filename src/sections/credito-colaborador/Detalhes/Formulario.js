import PropTypes from 'prop-types';
import { Page, View, Document } from '@react-pdf/renderer';
// utils
import { fCurrency } from '../../../utils/formatNumber';
import { valorPorExtenso } from '../../../utils/normalizeText';
import { ptDate, formatDistanceStrict_ } from '../../../utils/formatTime';
// components
import {
  Row,
  Title,
  Label,
  Value,
  styles,
  Rodape,
  ItemAlt,
  Cabecalho,
  RowItemAlt,
} from '../../../components/ExportDados';

// ----------------------------------------------------------------------

Adiantamento.propTypes = { pedido: PropTypes.object, uo: PropTypes.string, colaborador: PropTypes.string };

export function Adiantamento({ pedido, uo = '', colaborador = '' }) {
  return (
    <Document>
      <Page size="A4" style={[styles.page, styles.pageDeclaracao]}>
        <Cabecalho title="Adiantamento de vencimento a trabalhadores" codificacao="CCRD.FM.P.001.00 | 2012.03.15" />
        <View style={[styles.bodyDeclaracao]}>
          <View style={[styles.tableBody]}>
            <Row>
              <ItemAlt label="Data" value={ptDate(pedido?.criado_em)} style={[styles.tCell_33]} />
              <ItemAlt label="Agência" value={uo} style={[styles.tCell_33]} />
              <ItemAlt label="Nº de cliente" value={pedido?.cliente} style={[styles.tCell_34]} />
            </Row>
            <Title label="Identificação do proponente" mt />
            <Row mt>
              <ItemAlt label="Nome" value={colaborador?.perfil?.displayName} style={[styles.tCell_50]} />
              <ItemAlt label="Estado civil" value={colaborador?.estado_civil} style={[styles.tCell_25]} />
              <ItemAlt
                style={[styles.tCell_25]}
                label="Data de nascimento"
                value={ptDate(colaborador?.data_nascimento)}
              />
            </Row>
            <Row mt>
              <ItemAlt label="Morada" value={pedido?.morada} style={[styles.tCell_75]} />
              <ItemAlt label="C.P." value={pedido.cp} style={[styles.tCell_25]} />
            </Row>
            <RowItemAlt label="Nome do conjuge" value={pedido?.nome_conjuge} style={[styles.tCell_100]} />
            <Row mt>
              <ItemAlt label="Profissão" value={pedido?.profissao_conjuge} style={[styles.tCell_33]} />
              <ItemAlt label="Entidade patronal" value={pedido?.entidade_patronal_conjuge} style={[styles.tCell_33]} />
              <ItemAlt
                label="Remuneração mensal liquida"
                value={pedido?.remuneracao_conjuge}
                style={[styles.tCell_34]}
              />
            </Row>
          </View>
          <View style={[styles.divider]}> </View>
          <View style={[styles.tableBody]}>
            <Title label="Formalização do pedido" />
            <Row mt>
              <ItemAlt
                label="Montante"
                style={[styles.tCell_30]}
                value={fCurrency(pedido?.credito?.montante_solicitado)}
              />
              <ItemAlt
                label="Extenso"
                style={[styles.tCell_70]}
                value={valorPorExtenso(pedido?.credito?.montante_solicitado)}
              />
            </Row>
            <Row mt>
              <ItemAlt
                style={[styles.tCell_30]}
                label="Amortização (prazo)"
                value={`${pedido?.credito?.prazo_amortizacao} meses`}
              />
              <ItemAlt label="Prestações" value={pedido?.credito?.prestacao} style={[styles.tCell_30]} />
              <ItemAlt label="Garantias" value={pedido?.credito?.garantias} style={[styles.tCell_40]} />
            </Row>
            <Label
              props={[styles.tCell_100, styles.mb10, styles.mt15, styles.alignLeft, styles.pl0]}
              label="Solicita-se a concessão do adiantamento de vencimento ao abrigo do regulamento establecido na o.s. Nº 55/2001, o qual expressamente se declara"
            />
            <Row mt>
              <ItemAlt label="Data" value={ptDate(new Date())} style={[styles.tCell_20]} />
              <ItemAlt label="Assinatura" value={' '} style={[styles.tCell_40]} />
              <ItemAlt label="Assinatura" value={' '} style={[styles.tCell_40]} />
            </Row>
          </View>
          <View style={[styles.divider]}> </View>
          <View style={[styles.tableBody]}>
            <Title label="Identificação do avalista" />
            <Row mt>
              <ItemAlt label="Nome / Designação social" value={' '} style={[styles.tCell_50]} />
              <ItemAlt label="Telefone" value={' '} style={[styles.tCell_25]} />
              <ItemAlt label="Estado civil" value={' '} style={[styles.tCell_25]} />
            </Row>
            <Row mt>
              <ItemAlt label="Morada / Sede social " value={' '} style={[styles.tCell_50]} />
              <ItemAlt label="C.P." value={' '} style={[styles.tCell_25]} />
              <ItemAlt label="Data de nascimento" value={' '} style={[styles.tCell_25]} />
            </Row>
            <Row mt>
              <ItemAlt label="Profissão" value={' '} style={[styles.tCell_33]} />
              <ItemAlt label="Entidade patronal" value={' '} style={[styles.tCell_33]} />
              <ItemAlt label="Remuneração mensal liquida" value={' '} style={[styles.tCell_34]} />
            </Row>
            <RowItemAlt label="Nome do conjuge" value={' '} style={[styles.tCell_100]} />
            <Row mt>
              <ItemAlt label="Profissão" value={' '} style={[styles.tCell_33]} />
              <ItemAlt label="Entidade patronal" value={' '} style={[styles.tCell_33]} />
              <ItemAlt label="Remuneração mensal liquida" value={' '} style={[styles.tCell_34]} />
            </Row>
          </View>
          <View style={[styles.divider]}> </View>
          <View style={[styles.tableBody]}>
            <View style={[styles.tableRow2, styles.noBorder, styles.pt0]}>
              <Title label="Responsabilidades do proponente" />
              <Label props={[styles.tCell_25, styles.alignLeft, styles.mt2]} label="(A indicar pela agência)" />
            </View>
            <Row mt>
              <Label label=" " props={[styles.tCell_25]} />
              <Label label="Assumidas" props={[styles.tCell_40, styles.alignCenter]} />
              <Label label="Encargos mensais" props={[styles.tCell_35, styles.alignCenter]} />
            </Row>
            <Resp label="Crédito à habitação" value1="" value2="" />
            <Resp label="Adiantamento de vencimentos" value1="" value2="" />
            <Resp label="Outros" value1="" value2="" />
            <Resp label="Totais" value1="" value2="" />
          </View>
        </View>
        <Rodape noOrigin />
      </Page>
    </Document>
  );
}

// ----------------------------------------------------------------------

Habitacao.propTypes = { pedido: PropTypes.object, colaborador: PropTypes.string };

export function Habitacao({ pedido, colaborador = '' }) {
  return (
    <Document>
      <Page size="A4" style={[styles.page, styles.pageDeclaracao]}>
        <Cabecalho title="Credito Habitação" codificacao="CCRD.FM.P.003.00 | 2012.03.15" />
        <View style={[styles.bodyDeclaracao]}>
          <View style={[styles.tableBody]}>
            <Title label="Identificação do Proponente" />
            <Row mt>
              <ItemAlt label="Nome" value={colaborador?.perfil?.displayName} style={[styles.tCell_75]} />
              <ItemAlt
                label="Idade"
                style={[styles.tCell_25]}
                value={
                  colaborador?.data_nascimento ? formatDistanceStrict_(colaborador?.data_nascimento, new Date()) : ''
                }
              />
            </Row>
            <Row mt>
              <ItemAlt label="Residência" value={pedido?.morada} style={[styles.tCell_50]} />
              <ItemAlt label="Estado civil" value={colaborador?.estado_civil} style={[styles.tCell_25]} />
              <ItemAlt label="Regime de casamento" value={colaborador?.regime_casamento} style={[styles.tCell_25]} />
            </Row>
            <Row mt>
              <ItemAlt
                label="Tempo de serviço"
                style={[styles.tCell_33]}
                value={colaborador?.data_admissao ? formatDistanceStrict_(colaborador?.data_admissao, new Date()) : ''}
              />
              <ItemAlt label="Vencimento líquido" style={[styles.tCell_33]} value={colaborador.vencimento_liquido} />
              <ItemAlt label="Outros provimentos" value={colaborador?.outros_provimento} style={[styles.tCell_34]} />
            </Row>
          </View>
          <View style={[styles.divider]}> </View>
          <View style={[styles.tableBody]}>
            <Title label="Conjuge" />
            <Row mt>
              <ItemAlt style={[styles.tCell_75]} label="Nome" value={' '} />
              <ItemAlt style={[styles.tCell_25]} label="Idade" value={' '} />
            </Row>
            <Row mt>
              <ItemAlt style={[styles.tCell_25]} label="Profissão" value={' '} />
              <ItemAlt style={[styles.tCell_50]} label="Entidade patronal" value={' '} />
              <ItemAlt style={[styles.tCell_25]} label="Telefone" value={' '} />
            </Row>
            <Row mt>
              <ItemAlt style={[styles.tCell_33]} label="Tempo de serviço" value={' '} />
              <ItemAlt style={[styles.tCell_33]} label="Vencimento líquido" value={' '} />
              <ItemAlt style={[styles.tCell_34]} label="Outros provimentos" value={' '} />
            </Row>
          </View>
          <View style={[styles.divider]}> </View>
          <View style={[styles.tableBody]}>
            <Title label="Casal" />
            <Row mt>
              <ItemAlt style={[styles.tCell_25]} label="Número de filhos" value={' '} />
              <ItemAlt style={[styles.tCell_75]} label="Idade" value={' '} />
            </Row>
            <RowItemAlt style={[styles.tCell_100]} label="Outros componentes do agregado familiar*" value={' '} />
            <Label
              props={[styles.tCell_100, styles.mt5, styles.alignLeft, styles.pl0]}
              label="Bens pertencentes ao casal ou aos cónjuges separadamente:"
            />
            <RowItemAlt style={[styles.tCell_100]} label="Móveis" value={' '} />
            <RowItemAlt style={[styles.tCell_100]} label="Imóveis" value={' '} />
            <Label
              props={[styles.tCell_100, styles.mt5, styles.alignLeft, styles.pl0]}
              label="Bens pertencentes ao casal ou aos cónjuges separadamente:"
            />
            <RowItemAlt style={[styles.tCell_100]} label="Na Caixa" value={' '} />
            <RowItemAlt style={[styles.tCell_100]} label="No comércio" value={' '} />
            <RowItemAlt style={[styles.tCell_100]} label="Noutros bancos" value={' '} />
            <RowItemAlt style={[styles.tCell_100]} label="Outras responsabilidades" value={' '} />
          </View>
          <View style={[styles.divider]}> </View>
          <View style={[styles.tableBody]}>
            <Title label="Morada ocupada actualmente" />
            <RowItemAlt style={[styles.tCell_100]} label="Localização e número de divisórias" value={' '} />
            <RowItemAlt style={[styles.tCell_100]} label="Renda" value={' '} />
            <RowItemAlt style={[styles.tCell_100]} label="Proprietário" value={' '} />
          </View>
          <View style={[styles.divider]}> </View>
          <View style={[styles.tableBody]}>
            <Title label="Prédio que pretende construir, adquirir ou remodelar" />
            <RowItemAlt
              style={[styles.tCell_100]}
              label="Destino final (habitação própria, aluguer ou misto)"
              value={' '}
            />
            <RowItemAlt style={[styles.tCell_100]} label="Revisão do valor de aluguer" value={' '} />
            <RowItemAlt
              style={[styles.tCell_100]}
              label="Modo de execução da obra (administração directa ou empresa)"
              value={' '}
            />
            <RowItemAlt style={[styles.tCell_100]} label="Prazo previsto para a sua conclusão" value={' '} />
            <RowItemAlt style={[styles.tCell_100]} label="Custo total do empreendimento" value={' '} />
            <Label
              props={[styles.tCell_100, styles.mt5, styles.alignLeft, styles.pl0]}
              label="Comparticipação do proponente:"
            />
            <Row mt>
              <ItemAlt style={[styles.tCell_50]} label="Inicial" value={' '} />
              <ItemAlt style={[styles.tCell_50]} label="Fatura" value={' '} />
            </Row>
            <RowItemAlt style={[styles.tCell_100]} label="Montante solicitado a Caixa" value={' '} />
          </View>
          <View style={[styles.divider]}> </View>
          <View style={[styles.tableBody]}>
            <Title label="Informações adicionais" />
            <RowItemAlt style={[styles.tCell_100]} label="" value={' '} />
            <Label props={[styles.tCell_100, styles.alignLeft, styles.pl0]} label=" " />
            <RowItemAlt style={[styles.tCell_25]} label="Data" value={' '} />
            <RowItemAlt style={[styles.tCell_100]} label="Assinatura dos proponentes" value={' '} />
            <RowItemAlt style={[styles.tCell_100]} label="" value={' '} />
            <Label
              props={[styles.tCell_100, styles.mt15, styles.alignLeft, styles.pl0]}
              label="*Agregado familiar: O cônjuge de pessoas constituido pelo casal e seus ascendentes ou descendentes de 1° grau, incluindo enteados e adoptados, desde que com eles vivam em regime de comunhão de mesma habitação."
            />
          </View>
        </View>
        <Rodape noOrigin />
      </Page>
    </Document>
  );
}

// ----------------------------------------------------------------------

Resp.propTypes = { label: PropTypes.string, value1: PropTypes.string, value2: PropTypes.string };

function Resp({ label, value1, value2 }) {
  return (
    <Row mt>
      <Label label={label} props={[styles.tCell_25]} />
      <Value value={value1 ? fCurrency(value1) : ' '} props={[styles.tCell_40, styles.alignRight]} />
      <Value value={value2 ? fCurrency(value2) : ' '} props={[styles.tCell_40, styles.alignRight]} />
    </Row>
  );
}
