import { useCallback } from 'react';

// ----------------------------------------------------------------------

export default function useAnexos(item1, item2, setValue, anexos) {
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
      const anexosExistentes = anexos || [];
      setValue(item2, [...anexosExistentes, ...acceptedFiles.map((file) => Object.assign(file))]);
    },
    [anexos, setValue, item2]
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
