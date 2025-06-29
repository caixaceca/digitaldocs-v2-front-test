import { useEffect, useMemo } from 'react';
//
import { fYear } from '../utils/formatTime';
//
import { useDispatch, useSelector } from '../redux/store';
import { getProcesso } from '../redux/slices/digitaldocs';

// ---------------------------------------------------------------------------------------------------------------------

export function useProcesso({ id, perfilId }) {
  const dispatch = useDispatch();
  const processo = useSelector((state) => state.digitaldocs.processo);

  useEffect(() => {
    if (id && perfilId) dispatch(getProcesso('processo', { id }));
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
