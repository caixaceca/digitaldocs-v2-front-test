import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router-dom';
// @mui
import {
  Fab,
  Card,
  Table,
  Button,
  Tooltip,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  TableContainer,
} from '@mui/material';
// utils
import { ptDateTime } from '../../utils/formatTime';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import {
  getAll,
  getItem,
  openModal,
  closeModal,
  deleteItem,
  selectAnexo,
  closeModalAnexo,
} from '../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import Scrollbar from '../../components/Scrollbar';
import SvgIconStyle from '../../components/SvgIconStyle';
import { SkeletonTable } from '../../components/skeleton';
import { TableSearchNotFound } from '../../components/table';
import DialogConfirmar from '../../components/DialogConfirmar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
//
import AcessoForm from './AcessoForm';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';
// _mock
import { codacessos, objetos } from '../../_mock';

// ----------------------------------------------------------------------

export default function Acessos() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);
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

  const handleUpdate = (id) => {
    if (id && currentColaborador?.perfil_id && mail) {
      dispatch(getItem('acesso', { id, mail, from: 'acessos', perfilId: currentColaborador?.perfil_id }));
    }
  };

  const handleAdd = () => {
    dispatch(openModal());
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
    dispatch(closeModalAnexo());
  };

  const handleDelete = (id) => {
    dispatch(selectAnexo(id));
  };

  const confirmDelete = () => {
    dispatch(
      deleteItem('acesso', {
        mail,
        id: selectedAnexoId,
        mensagem: 'acesso eliminado',
        perfilId: currentColaborador?.perfil_id,
      })
    );
  };

  return (
    <>
      <HeaderBreadcrumbs
        heading="Acessos"
        links={[
          { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
          { name: 'Perfis', href: PATH_DIGITALDOCS.estadosAcessos.root },
          { name: 'Acessos' },
        ]}
        action={
          <RoleBasedGuard roles={['acesso-110', 'Todo-110', 'Todo-111']}>
            <Button
              variant="soft"
              onClick={handleAdd}
              startIcon={<SvgIconStyle src="/assets/icons/add.svg" sx={{ width: 20 }} />}
            >
              Adicionar
            </Button>
          </RoleBasedGuard>
        }
        sx={{ color: 'text.secondary', m: 0, p: 1, pt: 0 }}
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
                          {objetos.find((_row) => _row?.id?.toLocaleLowerCase() === row?.objeto?.toLocaleLowerCase())
                            ?.label || row?.objeto}
                        </TableCell>
                        <TableCell>{codacessos.find((_row) => _row.id === row.acesso)?.label || row.acesso}</TableCell>
                        <TableCell>{row.datalimite ? ptDateTime(row.datalimite) : 'Acesso permanente'}</TableCell>
                        <TableCell align="center" width={50}>
                          {row.objeto === 'Processo' ? (
                            <Tooltip title="Eliminar" arrow>
                              <Fab color="error" size="small" variant="soft" onClick={() => handleDelete(row?.id)}>
                                <SvgIconStyle src="/assets/icons/trash.svg" sx={{ width: 22, height: 22 }} />
                              </Fab>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Editar" arrow>
                              <Fab size="small" variant="soft" color="warning" onClick={() => handleUpdate(row?.id)}>
                                <SvgIconStyle src="/assets/icons/editar.svg" />
                              </Fab>
                            </Tooltip>
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
