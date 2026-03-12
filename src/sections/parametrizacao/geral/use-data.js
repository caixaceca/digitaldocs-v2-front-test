import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// utils
import { PATH_DIGITALDOCS } from '@/routes/paths';
// redux
import { useDispatch, useSelector } from '@/redux/store';
import { openModal, getSuccess, closeModal, getFromParametrizacao } from '@/redux/slices/parametrizacao';

// ---------------------------------------------------------------------------------------------------------------------

const NAVIGATE_ON_VIEW = { fluxos: 'fluxo', estados: 'estado' };
const FETCH_SINGLE_MAP = { origens: 'origem', despesas: 'despesa', precarios: 'precario', documentos: 'documento' };

// ---------------------------------------------------------------------------------------------------------------------

export function useParametrizacaoData(item) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { uos } = useSelector((state) => state.intranet);
  const {
    done,
    fluxos,
    linhas,
    estados,
    origens,
    despesas,
    precarios,
    isLoading,
    isOpenView,
    documentos,
    isOpenModal,
    selectedItem,
  } = useSelector((state) => state.parametrizacao);

  useEffect(() => {
    dispatch(getFromParametrizacao(item));
  }, [dispatch, item]);

  useEffect(() => {
    if (done === 'Estado adicionado' || done === 'Fluxo adicionado') {
      const route = NAVIGATE_ON_VIEW[item];
      if (route) navigate(`${PATH_DIGITALDOCS.parametrizacao.root}/${route}/${selectedItem?.id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const dados =
    {
      linhas,
      fluxos,
      origens,
      despesas,
      precarios,
      documentos,
      estados: estados?.map((row) => ({
        ...row,
        uo: uos?.find(({ id }) => Number(id) === Number(row?.uo_id))?.label || row?.uo_id,
      })),
    }[item] ?? [];

  const handleView = (row, modal) => {
    const navigateTo = NAVIGATE_ON_VIEW[item];
    if (modal === 'view' && navigateTo) {
      navigate(`${PATH_DIGITALDOCS.parametrizacao.root}/${navigateTo}/${row?.id}`);
      return;
    }

    dispatch(openModal(modal));
    const fetchSingle = FETCH_SINGLE_MAP[item];
    if (fetchSingle) dispatch(getFromParametrizacao(fetchSingle, { id: row?.id, item: 'selectedItem' }));
    else dispatch(getSuccess({ item: 'selectedItem', dados: row }));
  };

  const closeModalAction = () => dispatch(closeModal());

  return { done, isLoading, isOpenView, isOpenModal, selectedItem, dados, handleView, closeModalAction };
}
