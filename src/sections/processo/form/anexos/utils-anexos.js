import * as Yup from 'yup';
// utils
import { formatDate } from '../../../../utils/formatTime';

// ----------------------------------------------------------------------

export const shapeAnexos = (isEdit, outros, checkList) =>
  Yup.object().shape({
    anexos:
      !isEdit && outros && checkList?.length === 0
        ? Yup.array().min(1, 'Pelo menos um documento é necessário.')
        : Yup.array(),
    checklist: Yup.array().of(
      Yup.object().shape({
        anexos: Yup.array().when(
          ['identificador', 'obriga_prazo_validade', 'obrigatorio'],
          ([identificador, obrigaPrazo], schema) =>
            schema.of(
              Yup.object().shape({
                file: Yup.mixed().required('Introduza um ficheiro.'),
                data_emissao: obrigaPrazo ? Yup.date().required().label('Emissão') : Yup.date().nullable(),
                data_validade: obrigaPrazo ? Yup.date().required().label('Validade') : Yup.date().nullable(),
                numero_entidade: identificador
                  ? Yup.number().positive().required().label('Nº entidade')
                  : Yup.number().nullable(),
              })
            )
        ),
      })
    ),
  });

// ----------------------------------------------------------------------

export const defaultAnexos = (dadosStepper, checkList, anexos) => ({
  anexos: dadosStepper?.anexos || [],
  checklist:
    dadosStepper?.checklist ||
    checkList.map((doc) => ({
      ...doc,
      anexos:
        doc?.obrigatorio && anexos.filter(({ ativo, tipo_id: tid }) => ativo && tid === doc?.tipo_id)?.length === 0
          ? [{ file: null, data_emissao: null, data_validade: null, numero_entidade: null }]
          : [],
    })),
});

// ----------------------------------------------------------------------

const limparValoresNulos = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== '' && value !== null && value !== undefined));

// ----------------------------------------------------------------------

export const garantiasAssociadas = (garantias) =>
  garantias?.map((row) => limparValoresNulos({ ...row, tipo_garantia_id: row?.tipo_garantia_id?.id }));

// ----------------------------------------------------------------------

export const filterCheckList = (checklist, isEdit) =>
  checklist?.filter(({ designacao, identificador }) =>
    isEdit ? designacao !== 'OUTROS' : designacao !== 'OUTROS' && !identificador
  );

// ----------------------------------------------------------------------

export function appendAnexos(formData, anexos, outros, checklist) {
  let index = 0;

  checklist.forEach((documento) => {
    documento.anexos.forEach((anexo) => {
      if (anexo.file) {
        formData.append(`anexos[${index}].tipo_documento_id`, documento.tipo_id);
        if (anexo.numero_entidade) formData.append(`anexos[${index}].numero_entidade`, anexo.numero_entidade);
        if (anexo.data_emissao)
          formData.append(`anexos[${index}].data_emissao`, formatDate(anexo.data_emissao, 'yyyy-MM-dd'));
        if (anexo.data_validade)
          formData.append(`anexos[${index}].data_validade`, formatDate(anexo.data_validade, 'yyyy-MM-dd'));
        formData.append(`anexos[${index}].anexo`, anexo.file);
        index += 1;
      }
    });
  });

  anexos.forEach((row) => {
    formData.append(`anexos[${index}].anexo`, row);
    formData.append(`anexos[${index}].tipo_documento_id`, outros?.tipo_id);
    index += 1;
  });
  return formData;
}
