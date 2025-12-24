import { useEffect, useMemo } from 'react';
//
import { fYear } from '../utils/formatTime';
//
import { getSuccess } from '../redux/slices/intranet';
import { useDispatch, useSelector } from '../redux/store';
import { getProcesso, addItemProcesso } from '../redux/slices/digitaldocs';

// ---------------------------------------------------------------------------------------------------------------------

export function useProcesso({ id, perfilId }) {
  const dispatch = useDispatch();
  const { uos } = useSelector((state) => state.intranet);
  const { processo } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    const uo = uos?.find(({ id }) => id === Number(processo?.uo_origem_id));
    const label = uos?.find(({ balcao }) => Number(balcao) === Number(processo?.balcao_domicilio))?.label;
    if (uo) dispatch(addItemProcesso({ item: 'uo', dados: uo }));
    if (processo?.balcao_domicilio)
      dispatch(addItemProcesso({ item: 'domicilio', dados: { balcao: processo?.balcao_domicilio, label } }));
  }, [dispatch, processo?.balcao_domicilio, processo?.uo_origem_id, uos]);

  useEffect(() => {
    if (id && perfilId) {
      dispatch(getProcesso('processo', { id }));
      dispatch(getSuccess({ item: 'fichaInformativa', dados: null }));
    }
  }, [dispatch, id, perfilId]);

  return processo;
}

// ---------------------------------------------------------------------------------------------------------------------

export function useIdentificacao({ id }) {
  const { uos } = useSelector((state) => state.intranet);
  const processo = useSelector((state) => state.digitaldocs.processo);
  const uoOrigem = useMemo(() => uos?.find(({ id }) => id === processo?.uo_origem_id), [processo?.uo_origem_id, uos]);

  if (!processo) return `Info. do processo: ${id}`;

  return `Info. do processo: ${processo?.numero_entrada}${uoOrigem?.balcao ? `/${uoOrigem?.balcao}` : ''}${
    processo?.criado_em ? `/${fYear(processo?.criado_em)}` : ''
  }`;
}
