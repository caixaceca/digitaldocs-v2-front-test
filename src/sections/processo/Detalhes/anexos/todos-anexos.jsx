import { useMemo } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
// utils
import { idCheck } from '@/utils/formatObject';
import { canPreview } from '@/utils/formatFile';
import { eliminarAnexo } from '@/utils/validarAcesso';
// redux
import { useDispatch, useSelector } from '@/redux/store';
import { getAnexo, setModal } from '@/redux/slices/digitaldocs';
//
import ModelosRespostas from './modelos-resposta';
import { AnexoItem } from './anexos-dados-gerais';
import { SearchNotFound } from '@/components/table';
import RoleBasedGuard from '@/guards/RoleBasedGuard';

// ---------------------------------------------------------------------------------------------------------------------

export default function TodosAnexos() {
  const dispatch = useDispatch();
  const { idAd } = useSelector((state) => state.intranet);
  const { processo } = useSelector((state) => state.digitaldocs);
  const { meusAmbientes } = useSelector((state) => state.parametrizacao);

  const { id, estado, anexos, status = '', origem_id: origemId } = processo;
  const anexosEntidades = useMemo(() => anexos?.filter(({ entidade }) => !!entidade), [anexos]);
  const anexosList = useMemo(() => anexosPorEstado(anexos?.filter(({ entidade }) => !entidade)), [anexos]);

  const viewAnexo = (anexo) => {
    const params = { processoId: id, anexo: { ...anexo, tipoDoc: canPreview(anexo) } };
    dispatch(getAnexo('fileDownload', params));
  };

  const renderAnexos = (anexos, titulo) =>
    anexos?.length > 0 && (
      <AnexosGroup
        dados={{
          ...{ titulo, anexos, viewAnexo, meusAmbientes },
          ...{ estado: processo?.estado, modificar: estado?.preso && estado?.atribuidoAMim },
        }}
      />
    );

  return (
    <CardContent>
      <Stack spacing={3}>
        {anexosList?.length || anexosEntidades?.length ? (
          <>
            {renderAnexos(anexosEntidades, 'Anexos das entidades')}
            {anexosList?.map(({ estado, anexos }) => renderAnexos(anexos, estado))}
            {((idCheck(idAd) && origemId) || (estado?.estado?.includes('Notas Externas') && status !== 'A')) && (
              <ModelosRespostas />
            )}
          </>
        ) : (
          <SearchNotFound message="Nenhum anexo encontrado..." />
        )}
      </Stack>
    </CardContent>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function AnexosGroup({ dados }) {
  const dispatch = useDispatch();
  const { anexos, titulo = '', viewAnexo, modificar = false, meusAmbientes = [], estado = null } = dados;
  const [anexosAtivos, anexosInativos] = useMemo(
    () => [anexos?.filter(({ ativo }) => ativo) || [], anexos?.filter(({ ativo }) => !ativo) || []],
    [anexos]
  );

  const handleEliminar = (id, entidade) => {
    dispatch(setModal({ modal: 'eliminar-anexo', dados: { id, estadoId: estado?.estado_id, entidade } }));
  };

  return (
    <Stack>
      <Typography textAlign="left" sx={{ mt: 1, typography: 'overline', color: 'text.secondary' }}>
        {titulo}
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <Stack spacing={1}>
        {anexosAtivos.map((row) => (
          <AnexoItem
            parecer
            anexo={row}
            key={row?.anexo}
            viewAnexo={viewAnexo}
            onEliminar={
              (estado?.decisor && row?.estado_id === estado?.estado_id) ||
              eliminarAnexo(meusAmbientes, modificar, row?.estado_id, estado?.estado_id)
                ? handleEliminar
                : null
            }
          />
        ))}
      </Stack>
      {anexosInativos.length > 0 && (
        <RoleBasedGuard roles={['Todo-111']}>
          <Divider sx={{ mb: 0.5, mt: 1, opacity: 0.5, typography: 'overline' }}>Eliminados</Divider>
          <Stack spacing={1}>
            {anexosInativos.map((row) => (
              <AnexoItem eliminado anexo={row} key={row?.anexo} viewAnexo={viewAnexo} />
            ))}
          </Stack>
        </RoleBasedGuard>
      )}
    </Stack>
  );
}

function anexosPorEstado(anexos) {
  const agrupados = anexos.reduce((acc, anexo) => {
    const { estado_id: id, estado } = anexo;
    if (!acc[id]) acc[id] = { id: id || 'xxx', estado: estado || 'Anexos do processo', anexos: [] };
    acc[id].anexos.push(anexo);
    return acc;
  }, {});

  return Object.values(agrupados);
}
