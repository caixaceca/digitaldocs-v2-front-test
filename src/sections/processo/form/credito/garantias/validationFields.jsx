import * as Yup from 'yup';
//
import { validacao, shapeNumberStd, shapePercentagem } from '../../../../../components/hook-form/yup-shape';

// ---------------------------------------------------------------------------------------------------------------------

export const shapeGarantia = () =>
  Yup.object({
    valor: shapeNumberStd('Valor'),
    cobertura: shapePercentagem('Cobertura'),
    tipo_garantia: Yup.mixed().required().label('Garantia'),
    subtipo_garantia: Yup.mixed().when('tipo_garantia', {
      is: (tipo) => Boolean(tipo?.subtipos),
      then: (schema) => schema.required().label('Subtipo'),
      otherwise: (schema) => schema.nullable(),
    }),
    livrancas: Yup.array(Yup.object({ numero: Yup.string().required().label('Nº de livrança') })),
    dps: Yup.array(
      Yup.object({
        cobertura: shapePercentagem('Cobertura'),
        numero: Yup.string().required().label('Nº de conta'),
      })
    ),
    fiadores: shapeEntidades(),
    seguros: shapeSeguros(false),
    predios: shapeImoveis('Prédio'),
    terrenos: shapeImoveis('Terreno'),
    apartamentos: shapeImoveis('Apartamento'),
    titulos: Yup.array(
      Yup.object({
        seguros: shapeSeguros(true),
        valor: shapeNumberStd('Valor'),
        cobertura: shapePercentagem('Cobertura'),
        cliente: shapeNumberStd('Nº de cliente'),
        quantidade: shapeNumberStd('Quantidade'),
        tipo: Yup.mixed().required().label('Tipo'),
        emissora: Yup.string().required().label('Entidade emissora'),
        registo: Yup.string().required().label('Entidade registradora'),
      })
    ),
    veiculos: Yup.array(
      Yup.object({
        donos: shapeEntidades(),
        seguros: shapeSeguros(true),
        valor: shapeNumberStd('Valor'),
        pvt: shapeNumberStd('Valor PVT'),
        cobertura: shapePercentagem('Cobertura'),
        nura: Yup.string().required().label('NURA'),
        marca: Yup.string().required().label('Marca'),
        modelo: Yup.string().required().label('Modelo'),
        ano_fabrico: shapeNumberStd('Ano de fabricação'),
        matricula: Yup.string().required().label('Matrícula'),
      })
    ),
  });

// ---------------------------------------------------------------------------------------------------------------------

const shapeEntidades = () => Yup.array(Yup.object({ numero: shapeNumberStd('Nº de entidade') }));

const shapeSeguros = (tipo) =>
  Yup.array(
    Yup.object({
      valor: shapeNumberStd('Valor'),
      premio: shapeNumberStd('Prémio'),
      cobertura: shapePercentagem('Cobertura'),
      apolice: Yup.string().required().label('Apólice'),
      seguradora: Yup.mixed().required().label('Seguradora'),
      periodicidade: Yup.string().required().label('Periodicidade'),
      tipo: validacao(tipo, Yup.mixed().required().label('Tipo')),
    })
  );

const shapeImoveis = (tipo) =>
  Yup.array(
    Yup.object({
      donos: shapeEntidades(),
      seguros: shapeSeguros(true),
      pvt: shapeNumberStd('Valor PVT'),
      cobertura: shapePercentagem('Cobertura'),
      zona: Yup.string().required().label('Zona'),
      freguesia: Yup.mixed().required().label('Freguesia'),
      tipo_matriz: Yup.mixed().required().label('Tipo de matriz'),
      area: validacao(tipo === 'Terreno', Yup.string().required().label('Área')),
      numero_andar: validacao(tipo === 'Apartamento', Yup.string().required().label('Nº de andar')),
      fracao: validacao(tipo === 'Apartamento', Yup.string().required().label('Identificação fração')),
      matriz_predial: validacao(tipo === 'Apartamento', Yup.string().required().label('Matriz predial')),
    })
  );
