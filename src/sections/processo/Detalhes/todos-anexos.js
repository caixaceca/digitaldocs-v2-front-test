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
  const { colaboradores } = useSelector((state) => state.intranet);
  const { processo } = useSelector((state) => state.digitaldocs);

  const viewAnexo = (anexo, estadoId, parecerId) => {
    dispatch(getAnexo('fileDownload', { anexo: { ...anexo, tipoDoc: canPreview(anexo) }, estadoId, parecerId }));
  };

  const renderAnexos = (anexos, titulo, estadoId, parecerId, padding = 0) =>
    anexos?.length > 0 && (
      <Stack sx={{ pl: padding }}>
        <AnexosGroup dados={{ titulo, viewAnexo, estadoId, parecerId, anexos }} />
      </Stack>
    );

  return (
    <CardContent>
      <Stack spacing={3}>
        {renderAnexos(processo?.anexos, 'Anexos do processo')}
        {processo?.htransicoes?.map((row) => (
          <Stack key={row?.id}>
            {renderAnexos(row?.anexos, `Estado: ${row?.estado_inicial}`, row?.id)}
            {row?.pareceres?.map((item) =>
              renderAnexos(
                item?.anexos,
                `Parecer: ${colaboradorByPerfilId(item?.perfil_id, colaboradores)}`,
                row?.id,
                item?.id,
                { xs: 3, md: 6 }
              )
            )}
          </Stack>
        ))}
      </Stack>
    </CardContent>
  );
}

// ----------------------------------------------------------------------

AnexosGroup.propTypes = { dados: PropTypes.object };

function AnexosGroup({ dados }) {
  const { anexos, titulo, viewAnexo, estadoId, parecerId } = dados;
  const [anexosAtivos, anexosInativos] = useMemo(
    () => [anexos?.filter((row) => row.ativo) || [], anexos?.filter((row) => !row.ativo) || []],
    [anexos]
  );

  return (
    <Stack>
      <Divider textAlign="left" sx={{ mb: 1, typography: 'overline' }}>
        {titulo}
      </Divider>
      <Stack spacing={1}>
        {anexosAtivos.map((row) => (
          <AnexoItem
            key={row?.anexo}
            parecer
            anexo={row}
            estadoId={estadoId}
            parecerId={parecerId}
            viewAnexo={viewAnexo}
          />
        ))}
      </Stack>
      {anexosInativos.length > 0 && (
        <RoleBasedGuard roles={['Todo-111']}>
          <Divider textAlign="left" sx={{ mb: 0.5, mt: 1, opacity: 0.5, typography: 'overline' }}>
            Eliminados
          </Divider>
          <Stack spacing={1}>
            {anexosInativos.map((row) => (
              <AnexoItem
                key={row?.anexo}
                eliminado
                anexo={row}
                estadoId={estadoId}
                parecerId={parecerId}
                viewAnexo={viewAnexo}
              />
            ))}
          </Stack>
        </RoleBasedGuard>
      )}
    </Stack>
  );
}
