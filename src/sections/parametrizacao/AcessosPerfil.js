import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router-dom';
// @mui
import { Fab, Card, Table, Tooltip, TableRow, TableCell, TableBody, TableHead, TableContainer } from '@mui/material';
// utils
import { ptDateTime } from '../../utils/formatTime';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAll, closeModal, deleteItem, selectAnexo, closeModalAnexo } from '../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import Scrollbar from '../../components/Scrollbar';
import SvgIconStyle from '../../components/SvgIconStyle';
import { SkeletonTable } from '../../components/skeleton';
import { TableSearchNotFound } from '../../components/table';
import DialogConfirmar from '../../components/DialogConfirmar';
import { AddItem, UpdateItem } from '../../components/Actions';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';
//
import { AcessoForm } from './ParametrizacaoForm';
// _mock
import { codacessos, objetos } from '../../_mock';

// ----------------------------------------------------------------------

export default function AcessosPerfil() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { done, error, isLoading, isOpenModal, isSaving, isOpenModalAnexo, selectedAnexoId, acessos } = useSelector(
    (state) => state.digitaldocs
  );
  const isNotFound = !acessos?.length;

  useEffect(() => {
    if (done === 'acesso eliminado') {
      enqueueSnackbar('Acesso eliminado com sucesso', { variant: 'success' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error[0]?.msg || error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  useEffect(() => {
    if (mail && id) {
      dispatch(getAll('acessos', { mail, perfilId: id }));
    }
  }, [dispatch, id, mail]);

  const handleCloseModal = () => {
    dispatch(closeModal());
    dispatch(closeModalAnexo());
  };

  const handleDelete = (id) => {
    dispatch(selectAnexo(id));
  };

  const confirmDelete = () => {
    dispatch(deleteItem('acesso', { mail, id: selectedAnexoId, msg: 'acesso eliminado', perfilId: cc?.perfil_id }));
  };

  return (
    <>
      <HeaderBreadcrumbs
        heading="Acessos"
        links={[
          { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
          { name: 'Parametrização', href: `${PATH_DIGITALDOCS.parametrizacao.tabs}?tab=acessos&filter=` },
          { name: 'Acessos' },
        ]}
        action={
          <RoleBasedGuard roles={['acesso-110', 'Todo-110', 'Todo-111']}>
            <AddItem />
          </RoleBasedGuard>
        }
        sx={{ color: 'text.secondary', px: 1 }}
      />
      <RoleBasedGuard hasContent roles={['acesso-110', 'acesso-111', 'Todo-110', 'Todo-111']}>
        <Card sx={{ p: 1 }}>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Objeto</TableCell>
                    <TableCell>Acesso</TableCell>
                    <TableCell>Data de término</TableCell>
                    <TableCell> </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading && isNotFound ? (
                    <SkeletonTable column={4} row={10} />
                  ) : (
                    acessos?.map((row) => (
                      <TableRow key={row?.id} hover>
                        <TableCell>
                          {objetos.find((item) => item?.id?.toLocaleLowerCase() === row?.objeto?.toLocaleLowerCase())
                            ?.label || row?.objeto}
                        </TableCell>
                        <TableCell>{codacessos.find((item) => item.id === row.acesso)?.label || row.acesso}</TableCell>
                        <TableCell>{row.datalimite ? ptDateTime(row.datalimite) : 'Acesso permanente'}</TableCell>
                        <TableCell align="center" width={50}>
                          {row.objeto === 'Processo' ? (
                            <Tooltip title="Eliminar" arrow>
                              <Fab color="error" size="small" variant="soft" onClick={() => handleDelete(row?.id)}>
                                <SvgIconStyle src="/assets/icons/trash.svg" sx={{ width: 22, height: 22 }} />
                              </Fab>
                            </Tooltip>
                          ) : (
                            <UpdateItem item="acesso" id={row?.id} />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>

                {!isLoading && isNotFound && (
                  <TableSearchNotFound message="Este colaborador não possui nenhum acesso..." />
                )}
              </Table>
            </TableContainer>
          </Scrollbar>
        </Card>

        <AcessoForm isOpenModal={isOpenModal} onCancel={handleCloseModal} perfilId={id} />

        <DialogConfirmar
          isLoading={isSaving}
          open={isOpenModalAnexo}
          handleOk={confirmDelete}
          onClose={handleCloseModal}
          title="Eliminar acesso"
          desc="eliminar este acesso ao colaborador"
        />
      </RoleBasedGuard>
    </>
  );
}
