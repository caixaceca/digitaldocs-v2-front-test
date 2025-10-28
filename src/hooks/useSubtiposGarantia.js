import { useState, useRef, useEffect } from 'react';
// utils
import { vdt } from '../utils/formatObject';
import { GAJI9_API_SERVER } from '../utils/apisUrl';
import { getAccessToken } from '../redux/slices/intranet';

// ---------------------------------------------------------------------------------------------------------------------

export function useSubtiposGarantia(tipo, setValue, index) {
  const cacheRef = useRef({});
  const [subtipos, setSubtipos] = useState([]);

  useEffect(() => {
    async function fetchSubtipos() {
      setValue(`garantias[${index}].subtipo_garantia_id`, null, vdt);

      function updateTipo(ativos) {
        setSubtipos(ativos);
        setValue(`garantias[${index}].tipo_garantia_id`, { ...tipo, subtipos: ativos.length > 0 }, vdt);
      }

      if (!tipo?.id) {
        setSubtipos([]);
        return;
      }

      if (cacheRef.current[tipo.id]) {
        updateTipo(cacheRef.current[tipo.id]);
        return;
      }

      try {
        const accessToken = await getAccessToken();
        const apiUrl = `${GAJI9_API_SERVER}/v1/tipos_garantias/detail?id=${tipo.id}`;
        const res = await fetch(apiUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
        const data = await res.json();

        const ativos = data?.objeto?.subtipos?.filter(({ ativo }) => ativo) || [];
        cacheRef.current[tipo.id] = ativos;

        updateTipo(ativos);
      } catch (err) {
        setSubtipos([]);
      }
    }
    fetchSubtipos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo?.id]);

  return subtipos;
}
