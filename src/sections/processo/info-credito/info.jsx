import { useState, useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
// utils
import useToggle from '../../../hooks/useToggle';
import { ptDate } from '../../../utils/formatTime';
import { usePermissao } from '../../../hooks/useAcesso';
import { colorLabel } from '../../../utils/getColorPresets';
import { fCurrency, fPercent } from '../../../utils/formatNumber';
// redux
import { getFromGaji9 } from '../../../redux/slices/gaji9';
import { useSelector, useDispatch } from '../../../redux/store';
import { getFromDigitalDocs } from '../../../redux/slices/digitaldocs';
// components
import Label from '../../../components/Label';
import { TextItem } from '../Detalhes/detalhes';
import { DefaultAction } from '../../../components/Actions';
import { DialogConfirmar } from '../../../components/CustomDialog';
import { TabsWrapperSimple } from '../../../components/TabsWrapper';
import { FormSituacao, EliminarDadosSituacao } from '../form/credito/situacao-form';
// _mock
import { Garantias } from './garantias';
import PareceresCredito from './pareceres';
// import FichaAnalise from './ficha-parecer';

// ---------------------------------------------------------------------------------------------------------------------

export default function InfoCredito({ dados }) {
  const [currentTab, setCurrentTab] = useState('Dados');

  const tabsList = [
    { value: 'Dados', component: <DadosCredito dados={dados} /> },
    { value: 'Garantias', component: <Garantias dados={dados} /> },
    // { value: 'Ficha de análise', component: <FichaAnalise /> },
    { value: 'Pareceres', component: <PareceresCredito /> },
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

function DadosCredito({ dados }) {
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
        {/* {dados?.valor_divida && (
          <Paper sx={{ p: 1, pb: 0.75, my: 0.5, bgcolor: 'background.neutral', flexGrow: 1 }}>
            <Label color="info" startIcon={<InfoOutlinedIcon />}>
              Entidade com crédito em dívida
            </Label>
            <TextItem title="Valor:" text={fCurrency(dados?.valor_divida * 1000)} />
            {dados?.periodo && <TextItem title="Data:" text={ptDate(dados?.periodo)} />}
          </Paper>
        )} */}
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
            {dados?.modificar && (
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
        {dados?.montante_contratado && (
          <TextItem title="Montante contratado:" text={fCurrency(dados?.montante_contratado)} />
        )}
        <TextItem title="Data de aprovação:" text={ptDate(dados?.data_aprovacao)} />
        {dados?.montante_aprovado && <TextItem title="Montante aprovado:" text={fCurrency(dados?.montante_aprovado)} />}
        {dados?.escalao_decisao && situacao !== 'em análise' && (
          <TextItem title="Decisor:" text={dados?.escalao_decisao} />
        )}
        {dados?.taxa_juro && <TextItem title="Taxa de juro:" text={fPercent(dados?.taxa_juro)} />}
        <TextItem
          title="Prazo de amortização:"
          text={`${dados?.prazo_amortizacao ?? '--'}${dados?.prazo_amortizacao?.includes('meses') ? '' : ' meses'}`}
        />
        <TextItem title="Garantia:" text={dados?.garantia} />

        {situacao === 'aprovado' && dados?.modificar && <GerarContrato id={dados?.processoId} />}
      </List>

      {openSituacao === 'atualizar' && <FormSituacao dados={dados} onClose={() => setOpenSituacao('')} />}
      {openSituacao === 'eliminar' && <EliminarDadosSituacao dados={dados} onClose={() => setOpenSituacao('')} />}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function GerarContrato({ id }) {
  const dispatch = useDispatch();
  const { temPermissao } = usePermissao();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { cc } = useSelector((state) => state.intranet);
  const { utilizador } = useSelector((state) => state.gaji9);
  const { isLoading } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    if (!utilizador && cc?.ad_id) dispatch(getFromGaji9('utilizador', { id: cc?.ad_id }));
  }, [dispatch, utilizador, cc?.ad_id]);

  return (
    <>
      {(utilizador?._role === 'GERENTE' || temPermissao(['READ_CREDITO'])) && (
        <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
          <DefaultAction button variant="contained" label="Gerar contrato - GAJi9" onClick={() => onOpen()} />
        </Stack>
      )}
      {open && (
        <DialogConfirmar
          color="success"
          onClose={onClose}
          isSaving={isLoading}
          desc="enviar este processo para a plataforma GAJi9 para proceder à geração do contrato"
          handleOk={() =>
            dispatch(getFromDigitalDocs('contratacao-gaji9', { id, notRest: true, msg: 'Enviado', onClose }))
          }
        />
      )}
    </>
  );
}
