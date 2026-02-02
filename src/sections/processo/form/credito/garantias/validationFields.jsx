import * as Yup from 'yup';
//
import { validacao, shapeNumberStd, shapePercentagem } from '../../../../../components/hook-form/yup-shape';

// ---------------------------------------------------------------------------------------------------------------------

export const shapeGarantia = () =>
  Yup.object({
    percentagem_cobertura: shapePercentagem('Cobertura'),
    tipo_garantia: Yup.mixed().required().label('Garantia'),
    subtipo_garantia: Yup.mixed().when('tipo_garantia', {
      is: (tipo) => Boolean(tipo?.subtipos),
      then: (schema) => schema.required().label('Subtipo'),
      otherwise: (schema) => schema.nullable(),
    }),
    livrancas: Yup.array(Yup.object({ numero_livranca: Yup.string().required().label('Nº de livrança') })),
    contas: Yup.array(
      Yup.object({
        percentagem_cobertura: shapePercentagem('Cobertura'),
        numero_conta: Yup.string().required().label('Nº de conta'),
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
        codigo: Yup.string().required().label('Código'),
        numero_cliente: shapeNumberStd('Nº de cliente'),
        percentagem_cobertura: shapePercentagem('Cobertura'),
      })
    ),
    veiculos: Yup.array(
      Yup.object({
        donos: shapeEntidades(),
        seguros: shapeSeguros(true),
        valor: shapeNumberStd('Valor'),
        valor_pvt: shapeNumberStd('Valor PVT'),
        // nura: Yup.string().required().label('NURA'),
        marca: Yup.string().required().label('Marca'),
        modelo: Yup.string().required().label('Modelo'),
        // ano_fabrico: shapeNumberStd('Ano de fabricação'),
        percentagem_cobertura: shapePercentagem('Cobertura'),
        // matricula: Yup.string().required().label('Matrícula'),
      })
    ),
  });

// ---------------------------------------------------------------------------------------------------------------------

const shapeEntidades = () => Yup.array(Yup.object({ numero_entidade: shapeNumberStd('Nº de entidade') }));

const shapeSeguros = (tipo) =>
  Yup.array(
    Yup.object({
      valor: shapeNumberStd('Valor'),
      premio: shapeNumberStd('Prémio'),
      apolice: Yup.string().required().label('Apólice'),
      percentagem_cobertura: shapePercentagem('Cobertura'),
      seguradora: Yup.mixed().required().label('Seguradora'),
      tipo: validacao(tipo, Yup.mixed().required().label('Tipo')),
      periodicidade: Yup.string().required().label('Periodicidade'),
    })
  );

const shapeImoveis = (tipo) =>
  Yup.array(
    Yup.object({
      donos: shapeEntidades(),
      seguros: shapeSeguros(true),
      valor_pvt: shapeNumberStd('Valor PVT'),
      zona: Yup.string().required().label('Zona'),
      percentagem_cobertura: shapePercentagem('Cobertura'),
      freguesia: Yup.mixed().required().label('Freguesia'),
      tipo_matriz: Yup.mixed().required().label('Tipo de matriz'),
      area: validacao(tipo === 'Terreno', Yup.string().required().label('Área')),
      numero_andar: validacao(tipo === 'Apartamento', Yup.string().required().label('Nº de andar')),
      matriz_predial: validacao(tipo === 'Apartamento', Yup.string().required().label('Matriz predial')),
      identificacao_fracao: validacao(tipo === 'Apartamento', Yup.string().required().label('Identificação fração')),
    })
  );
