import { useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
// utils
import { useSelector } from '../../../redux/store';
import { ptDate } from '../../../utils/formatTime';
import { colorLabel } from '../../../utils/getColorPresets';
import { fCurrency, fPercent } from '../../../utils/formatNumber';
import { formatPrazoAmortizacao } from '../../../utils/formatText';
import { processoEstadoInicial, emailCheck } from '../../../utils/validarAcesso';
// components
import Label from '../../../components/Label';
import { TextItem } from '../Detalhes/detalhes';
import { DefaultAction } from '../../../components/Actions';
import { TabsWrapperSimple } from '../../../components/TabsWrapper';
import { FormSituacao, EliminarDadosSituacao } from '../form/credito/situacao-form';
//
import Fincc from './fin/fincc';
import PareceresCredito from './pareceres';
import FichaAnalise from './ficha-parecer';
import MetadadosCredito from './metadados-credito';
import EnviarContratacao from './enviar-contratacao';
import TableGarantias from './garantias/table-garantias';
import ModeloCartaProposta from './carta-proposta/modelos-cartas-proposta';

const itemStyleAlt = { p: 0, mt: 0, minHeight: 20, backgroundColor: 'transparent' };

// ---------------------------------------------------------------------------------------------------------------------

export default function InfoCredito({ dados }) {
  const [currentTab, setCurrentTab] = useState('Caracterização');

  const { mail } = useSelector((state) => state.intranet);
  const { meusAmbientes } = useSelector((state) => state.parametrizacao);
  const estadoInicial = processoEstadoInicial(meusAmbientes, dados?.estado?.estado_id);

  const modificar = dados?.estado?.preso && dados?.estado?.atribuidoAMim;

  const tabsList = [
    { value: 'Caracterização', component: <DadosCredito dados={dados} modificar={modificar} mail={mail} /> },
    {
      value: 'Condições financeiras',
      component: (
        <MetadadosCredito
          modificar={modificar}
          dados={dados?.gaji9_metadados}
          ids={{ processoId: dados?.processoId, creditoId: dados?.id }}
        />
      ),
    },
    {
      value: 'Garantias',
      component: (
        <TableGarantias
          dados={dados?.garantias ?? []}
          outros={{ modificar, creditoId: dados?.id, processoId: dados?.processoId }}
        />
      ),
    },
    ...(modificar && estadoInicial ? [{ value: 'Ficha de análise', component: <FichaAnalise /> }] : []),
    { value: 'Pareceres', component: <PareceresCredito infoCredito /> },
  ];

  return (
    <Stack sx={{ p: { xs: 1, sm: 3 } }}>
      <TabsWrapperSimple
        sx={{ mb: 3 }}
        tabsList={tabsList}
        currentTab={currentTab}
        changeTab={(event, newValue) => setCurrentTab(newValue)}
      />
      <Box>{tabsList?.find(({ value }) => value === currentTab)?.component}</Box>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function DadosCredito({ dados, modificar, mail }) {
  const [openSituacao, setOpenSituacao] = useState('');
  const situacao = (dados?.situacao_final_mes || 'em análise').toLowerCase();

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 4 }}>
      <List sx={{ width: 1, p: 0 }}>
        <ListItem disableGutters divider sx={{ pt: 0, pb: 0.5, mb: 0.5, height: 35 }}>
          <Typography variant="subtitle1">Pedido</Typography>
        </ListItem>
        <TextItem title="Nº de proposta:" text={dados?.numero_proposta || 'Não definido'} />
        <TextItem title="Montante solicitado:" text={fCurrency(dados?.montante_solicitado)} />
        <TextItem title="Finalidade:" text={dados?.finalidade} />
        <TextItem title="Componente:" text={dados?.componente || 'Não definido'} />
        <TextItem title="Linha de crédito:" text={dados?.linha} />
        <TextItem title="Tipo de titular:" text={dados?.tipo_titular || 'Não definido'} />
        <TextItem title="Segmento:" text={dados?.segmento} />
        <TextItem title="Ent. patronal/Set. atividade:" text={dados?.setor_atividade} />
        {dados?.valor_divida && (
          <Paper sx={{ p: 1, pb: 0.5, mt: 0.5, bgcolor: 'background.neutral', flexGrow: 1 }}>
            <Label color="info" startIcon={<InfoOutlinedIcon />}>
              Entidade com crédito em dívida
            </Label>
            <TextItem title="Valor:" text={fCurrency(dados?.valor_divida)} sx={itemStyleAlt} />
            <TextItem title="Data:" text={ptDate(dados?.periodo)} sx={itemStyleAlt} />
          </Paper>
        )}
      </List>

      <List sx={{ width: 1, p: 0 }}>
        <ListItem disableGutters divider sx={{ pt: 0, pb: 0.5, mb: 0.5, height: 35 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle1">Situação</Typography>
              <Label color={colorLabel(situacao)} variant="filled" sx={{ p: 1.5 }}>
                {situacao}
              </Label>
            </Stack>
            {modificar && (
              <Stack direction="row" alignItems="center" spacing={1}>
                {(situacao === 'em análise' || situacao === 'aprovado') && (
                  <DefaultAction button small label="EDITAR" onClick={() => setOpenSituacao('atualizar')} />
                )}
                {situacao !== 'em análise' && (
                  <DefaultAction small label="ELIMINAR" onClick={() => setOpenSituacao('eliminar')} />
                )}
              </Stack>
            )}
          </Stack>
        </ListItem>

        <TextItem title="Data de desistência:" text={ptDate(dados?.data_desistido)} />
        <TextItem title="Data de indeferimento:" text={ptDate(dados?.data_indeferido)} />
        <TextItem title="Data de contratação:" text={ptDate(dados?.data_contratacao)} />
        {dados?.montante_contratado ? (
          <TextItem title="Montante contratado:" text={fCurrency(dados?.montante_contratado)} />
        ) : null}
        <TextItem title="Data de aprovação:" text={ptDate(dados?.data_aprovacao)} />
        {dados?.montante_aprovado ? (
          <TextItem title="Montante aprovado:" text={fCurrency(dados?.montante_aprovado)} />
        ) : null}
        {dados?.escalao_decisao && situacao !== 'em análise' && (
          <TextItem title="Decisor:" text={dados?.escalao_decisao} />
        )}
        {dados?.taxa_juro ? <TextItem title="Taxa de juro:" text={fPercent(dados?.taxa_juro)} /> : null}
        <TextItem title="Prazo de amortização:" text={formatPrazoAmortizacao(dados?.prazo_amortizacao)} />
        <TextItem title="Garantia:" text={dados?.garantia} />

        {situacao === 'aprovado' && modificar && <EnviarContratacao dados={dados} />}

        {(dados?.nivel_decisao || dados?.enviado_para_contratacao) && (
          <Stack direction="row" justifyContent="center" spacing={2} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
            {dados?.nivel_decisao && (
              <Label startIcon={<InfoOutlinedIcon />}>
                <Typography variant="caption">Nível de decisão:</Typography>
                &nbsp;
                {` ${dados?.nivel_decisao} - `}
                {(dados?.nivel_decisao === 1 && 'Comité Base') ||
                  (dados?.nivel_decisao === 2 && 'Comité Diretor') ||
                  (dados?.nivel_decisao === 3 && 'Comité Superior')}
              </Label>
            )}
            {dados?.enviado_para_contratacao && <Label startIcon={<InfoOutlinedIcon />}>Enviado para GAJ-i9</Label>}
          </Stack>
        )}

        {situacao === 'em análise' && emailCheck(mail) && <Fincc />}
        {situacao === 'aprovado' && emailCheck(mail) && <ModeloCartaProposta />}
      </List>

      {openSituacao === 'atualizar' && <FormSituacao dados={dados} onClose={() => setOpenSituacao('')} />}
      {openSituacao === 'eliminar' && <EliminarDadosSituacao dados={dados} onClose={() => setOpenSituacao('')} />}
    </Stack>
  );
}
