import * as Yup from 'yup';

// ----------------------------------------------------------------------

const anexosObrigatoriosSchema = Yup.array()
  .min(1, 'Pelo menos um documento é necessário')
  .of(Yup.object().shape({ file: Yup.mixed().required('Introduza um ficheiro.') }));

export const shapeAnexos = (isEdit, outros, checkList) =>
  Yup.object().shape({
    anexos:
      !isEdit && outros && checkList?.length === 0
        ? Yup.array().min(1, 'Pelo menos um documento é necessário.')
        : Yup.array(),
    checklist: Yup.array().of(
      Yup.object().shape({
        anexos: Yup.array().when('obrigatorio', {
          is: true,
          then: () => anexosObrigatoriosSchema,
          otherwise: () => Yup.array().of(Yup.object().shape({ file: Yup.mixed().notRequired() })),
        }),
      })
    ),
  });

// ----------------------------------------------------------------------

export const defaultAnexos = (dadosStepper, checkList) => ({
  anexos: dadosStepper?.anexos || [],
  checklist: (dadosStepper?.checklist || checkList).map((doc) => ({
    ...doc,
    anexos: doc.anexos?.length
      ? doc.anexos
      : [{ file: null, data_emissao: null, data_validade: null, numero_entidade: '' }],
  })),
});

// ----------------------------------------------------------------------

const limparValoresNulos = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== '' && value !== null && value !== undefined));

export const garantiasAssociadas = (garantias) =>
  garantias?.map((row) => limparValoresNulos({ ...row, tipo_garantia_id: row?.tipo_garantia_id?.id }));

// ----------------------------------------------------------------------

export function appendAnexos(formData, anexos, outros, checklist) {
  let index = 0;

  anexos.forEach((row) => {
    formData.append(`anexos[${index}].anexo`, row);
    formData.append(`anexos[${index}].tipo_documento_id`, outros?.id);
    index += 1;
  });

  checklist.forEach((documento) => {
    documento.anexos.forEach((anexo) => {
      if (anexo.file) {
        formData.append(`anexos[${index}].anexo`, anexo.file);
        formData.append(`anexos[${index}].tipo_documento_id`, documento.id);

        if (anexo.data_emissao) formData.append(`anexos[${index}].data_emissao`, anexo.data_emissao);
        if (anexo.data_validade) formData.append(`anexos[${index}].data_validade`, anexo.data_validade);
        if (anexo.numero_entidade) formData.append(`anexos[${index}].numero_entidade`, anexo.numero_entidade);

        index += 1;
      }
    });
  });
  return formData;
}
