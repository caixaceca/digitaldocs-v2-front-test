import { useMemo } from 'react';
import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardContent from '@mui/material/CardContent';
import { canPreview } from '../../../utils/formatFile';
import { colaboradorByPerfilId } from '../../../utils/formatObject';
import { getAnexo } from '../../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../../redux/store';
import { AnexoItem } from './Anexos';
import RoleBasedGuard from '../../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

export default function TodosAnexos() {
  const dispatch = useDispatch();
  const { processo } = useSelector((state) => state.digitaldocs);
  const { colaboradores } = useSelector((state) => state.intranet);
  const anexosTransicao = useMemo(() => anexosPorTransicao(processo?.htransicoes), [processo?.htransicoes]);

  const viewAnexo = (anexo, estadoId, parecerId) => {
    dispatch(getAnexo('fileDownload', { anexo: { ...anexo, tipoDoc: canPreview(anexo) }, estadoId, parecerId }));
  };

  const renderAnexos = (anexos, titulo, parecerId, padding = 0) =>
    anexos?.length > 0 && (
      <Stack sx={{ pl: padding }}>
        <AnexosGroup dados={{ titulo, viewAnexo, parecerId, anexos }} />
      </Stack>
    );

  return (
    <CardContent>
      <Stack spacing={3}>
        {renderAnexos(processo?.anexos, 'Anexos do processo')}
        {anexosTransicao?.map(
          ({ transicao_id: tid, anexos, pareceres, estadoInicial, estadoFinal }) =>
            (anexos?.length > 0 || pareceres?.length > 0) && (
              <Stack key={tid}>
                {renderAnexos(anexos, `Transição: ${estadoInicial} » ${estadoFinal}`, tid)}
                {pareceres?.map(({ id, anexos, perfil_id: pid }) =>
                  renderAnexos(anexos, `Parecer: ${colaboradorByPerfilId(pid, colaboradores)}`, id, { xs: 3, md: 6 })
                )}
              </Stack>
            )
        )}
      </Stack>
    </CardContent>
  );
}

// ----------------------------------------------------------------------

AnexosGroup.propTypes = { dados: PropTypes.object };

function AnexosGroup({ dados }) {
  const { anexos, titulo, viewAnexo, parecerId } = dados;
  const [anexosAtivos, anexosInativos] = useMemo(
    () => [anexos?.filter(({ ativo }) => ativo) || [], anexos?.filter(({ ativo }) => !ativo) || []],
    [anexos]
  );

  return (
    <Stack>
      <Divider sx={{ m: 1, typography: 'overline' }}>{titulo}</Divider>
      <Stack spacing={1}>
        {anexosAtivos.map((row) => (
          <AnexoItem
            parecer
            anexo={row}
            key={row?.anexo}
            parecerId={parecerId}
            viewAnexo={viewAnexo}
            estadoId={row?.transicao_id}
          />
        ))}
      </Stack>
      {anexosInativos.length > 0 && (
        <RoleBasedGuard roles={['Todo-111']}>
          <Divider sx={{ mb: 0.5, mt: 1, opacity: 0.5, typography: 'overline' }}>Eliminados</Divider>
          <Stack spacing={1}>
            {anexosInativos.map((row) => (
              <AnexoItem
                eliminado
                anexo={row}
                key={row?.anexo}
                parecerId={parecerId}
                viewAnexo={viewAnexo}
                estadoId={row?.transicao_id}
              />
            ))}
          </Stack>
        </RoleBasedGuard>
      )}
    </Stack>
  );
}

function anexosPorTransicao(htransicoes) {
  if (!htransicoes) return [];

  const agrupado = {};

  htransicoes.forEach((transicao) => {
    const { id, transicao_id: tid, estado_final: ef, estado_inicial: ei, anexos, pareceres } = transicao;

    if (!agrupado[tid])
      agrupado[tid] = { transicao_id: tid, estadoFinal: ef, estadoInicial: ei, anexos: [], pareceres: [] };

    if (Array.isArray(anexos)) {
      const anexosComId = anexos.map((anexo) => ({ ...anexo, transicao_id: id }));
      agrupado[tid].anexos.push(...anexosComId);
    }

    if (Array.isArray(pareceres)) {
      const pareceresComId = pareceres.map((parecer) => ({ ...parecer, transicao_id: id }));
      agrupado[tid].pareceres.push(...pareceresComId);
    }
  });

  return Object.values(agrupado);
}
