// @mui
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
// utils
import { ptDate } from '../../../utils/formatTime';
import { fCurrency } from '../../../utils/formatNumber';
// components
import { TextItem } from './detalhes';
import { newLineText } from '../../../components/Panel';
// _mock
import { tiposDocumentos, estadosCivis } from '../../../_mock';

// ---------------------------------------------------------------------------------------------------------------------

export default function InfoCon({ dados }) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 4 }} sx={{ p: { xs: 1, sm: 3 } }}>
      <List sx={{ width: 1, pt: 0 }}>
        <ListItem disableGutters divider sx={{ pb: 0.5, pt: 0, mb: 0.5 }}>
          <Typography variant="subtitle1">Operação</Typography>
        </ListItem>
        <TextItem title="Nº da operação:" text={dados?.numero} />
        <TextItem title="Valor:" text={fCurrency(dados?.valor)} />
        <TextItem title="Origem do fundo:" text={newLineText(dados?.origem_fundo)} />
        <TextItem title="Finalidade do fundo:" text={newLineText(dados?.finalidade)} />
        <TextItem title="Beneficiário residente:" text={dados?.residente ? 'SIM' : 'NÃO'} />
      </List>
      <List sx={{ width: 1, pt: 0 }}>
        <ListItem disableGutters divider sx={{ pb: 0.5, pt: 0, mb: 0.5 }}>
          <Typography variant="subtitle1">Dados do ordenante</Typography>
        </ListItem>
        <TextItem title="Depositante é o próprio titular:" text={dados?.titular_ordenador ? 'SIM' : 'NÃO'} />
        <TextItem title="Nome:" text={dados?.ordenador} />
        <TextItem title="NIF:" text={dados?.nif} />
        <TextItem
          title="Doc. identificação:"
          text={`${dados?.docid}${dados?.tipo_docid ? ` (${tiposDocumentos?.find(({ id }) => id === dados?.tipo_docid)?.label || dados?.tipo_docid})` : ''}`}
        />
        <TextItem
          title="Filiação:"
          text={`${dados?.pai ?? ''}${dados?.pai && dados?.mae ? ' e ' : ''}${dados?.mae ?? ''}`}
        />
        <TextItem
          title="Estado civil:"
          text={estadosCivis?.find(({ id }) => id === dados?.estado_civil)?.label || dados?.estado_civil}
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
    </Stack>
  );
}
