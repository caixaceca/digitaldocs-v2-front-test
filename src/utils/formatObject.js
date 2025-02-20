export function findColaborador(mail, colaboradores) {
  const colaborador = colaboradores?.find((row) => row?.perfil?.mail?.toLowerCase() === mail?.toLowerCase());
  return colaborador
    ? `${colaborador?.perfil?.displayName} ${colaborador?.uo?.label ? `(${colaborador?.uo?.label})` : ''}`
    : mail;
}

// ----------------------------------------------------------------------

export function balcoesList(uos) {
  if (!uos) return [];
  return uos.filter((item) => item.tipo === 'Agências').map(({ balcao, label }) => ({ id: balcao, label }));
}

// ----------------------------------------------------------------------

export function setItemValue(newValue, setItem, localS, id) {
  if (setItem) {
    setItem(newValue);
  }
  if (localS) {
    localStorage.setItem(localS, (newValue && id && newValue?.id) || (newValue && newValue) || '');
  }
}

// ----------------------------------------------------------------------

function objectsEqual(o1, o2) {
  return o1.id === o2.id;
}

export function subtractArrays(a1, a2) {
  const arr = [];
  a1.forEach((o1) => {
    let found = false;
    a2.forEach((o2) => {
      if (objectsEqual(o1, o2)) {
        found = true;
      }
    });
    if (!found) {
      arr.push(o1);
    }
  });
  return arr;
}

// ----------------------------------------------------------------------

export function transicoesList(transicoes, estados) {
  return transicoes?.map((row) => ({
    ...row,
    estado_final: estados?.find((item) => item.id === row.estado_final_id)?.nome,
    estado_inicial: estados?.find((item) => item.id === row.estado_inicial_id)?.nome,
  }));
}

// ----------------------------------------------------------------------

export function removerPropriedades(obj, propriedades) {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !propriedades.includes(key)));
}

// ----------------------------------------------------------------------

export function perfisAad(colaboradores, from) {
  return colaboradores
    ?.filter((item) => item?.perfil?.id_aad)
    ?.map((row) => ({
      label: row?.nome,
      id: row?.perfil?.id_aad,
      email: row?.perfil?.mail,
      ...(from === 'representantes'
        ? {
            sexo: row?.sexo,
            balcao: row?.uo?.balcao,
            estado_civil: row?.estado_civil,
            concelho: row?.morada?.concelho,
            funcao: row?.nomeacao || row?.funcao,
            residencia: `${row?.morada?.concelho}${row?.morada?.zona ? ` - ${row?.morada?.zona}` : ''}`,
          }
        : null),
    }));
}

// ----------------------------------------------------------------------

export function utilizadoresGaji9(colaboradores, funcoes, from) {
  const idsFuncoes = funcoes?.map((row) => row?.utilizador_id) || [];

  return perfisAad(
    colaboradores?.filter((row) => idsFuncoes?.includes(row?.perfil?.id_aad)),
    from
  );
}

// ----------------------------------------------------------------------

export function sortPermissoes(permissoes) {
  if (!permissoes || permissoes?.length === 0) return [];
  const fixedOrder = ['READ', 'CREATE', 'UPDATE', 'DELETE'];

  return [...permissoes].sort((a, b) => {
    const [permissaoA] = a.split('_');
    const [permissaoB] = b.split('_');

    return fixedOrder.indexOf(permissaoA) - fixedOrder.indexOf(permissaoB);
  });
}

// ----------------------------------------------------------------------

export function meusAcessosGaji9(grupos) {
  if (!grupos || grupos?.length === 0) return [];

  const resultado = [];
  const dataAtual = new Date();

  grupos.forEach((grupo) => {
    if (grupo.ativo) {
      grupo.recursos_permissoes.forEach((item) => {
        if (item.ativo) {
          const inicio = new Date(item.data_inicio);
          const termino = item.data_termino ? new Date(item.data_termino) : null;
          if (dataAtual >= inicio && (!termino || dataAtual <= termino)) {
            sortPermissoes(item.permissoes).forEach((permissao) => {
              if (!resultado?.includes()) resultado.push(`${permissao}_${item.recurso}`);
            });
          }
        }
      });
    }
  });
  return resultado;
}

// ----------------------------------------------------------------------

export const getProximoAnterior = (processos, selectedId) => {
  const index = processos.findIndex((p) => p.id === selectedId);

  if (index === -1) return { anterior: '', proximo: '' };

  return {
    anterior: index > 0 ? processos[index - 1]?.id : '',
    proximo: index < processos.length - 1 ? processos[index + 1]?.id : '',
  };
};
