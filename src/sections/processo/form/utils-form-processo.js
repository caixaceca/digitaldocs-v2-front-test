import { format } from 'date-fns';
// redux
import { updateDados } from '../../../redux/slices/stepper';
import { updateItem } from '../../../redux/slices/digitaldocs';

// ----------------------------------------------------------------------

export function submitDados(values, isEdit, id, assunto, dispatch, enqueueSnackbar, onClose) {
  try {
    const titular =
      assunto === 'Diário'
        ? `${assunto} (${format(values.data_entrada ?? new Date(), 'dd/MM/yyyy')})`
        : values?.titular;

    const entidadesList = values?.entidades?.length ? values?.entidades?.map((row) => row?.numero) : null;

    if (isEdit) {
      const formData = bodyEditar({ ...values, titular, entidades: entidadesList });
      const params = { id, msg: 'Processo atualizado', onClose };
      dispatch(updateItem('processo', JSON.stringify(formData), params));
    } else {
      dispatch(updateDados({ forward: true, dados: { ...values, titular, entidadesList } }));
    }
  } catch (error) {
    enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
  }
}

// ----------------------------------------------------------------------

function bodyEditar(dados) {
  const formData = {};

  const keys = [
    'balcao',
    'titular',
    'entidades',
    'cliente',
    'conta',
    'docidp',
    'docids',
    'obs',
    'fluxo_id',
    'agendado',
    'periodicidade',
    'diadomes',
    'data_inicio',
    'data_arquivamento',
    'data_entrada',
    'referencia',
    'origem_id',
    'valor',
    'operacao',
    'noperacao',
    'canal',
    'email',
    'tipo_titular_id',
    'componente_id',
    'linha_id',
    'numero',
    'setor_atividade',
    'montante_solicitado',
    'finalidade',
    'numero_proposta',
    'prazo_amortizacao',
    'taxa_juro',
    'escalao_decisao',
    'descricao',
    'garantia',
    'titular_ordenador',
    'ordenador',
    'estado_civil',
    'data_nascimento',
    'pai',
    'mae',
    'local_pais_nascimento',
    'nacionalidade',
    'tipo_docid',
    'docid',
    'nif',
    'profissao',
    'residente',
    'morada',
    'local_trabalho',
    'telefone',
    'telemovel',
    'emails',
    'origem_fundo',
    'finalidade_fundo',
    'entidade_con',
  ];

  keys.forEach((key) => {
    if (dados?.[key] !== undefined && dados?.[key] !== null && dados?.[key] !== '') {
      if (key === 'data_entrada' || key === 'data_inicio' || key === 'data_arquivamento' || key === 'data_nascimento') {
        formData[key] = format(dados[key], 'yyyy-MM-dd');
      } else if (
        (key === 'linha_id' ||
          key === 'origem_id' ||
          key === 'tipo_docid' ||
          key === 'estado_civil' ||
          key === 'componente_id' ||
          key === 'tipo_titular_id') &&
        dados[key]?.id
      ) {
        formData[key] = dados[key]?.id;
      } else formData[key] = dados[key];
    }
  });

  return formData;
}

// ----------------------------------------------------------------------

export function entidadesList(isEdit, entidades, assunto) {
  if (entidades) return entidades.split(';').map((row) => ({ numero: row }));
  if (!isEdit && assunto === 'Abertura de Conta') return [{ numero: '' }];
  return [];
}
