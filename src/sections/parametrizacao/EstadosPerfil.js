import { useEffect } from 'react';
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
import AddCircleIcon from '@mui/icons-material/AddCircle';
// utils
import { ptDateTime } from '../../utils/formatTime';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAll, getSelectMeuEstadoSuccess, openModal, closeModal } from '../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import Scrollbar from '../../components/Scrollbar';
import SvgIconStyle from '../../components/SvgIconStyle';
import { SkeletonTable } from '../../components/skeleton';
import { TableSearchNotFound } from '../../components/table';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';
//
import { EstadosPerfilForm } from './ParametrizacaoForm';

// ----------------------------------------------------------------------

export default function EstadosPerfil() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { mail, currentColaborador } = useSelector((state) => state.intranet);
  const { isLoading, meusEstados, estados, isOpenModal } = useSelector((state) => state.digitaldocs);

  const isNotFound = !meusEstados?.length;

  useEffect(() => {
    if (mail && id && currentColaborador?.perfil_id) {
      dispatch(getAll('meusEstados', { mail, estadoId: id, perfilId: currentColaborador?.perfil_id }));
    }
    if (mail && estados?.length === 0) {
      dispatch(getAll('estados', { mail, perfilId: currentColaborador?.perfil_id }));
    }
  }, [dispatch, id, estados, currentColaborador?.perfil_id, mail]);

  const handleUpdate = (id) => {
    dispatch(getSelectMeuEstadoSuccess(id));
  };

  const handleAdd = () => {
    dispatch(openModal());
  };

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
            <Button variant="soft" onClick={handleAdd} startIcon={<AddCircleIcon />}>
              Adicionar
            </Button>
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
                    meusEstados?.map((row) => (
                      <TableRow key={row?.id} hover>
                        <TableCell>{row.nome}</TableCell>
                        <TableCell>{row.data_inicial ? ptDateTime(row.data_inicial) : 'Acesso permanente'}</TableCell>
                        <TableCell>{row.data_limite ? ptDateTime(row.data_limite) : 'Acesso permanente'}</TableCell>
                        <TableCell align="center" width={50}>
                          <Tooltip title="Editar" arrow>
                            <Fab size="small" variant="soft" color="warning" onClick={() => handleUpdate(row)}>
                              <SvgIconStyle src="/assets/icons/editar.svg" />
                            </Fab>
                          </Tooltip>
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
