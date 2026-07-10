import { useEffect, useMemo, useState } from 'react';

import axios from 'axios';
import { API_SLIM_URL } from '@/utils/apisUrl';
import { getAccessToken } from '@/utils/getAccessToken';
import { headerOptions } from '@/redux/slices/sliceActions';

// ---------------------------------------------------------------------------------------------------------------------

export function useEnriquecerEntidades(entidades) {
  const chave = useMemo(
    () => (entidades?.length ? [...new Set(entidades.map((e) => String(e.numero_entidade)))].sort().join(',') : null),
    [entidades]
  );

  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    if (!chave) return;
    let ativo = true;

    (async () => {
      const unicos = chave.split(',');
      const resultados = await Promise.allSettled(unicos.map((entidade) => getFichaFiador(entidade)));

      const porEntidade = new Map(
        unicos.map((entidade, i) => {
          const r = resultados[i];
          return [
            entidade,
            r.status === 'fulfilled'
              ? { ficha: r.value, erro: null }
              : { ficha: null, erro: r.reason?.message ?? 'Erro desconhecido' },
          ];
        })
      );

      if (!ativo) return;

      setResultado({
        chave,
        fiadores: entidades.map((e) => {
          const info = porEntidade.get(String(e.numero_entidade));
          return {
            ...e,
            ficha: info?.ficha ?? null,
            erroEnriquecimento: !info?.ficha,
            erroMensagem: info?.erro ?? null,
          };
        }),
      });
    })();

    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  const pronto = resultado?.chave === chave;

  return {
    loading: Boolean(chave) && !pronto,
    enriquecidos: pronto ? resultado.fiadores : null,
  };
}

// ---------------------------------------------------------------------------------------------------------------------

export async function getFichaFiador(entidade) {
  const accessToken = await getAccessToken();
  const options = headerOptions({ accessToken, mail: '', cc: false, ct: false, mfd: false });
  const { data } = await axios.get(`${API_SLIM_URL}/v1/fichas/dcs/ficha`, { params: { entidade }, ...options });

  if (!data?.sucesso) {
    throw new Error(data?.erro || `Falha ao obter ficha da entidade ${entidade}`);
  }

  return data.objeto;
}
