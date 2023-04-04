import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Grid } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// utils
import { format, add } from 'date-fns';
// redux
import { useSelector, useDispatch } from '../../../redux/store';
import { createItem, updateItem } from '../../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../../routes/paths';
// components
import { FormProvider } from '../../../components/hook-form';
// sections
import ProcessoExternoForm from './ProcessoExternoForm';

// ----------------------------------------------------------------------

ProcessoExterno.propTypes = { isEdit: PropTypes.bool, fluxo: PropTypes.object, selectedProcesso: PropTypes.object };

export default function ProcessoExterno({ isEdit, selectedProcesso, fluxo }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, currentColaborador } = useSelector((state) => state.intranet);
  const { meuAmbiente, processoId, motivosPendencias, done, error, isSaving } = useSelector(
    (state) => state.digitaldocs
  );
  const perfilId = currentColaborador?.perfil_id;
  const [operacao, setOperacao] = useState(selectedProcesso?.operacao || '');
  const [pendente, setPendente] = useState(selectedProcesso?.ispendente || false);

  useEffect(() => {
    if (done === 'processo adicionado') {
      enqueueSnackbar('Processo adicionado com sucesso', { variant: 'success' });
      navigate(`${PATH_DIGITALDOCS.processos.root}/${processoId}`);
    } else if (done === 'processo atualizado') {
      enqueueSnackbar('Processo atualizado com sucesso', { variant: 'success' });
      navigate(`${PATH_DIGITALDOCS.processos.root}/${processoId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const formSchema = Yup.object().shape({
    referencia: Yup.string().required('Referência não pode ficar vazio'),
    canal: Yup.string().required('Canal de entrada não pode ficar vazio'),
    anexos: !isEdit && Yup.array().min(1, 'Introduza pelo menos um anexo'),
    valor: operacao === 'Cativo/Penhora' && Yup.string().required('Indique o valor'),
    origem_id: Yup.mixed().nullable('Origem não pode ficar vazio').required('Origem não pode ficar vazio'),
    data_entrada: Yup.date().typeError('Data de entrada não pode ficar vazio').required('Data não pode ficar vazio'),
    mpendencia:
      pendente &&
      Yup.mixed()
        .nullable('Motivo de pendência não pode ficar vazio')
        .required('Motivo de pendência não pode ficar vazio'),
  });

  const _entidades = useMemo(
    () => selectedProcesso?.entidades?.split(';')?.map((row) => ({ numero: row })) || [],
    [selectedProcesso?.entidades]
  );

  const defaultValues = useMemo(
    () => ({
      anexos: [],
      fluxo_id: fluxo?.id,
      entidades: _entidades,
      obs: selectedProcesso?.obs || '',
      mobs: selectedProcesso?.mobs || '',
      canal: selectedProcesso?.canal || '',
      valor: selectedProcesso?.valor || '',
      conta: selectedProcesso?.conta || '',
      docidp: selectedProcesso?.docidp || '',
      docids: selectedProcesso?.docids || '',
      titular: selectedProcesso?.titular || '',
      cliente: selectedProcesso?.cliente || '',
      operacao: selectedProcesso?.operacao || '',
      referencia: selectedProcesso?.referencia || '',
      ispendente: selectedProcesso?.ispendente || false,
      uo_origem_id: selectedProcesso?.uo_origem_id || meuAmbiente?.uo_id,
      estado_atual_id: selectedProcesso?.estado_atual_id || meuAmbiente?.id,
      perfil_id: selectedProcesso?.perfil_id || currentColaborador?.perfil_id,
      mpendencia: selectedProcesso?.mpendencia
        ? motivosPendencias?.find((row) => row?.id?.toString() === selectedProcesso?.mpendencia?.toString())
        : null,
      origem_id:
        (selectedProcesso?.origem_id && {
          id: selectedProcesso?.origem_id,
          label: `${selectedProcesso?.designacao} - ${selectedProcesso?.seguimento}`,
        }) ||
        null,
      balcao: selectedProcesso?.balcao || Number(currentColaborador?.uo?.balcao),
      data_entrada: selectedProcesso?.data_entrada ? add(new Date(selectedProcesso?.data_entrada), { hours: 2 }) : null,
    }),
    [selectedProcesso, fluxo?.id, motivosPendencias, meuAmbiente, _entidades, currentColaborador]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, reset, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && selectedProcesso) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, selectedProcesso]);

  const onSubmit = async () => {
    try {
      if (selectedProcesso) {
        const formData = new FormData();
        // required
        formData.append('agendado', false);
        formData.append('balcao', values.balcao);
        formData.append('fluxo_id', values.fluxo_id);
        formData.append('uo_perfil_id ', currentColaborador?.uo?.id);
        formData.append('is_interno ', selectedProcesso?.is_interno);
        formData.append('data_entrada', format(values.data_entrada, 'yyyy-MM-dd'));
        // optional
        if (values.obs) {
          formData.append('obs', values.obs);
        }
        if (values.mobs) {
          formData.append('mobs', values.mobs);
        }
        if (values.conta) {
          formData.append('conta', values.conta);
        }
        if (values.docidp) {
          formData.append('docidp', values.docidp);
        }
        if (values.docids) {
          formData.append('docids', values.docids);
        }
        if (values.cliente) {
          formData.append('cliente', values.cliente);
        }
        if (values.titular) {
          formData.append('titular', values.titular);
        }
        if (values?.entidades?.length !== 0) {
          formData.append(
            'entidades',
            values.entidades.map((row) => row?.numero)
          );
        }
        if (values.referencia) {
          formData.append('referencia', values.referencia);
        }
        if (values.origem_id) {
          formData.append('origem_id', values?.origem_id?.id);
        }
        if (values.canal) {
          formData.append('canal', values.canal);
        }
        if (values.valor) {
          formData.append('valor', values.valor);
        }
        if (values.operacao) {
          formData.append('operacao', values.operacao);
        }
        formData.append('ispendente', values.ispendente);
        if (values.mpendencia) {
          formData.append('mpendencia', values.mpendencia.id);
        }
        if (values?.anexos?.length > 0) {
          for (let i = 0; i < values.anexos.length; i += 1) {
            formData.append('anexos', values.anexos[i]);
          }
        }
        dispatch(
          updateItem('processo', formData, {
            mail,
            perfilId,
            id: selectedProcesso?.id,
            ispendente: values.ispendente,
            mensagem: 'processo atualizado',
            abandonar: { perfilID: perfilId, fluxoID: values?.fluxo_id, estadoID: values?.estado_atual_id },
          })
        );
      } else {
        const formData = new FormData();
        // required
        formData.append('balcao', values.balcao);
        formData.append('fluxo_id', values.fluxo_id);
        formData.append('perfil_id', values.perfil_id);
        formData.append('referencia', values.referencia);
        formData.append('origem_id', values?.origem_id?.id);
        formData.append('uo_origem_id', values.uo_origem_id);
        formData.append('estado_atual_id', values.estado_atual_id);
        formData.append('data_entrada', format(values.data_entrada, 'yyyy-MM-dd'));
        // optional
        if (values.obs) {
          formData.append('obs', values.obs);
        }
        if (values.canal) {
          formData.append('canal', values.canal);
        }
        if (values.valor) {
          formData.append('valor', values.valor);
        }
        if (values.conta) {
          formData.append('conta', values.conta);
        }
        if (values.docidp) {
          formData.append('docidp', values.docidp);
        }
        if (values.docids) {
          formData.append('docids', values.docids);
        }
        if (values.titular) {
          formData.append('titular', values.titular);
        }
        if (values.cliente) {
          formData.append('cliente', values.cliente);
        }
        if (values?.entidades?.length !== 0) {
          formData.append(
            'entidades',
            values.entidades.map((row) => row?.numero)
          );
        }
        if (values.operacao) {
          formData.append('operacao', values.operacao);
        }
        if (values.ispendente) {
          formData.append('ispendente', values.ispendente);
          formData.append('mpendencia', values?.mpendencia?.id);
          if (values.mobs) {
            formData.append('mobs', values.mobs);
          }
        }
        if (values.anexos) {
          const listaanexo = values.anexos;
          for (let i = 0; i < listaanexo.length; i += 1) {
            formData.append('anexos', listaanexo[i]);
          }
        }
        dispatch(
          createItem('processo externo', formData, {
            mail,
            perfilId,
            fluxoId: fluxo?.id,
            estadoId: meuAmbiente?.id,
            ispendente: values.ispendente,
            mensagem: 'processo adicionado',
            abandonar: { perfilID: perfilId, fluxoID: values?.fluxo_id, estadoID: values?.estado_atual_id },
          })
        );
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ProcessoExternoForm
            operacao={operacao}
            selectedProcesso={selectedProcesso}
            setOperacao={setOperacao}
            setPendente={setPendente}
          />
        </Grid>

        <Grid item xs={12} textAlign="center">
          <LoadingButton size="large" type="submit" variant="contained" loading={isSaving}>
            {!isEdit ? 'Adicionar' : 'Guardar'}
          </LoadingButton>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
