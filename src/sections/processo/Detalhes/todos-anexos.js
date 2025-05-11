import { useMemo } from 'react';
import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardContent from '@mui/material/CardContent';
// utils
import { canPreview } from '../../../utils/formatFile';
// redux
import { getAnexo } from '../../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../../redux/store';
//
import { AnexoItem } from './Anexos';
import RoleBasedGuard from '../../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

export default function TodosAnexos() {
  const dispatch = useDispatch();
  const { processo } = useSelector((state) => state.digitaldocs);
  const anexos = useMemo(
    () => anexosPorEstado(processo?.anexos?.filter(({ entidade }) => !entidade)),
    [processo?.anexos]
  );

  const viewAnexo = (anexo) => {
    const params = { processoId: processo?.id, anexo: { ...anexo, tipoDoc: canPreview(anexo) } };
    dispatch(getAnexo('fileDownload', params));
  };

  const renderAnexos = (anexos, titulo) =>
    anexos?.length > 0 && (
      <Stack>
        <AnexosGroup dados={{ titulo, viewAnexo, anexos }} />
      </Stack>
    );

  return (
    <CardContent>
      <Stack spacing={3}>
        {renderAnexos(
          processo?.anexos?.filter(({ entidade }) => !!entidade),
          'Anexos das entidades'
        )}
        {anexos?.map(({ estado, anexos }) => renderAnexos(anexos, estado))}
      </Stack>
    </CardContent>
  );
}

// ----------------------------------------------------------------------

AnexosGroup.propTypes = { dados: PropTypes.object };

function AnexosGroup({ dados }) {
  const { anexos, titulo = '', viewAnexo } = dados;
  const [anexosAtivos, anexosInativos] = useMemo(
    () => [anexos?.filter(({ ativo }) => ativo) || [], anexos?.filter(({ ativo }) => !ativo) || []],
    [anexos]
  );

  return (
    <Stack>
      <Divider sx={{ m: 1, typography: 'overline' }}>{titulo}</Divider>
      <Stack spacing={1}>
        {anexosAtivos.map((row) => (
          <AnexoItem parecer anexo={row} key={row?.anexo} viewAnexo={viewAnexo} />
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
