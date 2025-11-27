import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// ---------------------------------------------------------------------------------------------------------------------

export function usePromptStep(schema, dados, onSubmit) {
  const methods = useForm({ resolver: yupResolver(schema), defaultValues: dados });

  const handle = methods.handleSubmit((formValues) => {
    onSubmit(formValues);
  });

  return { methods, handle };
}

// ---------------------------------------------------------------------------------------------------------------------

export const schemaContexto = Yup.object({
  preset_name: Yup.string().required().label('Nome'),
  prompt_context: Yup.string().required().label('Contexto'),
  keywords: Yup.string().required().label('Palavras-chave'),
});

export const schemaInstrucoes = Yup.object({ prompt_instructions: Yup.string().required().label('Instruções') });

export const schemaResposta = Yup.object({
  prompt_response_example: Yup.string().required().label('Exemplo de resposta'),
});

// ---------------------------------------------------------------------------------------------------------------------

const concelhoToEnum = {
  'Ribeira Grande': 'RIBEIRA_GRANDE_SANTO_ANTAO',
  Paul: 'PAUL',
  'Porto Novo': 'PORTO_NOVO',
  'São Vicente': 'SAO_VICENTE',
  'Ribeira Brava': 'RIBEIRA_BRAVA',
  'Tarrafal de São Nicolau': 'TARRAFAL_SAO_NICOLAU',
  Sal: 'SAL',
  'Boa Vista': 'BOA_VISTA',
  Maio: 'MAIO',
  Praia: 'PRAIA',
  'Ribeira Grande de Santiago': 'RIBEIRA_GRANDE_SANTIAGO',
  'São Domingos': 'SAO_DOMINGOS',
  'Santa Cruz': 'SANTA_CRUZ',
  'São Lourenço dos Orgãos': 'SAO_LOURENCO_DOS_ORGAOS',
  'Santa Catarina': 'SANTA_CATARINA_SANTIAGO',
  'São Salvador do Mundo': 'SAO_SALVADOR_DO_MUNDO',
  'São Miguel': 'SAO_MIGUEL',
  Tarrafal: 'TARRAFAL_SANTIAGO',
  Mosteiros: 'MOSTEIROS',
  'São Filipe': 'SAO_FILIPE',
  'Santa Catarina do Fogo': 'SANTA_CATARINA_FOGO',
  Brava: 'BRAVA',
};

export function mapConcelhoToBackend(concelho) {
  return concelhoToEnum[concelho] ?? '';
}
