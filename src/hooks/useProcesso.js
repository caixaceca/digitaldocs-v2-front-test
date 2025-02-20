import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
//
import { fYear } from '../utils/formatTime';
//
import { useDispatch, useSelector } from '../redux/store';
import { getProcesso } from '../redux/slices/digitaldocs';

export function useProcesso({ id, perfilId }) {
  const dispatch = useDispatch();
  const processo = useSelector((state) => state.digitaldocs.processo);

  useEffect(() => {
    if (id && perfilId) dispatch(getProcesso('processo', { id }));
  }, [dispatch, id, perfilId]);

  return processo;
}

// ----------------------------------------------------------------------

export function useNotificacao({ done, error, linkNavigate, proximoAnterior, setCurrentTab }) {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    if (done) enqueueSnackbar(`${done} com sucesso`, { variant: 'success' });

    if (
      [
        'Processo arquivado',
        'Processo devolvido',
        'Pendência eliminada',
        'Processo finalizado',
        'Processo encaminhado',
        'Processo colocado pendente',
      ].includes(done)
    ) {
      proximoAnterior('true');
      setCurrentTab('Dados gerais');
    }
    if (
      [
        'Parecer enviado',
        'Processo atribuído',
        'Processo libertado',
        'Processo domiciliado',
        'Atribuição eliminada',
        'Processo desarquivado',
      ].includes(done)
    ) {
      navigate(linkNavigate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error && typeof error === 'string') {
      const noMoreProcess = error.includes('Sem mais processos');
      enqueueSnackbar(error, { variant: noMoreProcess ? 'info' : 'error' });
      if (noMoreProcess) navigate(linkNavigate);
    }
  }, [error, enqueueSnackbar, linkNavigate, navigate]);
}

export function useIdentificacao({ id }) {
  const { uos } = useSelector((state) => state.intranet);
  const processo = useSelector((state) => state.digitaldocs.processo);
  const uoOrigem = useMemo(() => uos?.find((row) => row?.id === processo?.uo_origem_id), [processo?.uo_origem_id, uos]);

  if (!processo) return `Info. do processo: ${id}`;

  return `Info. do processo: ${processo?.numero_entrada}${uoOrigem?.balcao ? `/${uoOrigem?.balcao}` : ''}${
    processo?.criado_em ? `/${fYear(processo?.criado_em)}` : ''
  }`;
}

// ----------------------------------------------------------------------
