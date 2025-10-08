import * as Yup from 'yup';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray, useFormContext } from 'react-hook-form';
// @mui
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import DialogContent from '@mui/material/DialogContent';
// utils
import { shapeNumberZero } from '../../../components/hook-form/yup-shape';
// redux
import { createItem } from '../../../redux/slices/gaji9';
import { useDispatch, useSelector } from '../../../redux/store';
// components
import { DialogTitleAlt } from '../../../components/CustomDialog';
import { AddItem, DefaultAction, DialogButons } from '../../../components/Actions';
import { FormProvider, RHFTextField, RHFNumberField, RHFAutocompleteSmp } from '../../../components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

export default function CondicionaisForm({ id, onClose }) {
  const dispatch = useDispatch();
  const { isSaving } = useSelector((state) => state.gaji9);

  const methods = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: { condicionais: [{ condicao: null, componente: null }] },
  });

  const { control, handleSubmit } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'condicionais' });

  const onSubmit = (values) => {
    const formData = values?.condicionais.map((item) => mapCondicaoToPayload(item));
    const params = { id, msg: 'Condicionais adicionados', getItem: 'clausula', onClose };
    dispatch(createItem('condicionaisCl', formData, params));
  };

  return (
    <Dialog open fullWidth maxWidth="md">
      <DialogTitleAlt onClose={onClose} title="Adicionar condicionais" sx={{ mb: 2 }} />
      <DialogContent sx={{ p: { xs: 1, sm: 3 } }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {fields.map((field, index) => (
              <CondicionalItem key={field.id} index={index} tamanho={fields.length} remove={remove} />
            ))}
            <Stack direction="row" justifyContent="center">
              <AddItem dados={{ label: 'Condicional' }} onClick={() => append({})} />
            </Stack>
          </Stack>
          <DialogButons isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function CondicionalItem({ index, tamanho = 0, remove }) {
  const { watch, control } = useFormContext();
  const values = watch(`condicionais.${index}`);
  const { fields, append, remove: removeSub } = useFieldArray({ control, name: `condicionais.${index}.sub_alineas` });

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Stack spacing={2} sx={{ bgcolor: 'background.neutral', p: { xs: 1, sm: 1.5 }, borderRadius: 2, flexGrow: 1 }}>
        <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} justifyContent="center">
          <RHFAutocompleteSmp
            name={`condicionais.${index}.condicao`}
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
            <Stack spacing={2} direction="row" sx={{ width: { md: '120%' } }}>
              <RHFNumberField name={`condicionais.${index}.maior_que`} label="Maior que" />
              <RHFNumberField name={`condicionais.${index}.menor_que`} label="Menor que" />
            </Stack>
          )}
          <RHFAutocompleteSmp
            label="Componente afetado"
            name={`condicionais.${index}.componente`}
            options={['Conteúdo principal', 'Número', 'Alínea']}
          />
        </Stack>

        {values?.componente && <Divider />}

        {values?.componente === 'Conteúdo principal' && (
          <RHFTextField multiline minRows={3} name={`condicionais.${index}.conteudo`} label="Conteúdo" />
        )}

        {values?.componente === 'Alínea' && (
          <Stack spacing={2}>
            <Stack spacing={2} direction="row" justifyContent="center">
              <RHFNumberField name={`condicionais.${index}.numero`} label="Número" sx={{ width: 180 }} />
              <RHFNumberField name={`condicionais.${index}.numero_ordem`} label="Alínea" sx={{ width: 180 }} />
            </Stack>
            <RHFTextField multiline minRows={3} name={`condicionais.${index}.conteudo`} label="Conteúdo" />
          </Stack>
        )}

        {values?.componente === 'Número' && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <RHFNumberField name={`condicionais.${index}.numero_ordem`} label="Nº" sx={{ width: 70 }} />
              <RHFTextField multiline minRows={3} name={`condicionais.${index}.conteudo`} label="Conteúdo" />
            </Stack>

            <Stack spacing={2} sx={{ pl: { md: 10 } }}>
              {fields.map((item, subIndex) => (
                <Stack key={item.id} spacing={1} direction="row" alignItems="center">
                  <RHFNumberField
                    size="small"
                    label="Alínea"
                    sx={{ width: 70 }}
                    name={`condicionais.${index}.sub_alineas.${subIndex}.numero_ordem`}
                  />
                  <RHFTextField
                    multiline
                    minRows={3}
                    size="small"
                    label="Conteúdo"
                    name={`condicionais.${index}.sub_alineas.${subIndex}.conteudo`}
                  />
                  <DefaultAction small label="ELIMINAR" onClick={() => removeSub(subIndex)} />
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
      </Stack>
      {tamanho > 1 && <DefaultAction small label="ELIMINAR" onClick={() => remove(index)} />}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

const formSchema = Yup.object().shape({
  condicionais: Yup.array().of(
    Yup.object().shape({
      condicao: Yup.mixed().required().label('Condição'),
      componente: Yup.mixed().required().label('Componente afetado'),

      maior_que: shapeNumberZero('Maior que', ['Prazo', 'Montante', '1ª habitação própria'], 'condicao'),
      menor_que: shapeNumberZero('Menor que', ['Prazo', 'Montante', '1ª habitação própria'], 'condicao'),

      conteudo: Yup.string().when('componente', {
        is: 'Conteúdo principal',
        then: (s) => s.required().label('Conteúdo'),
        otherwise: (s) => s.notRequired(),
      }),

      numero: Yup.number().when('componente', {
        is: 'Alínea',
        then: (s) => s.positive().integer().required().label('Número'),
        otherwise: (s) => s.notRequired(),
      }),

      numero_ordem: Yup.number().when('componente', {
        is: (val) => val === 'Alínea' || val === 'Número',
        then: (s) => s.positive().integer().required().label('Número'),
        otherwise: (s) => s.notRequired(),
      }),

      sub_alineas: Yup.array().when('componente', {
        is: 'Número',
        then: (s) =>
          s.of(
            Yup.object({
              conteudo: Yup.string().required().label('Conteúdo'),
              numero_ordem: Yup.number().positive().integer().label('Alínea'),
            })
          ),
        otherwise: (s) => s.strip(),
      }),
    })
  ),
});

// ---------------------------------------------------------------------------------------------------------------------

function mapCondicaoToPayload(dadosStepper) {
  const conteudo = dadosStepper?.componente;

  return {
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

    ...((conteudo === 'Conteúdo principal' && { conteudo_principal: dadosStepper?.conteudo }) ||
      (conteudo === 'Alínea' && {
        numero_ordem: dadosStepper?.numero,
        sub_alinea: { conteudo: dadosStepper?.conteudo, numero_ordem: dadosStepper?.numero_ordem },
      }) || {
        alinea: {
          conteudo: dadosStepper?.conteudo,
          numero_ordem: dadosStepper?.numero_ordem,
          ...(dadosStepper?.sub_alineas?.length > 0 ? { sub_alineas: dadosStepper?.sub_alineas } : null),
        },
      }),
  };
}
