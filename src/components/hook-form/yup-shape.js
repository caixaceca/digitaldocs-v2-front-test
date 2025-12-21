import * as Yup from 'yup';

// ---------------------------------------------------------------------------------------------------------------------

export const validacao = (validar, shape) => (validar ? shape : Yup.mixed().notRequired());

export const shapeNumberStd = (label) =>
  Yup.number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .positive()
    .integer()
    .required()
    .label(label);

export const shapePercentagem = (label) =>
  Yup.number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .positive()
    .max(100)
    .required()
    .label(label);

export const shapeNumber = (label, sit1, sit2, item) =>
  Yup.mixed().when(item, {
    is: (val) => val === sit1 || (sit2 && val === sit2),
    then: () => Yup.number().positive().required().label(label),
    otherwise: () => Yup.mixed().notRequired(),
  });

export const shapeNumberZero = (label, opcoes, item) =>
  Yup.mixed().when(item, {
    is: (val) => opcoes?.includes(val),
    then: () => Yup.number().min(0).required().label(label),
    otherwise: () => Yup.mixed().notRequired(),
  });

export const shapeText = (label, sit1, sit2, item) =>
  Yup.mixed().when(item, {
    is: (val) => val === sit1 || (sit2 && val === sit2),
    then: () => Yup.string().required().label(label),
    otherwise: () => Yup.mixed().notRequired(),
  });

export const shapeMixed = (label, sit1, sit2, item) =>
  Yup.mixed().when(item, {
    is: (val) => val === sit1 || (sit2 && val === sit2),
    then: () => Yup.mixed().required().label(label),
    otherwise: () => Yup.mixed().notRequired(),
  });

export const shapeDate = (label, sit1, sit2, item) =>
  Yup.mixed().when(item, {
    is: (val) => val === sit1 || (sit2 && val === sit2),
    then: () => Yup.date().typeError().required().label(label),
    otherwise: () => Yup.mixed().notRequired(),
  });
