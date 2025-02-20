import { useSelector } from '../redux/store';

// ----------------------------------------------------------------------

export function useAcesso({ acessos }) {
  const { meusacessos } = useSelector((state) => state.parametrizacao);
  return !!meusacessos?.find((row) => acessos?.includes(row));
}
