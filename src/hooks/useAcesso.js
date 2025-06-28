import { useSelector } from '../redux/store';

// ----------------------------------------------------------------------

export function usePermissao() {
  const { adminGaji9, utilizador } = useSelector((state) => state.gaji9);

  const isAdmin = adminGaji9 || false;
  const isGerente = utilizador?._role === 'GERENTE' || false;

  function temAcesso(acessos, permissoes) {
    if (!Array.isArray(acessos) || acessos.length === 0) return false;
    return permissoes.some((p) => acessos.includes(p));
  }

  function temPermissao(permissoes) {
    return adminGaji9 || temAcesso(utilizador?.acessos, permissoes) || false;
  }

  return { temPermissao, utilizador, isAdmin, isGerente };
}

// ----------------------------------------------------------------------

export function useAcesso({ acessos }) {
  const { meusacessos } = useSelector((state) => state.parametrizacao);
  return !!meusacessos?.find((row) => acessos?.includes(row));
}
