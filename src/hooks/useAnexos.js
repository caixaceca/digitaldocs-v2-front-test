import { useCallback } from 'react';
// redux
import { useDispatch } from '../redux/store';
import { setLoading } from '../redux/slices/indicadores';

// ----------------------------------------------------------------------

export default function useAnexos(item1, item2, setValue, anexos) {
  const dispatch = useDispatch();
  const dropSingle = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setValue(item1, Object.assign(file, { preview: URL.createObjectURL(file) }));
      }
    },
    [item1, setValue]
  );

  const dropMultiple = useCallback(
    async (acceptedFiles) => {
      dispatch(setLoading(true));
      const anexosExistentes = anexos || [];
      setValue(item2, [...anexosExistentes, ...acceptedFiles.map((file) => Object.assign(file))]);
      dispatch(setLoading(false));
    },
    [anexos, dispatch, setValue, item2]
  );

  const removeOne = (file) => {
    const filteredItems = anexos && anexos?.filter((row) => row !== file);
    setValue(item2, filteredItems);
  };

  const removeAll = () => {
    setValue(item2, []);
  };

  return { dropSingle, dropMultiple, removeOne, removeAll };
}
