import PropTypes from 'prop-types';
// @mui
import List from '@mui/material/List';
import Paper from '@mui/material/Paper';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
// utils
import { ptDate } from '../../../utils/formatTime';
import { newLineText } from '../../../utils/formatText';
import { colorLabel } from '../../../utils/getColorPresets';
import { fCurrency, fPercent } from '../../../utils/formatNumber';
// components
import Label from '../../../components/Label';
import { TextItem } from './DetalhesProcesso';
// _mock
import { dis, estadosCivis } from '../../../_mock';

// ----------------------------------------------------------------------

InfoCredito.propTypes = { dados: PropTypes.object };

export function InfoCredito({ dados }) {
  return (
    <List sx={{ p: { xs: 1, sm: 3 } }}>
      {dados?.situacao_final_mes && (
        <TextItem
          title="Situação:"
          label={<Label color={colorLabel(dados?.situacao_final_mes)}>{dados?.situacao_final_mes}</Label>}
        />
      )}
      <TextItem title="Nº de proposta:" text={dados?.nproposta} />
      <TextItem title="Segmento:" text={dados?.segmento} />
      <TextItem title="Linha de crédito:" text={dados?.linha} />
      {dados?.montante_solicitado && (
        <TextItem title="Montante solicitado:" text={fCurrency(dados?.montante_solicitado)} />
      )}
      <TextItem title="Entidade patronal:" text={dados?.setor_atividade} />
      <TextItem title="Finalidade:" text={dados?.finalidade} />
      {dados?.montante_aprovado && <TextItem title="Montante aprovado:" text={fCurrency(dados?.montante_aprovado)} />}
      {dados?.data_aprovacao && <TextItem title="Data de aprovação:" text={ptDate(dados?.data_aprovacao)} />}
      {dados?.montante_contratado && (
        <TextItem title="Montante contratado:" text={fCurrency(dados?.montante_contratado)} />
      )}
      {dados?.data_contratacao && <TextItem title="Data de contratação:" text={ptDate(dados?.data_contratacao)} />}
      <TextItem title="Prazo de amortização:" text={dados?.prazo_amortizacao} />
      {dados?.taxa_juro && <TextItem title="Taxa de juro:" text={fPercent(dados?.taxa_juro)} />}
      <TextItem title="Garantia:" text={dados?.garantia} />
      <TextItem title="Escalão de decisão:" text={dados?.escalao_decisao} />
      {dados?.data_desistido && <TextItem title="Data de desistência:" text={ptDate(dados?.data_desistido)} />}
      {dados?.data_indeferido && <TextItem title="Data de indeferimento:" text={ptDate(dados?.data_indeferido)} />}
      {dados?.valor_divida && (
        <Paper sx={{ p: 1, pb: 0.75, my: 0.5, bgcolor: 'background.neutral', flexGrow: 1 }}>
          <Label color="info" startIcon={<InfoOutlinedIcon />}>
            Entidade com crédito em dívida
          </Label>
          <TextItem title="Valor:" text={fCurrency(dados?.valor_divida * 1000)} />
          {dados?.periodo && <TextItem title="Data:" text={ptDate(dados?.periodo)} />}
        </Paper>
      )}
    </List>
  );
}

// ----------------------------------------------------------------------

InfoCon.propTypes = { dados: PropTypes.object, valor: PropTypes.number, numero: PropTypes.number };

export function InfoCon({ dados, valor, numero }) {
  return (
    <List sx={{ p: { xs: 1, sm: 3 } }}>
      <TextItem title="Nº da operação:" text={numero} />
      {valor && <TextItem title="Valor:" text={fCurrency(valor)} />}
      {dados?.origem_fundo && <TextItem title="Origem do fundo:" text={newLineText(dados?.origem_fundo)} />}
      {dados?.finalidade && <TextItem title="Finalidade do fundo:" text={newLineText(dados?.finalidade)} />}
      <TextItem title="Beneficiária residente:" text={dados?.residente ? 'SIM' : 'NÃO'} />
      <ListItem disableGutters divider sx={{ pb: 0.5 }}>
        <Typography variant="subtitle1">Dados do ordenante</Typography>
      </ListItem>
      <TextItem title="Depositante é o próprio titular:" text={dados?.titular_ordenador ? 'SIM' : 'NÃO'} />
      <TextItem title="Nome:" text={dados?.ordenador} />
      <TextItem
        title="Tipo doc. identificação:"
        text={dis?.find((row) => row.id === dados?.tipo_docid)?.label || dados?.tipo_docid}
      />
      <TextItem title="Nº doc. identificação:" text={dados?.docid} />
      <TextItem title="NIF:" text={dados?.nif} />
      <TextItem title="Nome do Pai:" text={dados?.pai} />
      <TextItem title="Nome da Mãe:" text={dados?.mae} />
      <TextItem
        title="Estado civil:"
        text={estadosCivis?.find((row) => row.id === dados?.estado_civil)?.label || dados?.estado_civil}
      />
      {dados?.data_nascimento && <TextItem title="Data nascimento:" text={ptDate(dados?.data_nascimento)} />}
      <TextItem title="Nacionalidade:" text={dados?.nacionalidade} />
      <TextItem title="Local/País de nascimento:" text={dados?.local_pais_nascimento} />
      <TextItem title="Morada:" text={dados?.morada} />
      <TextItem title="Profissão:" text={dados?.profissao} />
      <TextItem title="Local de trabalho:" text={dados?.local_trabalho} />
      <TextItem title="Telefone:" text={dados?.telefone} />
      <TextItem title="Telemóvel:" text={dados?.telemovel} />
      <TextItem title="Email(s):" text={dados?.emails} />
    </List>
  );
}
