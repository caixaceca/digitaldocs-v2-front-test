import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import { Card, Table, TableRow, TableCell, TableBody, TableHead, TableContainer } from '@mui/material';
// utils
import { ptDateTime } from '../../utils/formatTime';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAll, closeModal } from '../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import { TableSearchNotFound } from '../../components/table';
import { AddItem, UpdateItem } from '../../components/Actions';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';
//
import { EstadosPerfilForm } from './ParametrizacaoForm';

// ----------------------------------------------------------------------

export default function EstadosPerfil() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { isLoading, estadosPerfil, estados, isOpenModal } = useSelector((state) => state.digitaldocs);

  const isNotFound = !estadosPerfil?.length;

  useEffect(() => {
    if (mail && id && cc?.perfil_id) {
      dispatch(getAll('estadosPerfil', { mail, estadoId: id, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, id, cc?.perfil_id, mail]);

  useEffect(() => {
    if (mail && cc?.perfil_id && estados?.length === 0) {
      dispatch(getAll('estados', { mail, perfilId: cc?.perfil_id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, cc?.perfil_id, mail]);

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  return (
    <>
      <HeaderBreadcrumbs
        heading="Estados"
        links={[
          { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
          { name: 'Parametrização', href: `${PATH_DIGITALDOCS.parametrizacao.tabs}?tab=acessos&filter=` },
          { name: 'Estados' },
        ]}
        action={
          <RoleBasedGuard roles={['perfilestado-110', 'perfilestado-111', 'Todo-110', 'Todo-111']}>
            <AddItem />
          </RoleBasedGuard>
        }
        sx={{ color: 'text.secondary', px: 1 }}
      />
      <RoleBasedGuard hasContent roles={['perfilestado-110', 'perfilestado-111', 'Todo-110', 'Todo-111']}>
        <Card sx={{ p: 1 }}>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Data de início</TableCell>
                    <TableCell>Data de término</TableCell>
                    <TableCell> </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading && isNotFound ? (
                    <SkeletonTable column={4} row={10} />
                  ) : (
                    estadosPerfil?.map((row) => (
                      <TableRow key={row?.id} hover>
                        <TableCell>{row.nome}</TableCell>
                        <TableCell>{row.data_inicial ? ptDateTime(row.data_inicial) : 'Acesso permanente'}</TableCell>
                        <TableCell>{row.data_limite ? ptDateTime(row.data_limite) : 'Acesso permanente'}</TableCell>
                        <TableCell align="center" width={50}>
                          <UpdateItem dados={row} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>

                {!isLoading && isNotFound && (
                  <TableSearchNotFound message="Este colaborador não possui nenhum estado associado..." />
                )}
              </Table>
            </TableContainer>
          </Scrollbar>
        </Card>

        <EstadosPerfilForm isOpenModal={isOpenModal} onCancel={handleCloseModal} perfilId={id} />
      </RoleBasedGuard>
    </>
  );
}
