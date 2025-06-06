import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useEffect, useState, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
// utils
import { fNumber } from '../../utils/formatNumber';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { getFromGaji9, createItem, deleteItem } from '../../redux/slices/gaji9';
// components
import DetalhesGaji9 from './detalhes-gaji9';
import GridItem from '../../components/GridItem';
import { TableSearchNotFound } from '../../components/table';
import { CellChecked, noDados } from '../../components/Panel';
import { DefaultAction, DialogButons } from '../../components/Actions';
import { DialogTitleAlt, DialogConfirmar } from '../../components/CustomDialog';
import { RHFSwitch, FormProvider, RHFNumberField, RHFAutocompleteObj } from '../../components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

export default function OpcoesClausula() {
  const dispatch = useDispatch();
  const [modal, setModal] = useState('');
  const { isSaving, selectedItem, minuta } = useSelector((state) => state.gaji9);
  const clausula = minuta?.clausulas?.find(({ clausula_id: cid }) => cid === selectedItem?.id);
  const opcoes = clausula?.opcoes || [];

  useEffect(() => {
    dispatch(getFromGaji9('clausulas', { condicional: true }));
  }, [dispatch]);

  const openModal = (modal, id) => {
    setModal(modal);
    if (modal === 'detalhes') dispatch(getFromGaji9('clausula', { id, item: 'clausulaOpcional' }));
  };

  const eliminarRegra = () => {
    const params = { minutaId: minuta?.id, condicionalId: modal, clausulaId: clausula?.clausula_id };
    dispatch(deleteItem('eliminarRegra', { ...params, msg: 'Regra eliminada', onClose: () => setModal('') }));
  };

  return (
    <>
      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell size="small">Cláusula</TableCell>
            <TableCell size="small" align="right">
              Montante
            </TableCell>
            <TableCell size="small" align="right">
              Prazo
            </TableCell>
            <TableCell size="small">Taxa negociada</TableCell>
            <TableCell size="small">2ª habitação</TableCell>
            <TableCell size="small">Isenção comissão</TableCell>
            <TableCell size="small" align="rigth" width={10}>
              <Stack direction="row" justifyContent="right">
                <DefaultAction small label="Adicionar" onClick={() => openModal('create', '')} />
              </Stack>
            </TableCell>
          </TableRow>
        </TableHead>
        {opcoes?.length === 0 ? (
          <TableSearchNotFound height={150} message="Nenhuma regra adicionada..." />
        ) : (
          <TableBody>
            {opcoes?.map((row, index) => (
              <TableRow haver key={`regra_${index}`}>
                <TableCell>{clausula?.titulo || noDados()}</TableCell>
                <TableCell align="right">
                  {row?.montante_maior_que && <Typography>{`> ${fNumber(row?.montante_maior_que)}`}</Typography>}
                  {row?.montante_menor_que && <Typography>{`< ${fNumber(row?.montante_menor_que)}`}</Typography>}
                  {!row?.montante_maior_que && !row?.montante_menor_que && noDados('(Não definido)')}
                </TableCell>
                <TableCell align="right">
                  {row?.prazo_maior_que && <Typography>{`> ${fNumber(row?.prazo_maior_que)}`}</Typography>}
                  {row?.prazo_menor_que && <Typography>{`< ${fNumber(row?.prazo_menor_que)}`}</Typography>}
                  {!row?.prazo_maior_que && !row?.prazo_menor_que && noDados('(Não definido)')}
                </TableCell>
                <CellChecked check={row?.taxa_juros_negociado} />
                <CellChecked check={row?.segunda_habitacao} />
                <CellChecked check={row?.isencao_comissao} />
                <TableCell>
                  <Stack direction="row" spacing={0.75}>
                    <DefaultAction small label="ELIMINAR" onClick={() => openModal(row?.clausula_id, '')} />
                    <DefaultAction small label="DETALHES" onClick={() => openModal('detalhes', row?.clausula_id)} />
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>

      {modal === 'detalhes' && <DetalhesGaji9 closeModal={() => setModal('')} item="clausulas" opcao />}
      {modal === 'create' && <RegraForm onClose={() => setModal('')} dados={selectedItem} minutaId={minuta?.id} />}
      {!!modal && modal !== 'create' && modal !== 'detalhes' && (
        <DialogConfirmar
          isSaving={isSaving}
          desc="eliminar esta regra"
          onClose={() => setModal('')}
          handleOk={() => eliminarRegra()}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

RegraForm.propTypes = { dados: PropTypes.object, minutaId: PropTypes.number, onClose: PropTypes.func };

function RegraForm({ dados, minutaId, onClose }) {
  const dispatch = useDispatch();
  const { isSaving, clausulas } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({ clausula_id: Yup.mixed().required().label('Cláusula') });
  const defaultValues = useMemo(
    () => ({
      clausula_id: null,
      prazo_maior_que: null,
      prazo_menor_que: null,
      montante_maior_que: null,
      montante_menor_que: null,
      representante: false,
      isencao_comissao: false,
      segunda_habitacao: false,
      taxa_juros_negociado: false,
    }),
    []
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    const params = { minutaId, msg: 'Regra adicionada', onClose, clausulaId: dados?.id };
    dispatch(
      createItem('regrasClausula', JSON.stringify([{ ...values, clausula_id: values?.clausula_id?.id }]), params)
    );
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitleAlt title="Adicionar regras" />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ pt: 3 }}>
            <GridItem
              children={
                <RHFAutocompleteObj
                  label="Cláusula"
                  name="clausula_id"
                  options={clausulas
                    ?.filter(({ titulo }) => titulo === dados?.titulo)
                    ?.map(({ id, titulo }) => ({ id, label: `${titulo} (ID: ${id})` }))}
                />
              }
            />
            <GridItem xs={6} children={<RHFNumberField label="Montante maior que" name="montante_maior_que" />} />
            <GridItem xs={6} children={<RHFNumberField label="Montante menor que" name="montante_menor_que" />} />
            <GridItem xs={6} children={<RHFNumberField label="Prazo maior que" name="prazo_maior_que" />} />
            <GridItem xs={6} children={<RHFNumberField label="Prazo menor que" name="prazo_menor_que" />} />
            <GridItem xs={6} children={<RHFSwitch name="isencao_comissao" label="Isenção de comissão" />} />
            <GridItem xs={6} children={<RHFSwitch name="segunda_habitacao" label="Segunda habitação" />} />
            <GridItem xs={6} children={<RHFSwitch name="taxa_juros_negociado" label="Taxa juros negociada" />} />
            <GridItem xs={6} children={<RHFSwitch name="representante" label="Representante" />} />
          </Grid>
          <DialogButons isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
