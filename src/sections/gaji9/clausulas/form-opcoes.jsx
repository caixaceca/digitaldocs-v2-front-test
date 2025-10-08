import * as Yup from 'yup';
import { useMemo, useCallback } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
// @mui
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
// utils
import { listaProdutos, listaTitrulares } from '../applySortFilter';
import { shapeNumberZero } from '../../../components/hook-form/yup-shape';
// redux
import { createItem } from '../../../redux/slices/gaji9';
import { useSelector, useDispatch } from '../../../redux/store';
import { updateDados, resetDados } from '../../../redux/slices/stepper';
// components
import {
  FormProvider,
  RHFTextField,
  RHFNumberField,
  RHFAutocompleteObj,
  RHFAutocompleteSmp,
} from '../../../components/hook-form';
import Steps from '../../../components/Steps';
import { SearchVariavel } from './form-clausula';
import { DialogTitleAlt } from '../../../components/CustomDialog';
import { AddItem, DefaultAction, DialogButons, ButtonsStepper } from '../../../components/Actions';

// ---------------------------------------------------------------------------------------------------------------------

export function TiposTitularesForm({ id, onClose }) {
  const { clausula, tiposTitulares } = useSelector((state) => state.gaji9);
  const ids = extrairIds(clausula, 'tipos_titulares');

  return (
    <OpcoesForm
      onClose={onClose}
      options={listaTitrulares(tiposTitulares)?.filter(({ id }) => !ids?.includes(id))}
      dados={{ id, label: 'Tipos de titular', labelP: 'tipos de titular', item: 'tiposTitularesCl' }}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function SegmentosForm({ id, dados, onClose }) {
  const { segmentos } = useSelector((state) => state.gaji9);
  const ids = extrairIds(dados, 'segmentos');

  return (
    <OpcoesForm
      onClose={onClose}
      dados={{ id, label: 'Segmento', labelP: 'segmentos', item: 'segmentosCl' }}
      options={segmentos
        ?.filter(({ id }) => !ids?.includes(id))
        ?.map(({ id, designacao }) => ({ id, label: designacao }))}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function ComponetesForm({ id, onClose }) {
  const { selectedItem, componentes } = useSelector((state) => state.gaji9);
  const ids = extrairIds(selectedItem, 'componentes');

  return (
    <OpcoesForm
      onClose={onClose}
      options={listaProdutos(componentes)?.filter(({ id }) => !ids?.includes(id))}
      dados={{ id, label: 'Componente', labelP: 'componentes', item: 'componentesSeg' }}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function FinalidadesForm({ id, onClose }) {
  const { selectedItem, finalidades } = useSelector((state) => state.gaji9);
  const ids = extrairIds(selectedItem, 'finalidades');

  return (
    <OpcoesForm
      onClose={onClose}
      dados={{ id, label: 'Finalidade', labelP: 'finalidades', item: 'finalidadesSeg' }}
      options={finalidades?.filter(({ id }) => !ids?.includes(id))?.map(({ id, tipo }) => ({ id, label: tipo }))}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function OpcoesForm({ dados, options, onClose }) {
  const dispatch = useDispatch();
  const { id, label, labelP, item } = dados;
  const { isSaving } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    items: Yup.array(Yup.object({ item: Yup.mixed().required().label(label) })),
  });
  const defaultValues = useMemo(() => ({ items: [{ item: null }] }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const onSubmit = async () => {
    const getItem = item === 'componentesSeg' || item === 'finalidadesSeg' ? 'selectedItem' : 'clausula';
    const params = { patch: true, getItem, id, msg: 'Items adicionados', onClose };
    dispatch(createItem(item, JSON.stringify(values?.items?.map(({ item }) => item?.id)), params));
  };

  return (
    <Dialog open fullWidth maxWidth="sm" onClose={onClose}>
      <DialogTitleAlt
        sx={{ mb: 2 }}
        title={`Adicionar ${labelP}`}
        action={<AddItem dados={{ small: true }} onClick={() => append({ item: null })} />}
      />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {fields.map((item, index) => (
              <Stack direction="row" alignItems="center" spacing={2} key={item.id}>
                <RHFAutocompleteObj
                  label={label}
                  options={options}
                  name={`items[${index}].item`}
                  getOptionDisabled={(option) => values.items.some(({ item }) => item?.id === option.id)}
                />
                {values.items.length > 1 && <DefaultAction small label="ELIMINAR" onClick={() => remove(index)} />}
              </Stack>
            ))}
          </Stack>
          <DialogButons isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function CondicionalForm({ id, dados = useCallback, onClose }) {
  const dispatch = useDispatch();
  const { activeStep } = useSelector((state) => state.stepper);

  const onClose1 = useCallback(() => {
    onClose();
    dispatch(resetDados());
  }, [onClose, dispatch]);

  return (
    <Dialog open fullWidth maxWidth="md">
      <DialogTitleAlt
        onClose={() => onClose1()}
        title="Adicionar condicional"
        content={
          <>
            <Steps activeStep={activeStep} steps={['Condição', 'Conteúdo']} sx={{ mt: 3 }} />
            {activeStep === 1 && <SearchVariavel />}
          </>
        }
      />
      <DialogContent>
        {activeStep === 0 && <Condicao onClose={onClose1} dados={dados} />}
        {activeStep === 1 && <Conteudo onClose={onClose1} dados={dados} id={id} />}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Condicao({ onClose, dados }) {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);

  const formSchema = Yup.object().shape({
    condicao: Yup.mixed().required().label('Condição'),
    componente: Yup.mixed().required().label('Componente afetado'),
    maior_que: shapeNumberZero('Valor maior que', ['Prazo', 'Montante', '1ª habitação própria'], 'condicao'),
    menor_que: shapeNumberZero('Valor menor que', ['Prazo', 'Montante', '1ª habitação própria'], 'condicao'),
  });

  const defaultValues = useMemo(
    () => ({
      condicao: dadosStepper?.condicao || null,
      menor_que: dadosStepper?.menor_que || '',
      maior_que: dadosStepper?.maior_que || '',
      componente: dadosStepper?.componente || dados?.componente || null,
    }),
    [dados, dadosStepper]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Stack spacing={3} sx={{ pt: 1 }}>
        <RHFAutocompleteSmp
          name="componente"
          label="Componente afetado"
          disabled={!!dados?.componente}
          options={['Conteúdo principal', 'Número', 'Alínea']}
        />
        <Stack spacing={3} direction="row" justifyContent="center">
          <RHFAutocompleteSmp
            name="condicao"
            label="Condição"
            options={[
              'Prazo',
              'Montante',
              'Com NIP',
              'Com seguro',
              'Com prazo de utilização',
              'Com 3º outorgante',
              'Isenção de comissão',
              'Taxa juros negociada',
              '1ª habitação própria',
              'Construção',
              'Revolving',
              'Bonificado',
              'Jovem bonificado',
              'Colaborador de empresa parceira',
            ]}
          />
          {(values?.condicao === 'Prazo' ||
            values?.condicao === 'Montante' ||
            values?.condicao === '1ª habitação própria') && (
            <>
              <RHFNumberField name="maior_que" label="Valor maior que" />
              <RHFNumberField name="menor_que" label="Valor menor que" />
            </>
          )}
        </Stack>
      </Stack>
      <ButtonsStepper onClose={onClose} labelCancel="Cancelar" />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Conteudo({ dados, onClose, id }) {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);
  const conteudo = useMemo(() => dadosStepper?.componente, [dadosStepper?.componente]);

  const formSchema = Yup.object().shape(
    (conteudo === 'Conteúdo principal' && {
      conteudo: Yup.string().required().label('Conteúdo'),
    }) ||
      (conteudo === 'Alínea' && {
        conteudo: Yup.string().required().label('Conteúdo'),
        numero: Yup.number().positive().integer().label('Número'),
        numero_ordem: Yup.number().positive().integer().label('Alínea'),
      }) || {
        numero_ordem: Yup.number().positive().integer().label('Número'),
        sub_alineas: Yup.array(
          Yup.object({
            conteudo: Yup.string().required().label('Conteúdo'),
            numero_ordem: Yup.number().positive().integer().label('Alínea'),
          })
        ),
      }
  );

  const defaultValues = useMemo(
    () =>
      (conteudo === 'Conteúdo principal' && {
        conteudo: dadosStepper?.conteudo || dados?.conteudo || '',
      }) ||
      (conteudo === 'Alínea' && {
        numero: dadosStepper?.numero || dados?.numero || '',
        conteudo: dadosStepper?.conteudo || dados?.conteudo || '',
        numero_ordem: dadosStepper?.numero_ordem || dados?.numero_ordem || '',
      }) || {
        conteudo: dadosStepper?.conteudo || dados?.conteudo || '',
        sub_alineas: dadosStepper?.sub_alineas || dados?.sub_alineas || [],
        numero_ordem: dadosStepper?.numero_ordem || dados?.numero_ordem || '',
      },
    [conteudo, dadosStepper, dados]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { append, remove, fields } = useFieldArray({ control, name: 'sub_alineas' });

  const onSubmit = async () => {
    const formData = {
      ...(dadosStepper?.condicao === 'Com NIP' ? { com_nip: true } : null),
      ...(dadosStepper?.condicao === 'Revolving' ? { revolving: true } : null),
      ...(dadosStepper?.condicao === 'Com seguro' ? { com_seguro: true } : null),
      ...(dadosStepper?.condicao === 'Bonificado' ? { bonificado: true } : null),
      ...(dadosStepper?.condicao === 'Construção' ? { construcao: true } : null),
      ...(dadosStepper?.condicao === 'Jovem bonificado' ? { jovem_bonificado: true } : null),
      ...(dadosStepper?.condicao === 'Isenção de comissão' ? { isencao_comissao: true } : null),
      ...(dadosStepper?.condicao === 'Taxa juros negociada' ? { taxa_juros_negociado: true } : null),
      ...(dadosStepper?.condicao === 'Com 3º outorgante' ? { com_terceiro_outorgante: true } : null),
      ...(dadosStepper?.condicao === 'Com prazo de utilização' ? { com_prazo_utilizacao: true } : null),
      ...(dadosStepper?.condicao === 'Colaborador de empresa parceira' ? { colaborador_empresa_parceira: true } : null),
      ...(dadosStepper?.condicao === 'Prazo'
        ? { prazo_maior_que: dadosStepper.maior_que, prazo_menor_que: dadosStepper.menor_que }
        : null),
      ...(dadosStepper?.condicao === 'Montante'
        ? { montante_maior_que: dadosStepper.maior_que, montante_menor_que: dadosStepper.menor_que }
        : null),
      ...(dadosStepper?.condicao === '1ª habitação própria'
        ? {
            habitacao_propria_1: true,
            montante_maior_que: dadosStepper.maior_que,
            montante_menor_que: dadosStepper.menor_que,
          }
        : null),

      ...((conteudo === 'Conteúdo principal' && {
        conteudo_principal: values?.conteudo,
      }) ||
        (conteudo === 'Alínea' && {
          numero_ordem: values?.numero,
          sub_alinea: { conteudo: values?.conteudo, numero_ordem: values?.numero_ordem },
        }) || {
          alinea: {
            conteudo: values?.conteudo,
            numero_ordem: values?.numero_ordem,
            ...(values?.sub_alineas?.length > 0 ? { sub_alineas: values?.sub_alineas } : null),
          },
        }),
    };
    const params = { id, msg: 'Condicional adicionado', getItem: 'clausula', onClose };
    dispatch(createItem('condicionalCl', JSON.stringify(formData), params));
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      {(conteudo === 'Conteúdo principal' && (
        <Stack spacing={3} justifyContent="center" sx={{ pt: 1 }}>
          <RHFTextField multiline minRows={3} maxRows={10} label="Conteúdo" name="conteudo" />
        </Stack>
      )) ||
        (conteudo === 'Alínea' && (
          <Stack spacing={3} justifyContent="center" sx={{ pt: 1 }}>
            <Stack spacing={3} direction="row" justifyContent="center">
              <RHFNumberField name="numero" label="Número" sx={{ width: 180 }} />
              <RHFNumberField name="numero_ordem" label="Alínea" sx={{ width: 180 }} />
            </Stack>
            <RHFTextField multiline minRows={3} maxRows={10} label="Conteúdo" name="conteudo" />
          </Stack>
        )) || (
          <Stack sx={{ pt: 1 }}>
            <Stack spacing={3} direction="row" justifyContent="center">
              <RHFNumberField name="numero_ordem" label="Nº" sx={{ width: 100 }} />
              <RHFTextField multiline minRows={3} maxRows={10} label="Conteúdo" name="conteudo" />
            </Stack>
            <Stack spacing={2} sx={{ pl: { md: 14 }, mt: 3 }}>
              {fields.map((item, index) => (
                <Stack spacing={1} direction="row" alignItems="center" key={`sub_alinea_${item.id}`}>
                  <Stack spacing={1} direction="row" alignItems="center" justifyContent="center" sx={{ flexGrow: 1 }}>
                    <RHFNumberField
                      size="small"
                      label="Alínea"
                      sx={{ width: 70 }}
                      name={`sub_alineas[${index}].numero_ordem`}
                    />
                    <RHFTextField
                      multiline
                      minRows={3}
                      maxRows={10}
                      size="small"
                      label="Conteúdo"
                      name={`sub_alineas[${index}].conteudo`}
                    />
                  </Stack>
                  <DefaultAction small label="ELIMINAR" onClick={() => remove(index)} />
                </Stack>
              ))}
              <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
                <AddItem
                  dados={{ small: true, label: 'Alínea' }}
                  onClick={() => append({ ativo: true, numero_ordem: fields?.length + 1, conteudo: '' })}
                />
              </Stack>
            </Stack>
          </Stack>
        )}
      <ButtonsStepper onClose={() => dispatch(updateDados({ backward: true, dados: values }))} />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function extrairIds(dados, item) {
  const ids = [];
  if (item === 'segmentos' && dados?.segmento_id != null) ids.push(dados.segmento_id);
  if (item === 'componentes' && dados?.componente_id != null) ids.push(dados.componente_id);
  if (item === 'finalidades' && dados?.finalidade_id != null) ids.push(dados.finalidade_id);
  if (item === 'tipos_titulares' && dados?.tipo_titular_id != null) ids.push(dados.tipo_titular_id);
  if (Array.isArray(dados?.[item])) {
    dados?.[item].forEach((t) => {
      if (t?.id !== null && t.ativo) ids.push(t.id);
    });
  }
  return ids;
}
