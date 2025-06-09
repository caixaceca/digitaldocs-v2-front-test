import { useMemo } from 'react';
import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
// utils
import { canPreview } from '../../../utils/formatFile';
import { eliminarAnexo } from '../../../utils/validarAcesso';
// redux
import { useDispatch, useSelector } from '../../../redux/store';
import { getAnexo, setModal } from '../../../redux/slices/digitaldocs';
//
import { AnexoItem } from './anexos-dados-gerais';
import { SearchNotFound } from '../../../components/table';
import RoleBasedGuard from '../../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

export default function TodosAnexos() {
  const dispatch = useDispatch();
  const { processo } = useSelector((state) => state.digitaldocs);
  const { meusAmbientes } = useSelector((state) => state.parametrizacao);
  const { id, estado, anexos } = processo;
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
          titulo,
          anexos,
          viewAnexo,
          meusAmbientes,
          estadoId: processo?.estado?.estado_id,
          modificar: estado?.preso && estado?.atribuidoAMim,
        }}
        onEliminar={(id, entidade) =>
          dispatch(setModal({ modal: 'eliminar-anexo', dados: { id, estadoId: estado?.estado_id, entidade } }))
        }
      />
    );

  return (
    <CardContent>
      <Stack spacing={3}>
        {anexosList?.length || anexosEntidades?.length ? (
          <>
            {renderAnexos(anexosEntidades, 'Anexos das entidades')}
            {anexosList?.map(({ estado, anexos }) => renderAnexos(anexos, estado))}
          </>
        ) : (
          <SearchNotFound message="Nenhum anexo encontrado..." />
        )}
      </Stack>
    </CardContent>
  );
}

// ----------------------------------------------------------------------

AnexosGroup.propTypes = { dados: PropTypes.object, onEliminar: PropTypes.func };

function AnexosGroup({ dados, onEliminar }) {
  const { anexos, titulo = '', viewAnexo, modificar = false, meusAmbientes = [], estadoId = '' } = dados;
  const [anexosAtivos, anexosInativos] = useMemo(
    () => [anexos?.filter(({ ativo }) => ativo) || [], anexos?.filter(({ ativo }) => !ativo) || []],
    [anexos]
  );

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
            onEliminar={eliminarAnexo(meusAmbientes, modificar, row?.estado_id, estadoId) ? onEliminar : null}
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
