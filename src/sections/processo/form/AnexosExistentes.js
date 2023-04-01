import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
// @mui
import {
  Fab,
  List,
  Dialog,
  Button,
  ListItem,
  Typography,
  DialogTitle,
  ListItemIcon,
  ListItemText,
  DialogContent,
  DialogActions,
  DialogContentText,
  ListItemSecondaryAction,
} from '@mui/material';
// utils
import { getFileThumb } from '../../../utils/getFileFormat';
// redux
import { useSelector, useDispatch } from '../../../redux/store';
import { selectAnexo, closeModalAnexo, deleteAnexo } from '../../../redux/slices/digitaldocs';
// components
import SvgIconStyle from '../../../components/SvgIconStyle';

// ----------------------------------------------------------------------

AnexosExistentes.propTypes = { anexos: PropTypes.array, processoId: PropTypes.number };

export default function AnexosExistentes({ anexos, processoId }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedAnexoID, setSelectedAnexoID] = useState(null);
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);
  const { done, error, isOpenModalAnexo } = useSelector((state) => state.digitaldocs);
  const anexosAtivos = anexos?.filter((row) => row.is_ativo);

  useEffect(() => {
    if (done === 'anexo eliminado') {
      enqueueSnackbar('Anexo eliminado com sucesso', { variant: 'success' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const handleClickOpen = (idAnexo) => {
    setSelectedAnexoID(idAnexo);
    dispatch(selectAnexo(idAnexo));
  };

  const handleCloseModal = () => {
    dispatch(closeModalAnexo());
  };

  const handleDelete = async (id) => {
    try {
      dispatch(
        deleteAnexo('anexo processo', {
          id,
          mail,
          processoId,
          perfilId: currentColaborador?.perfil_id,
          mensagem: 'anexo eliminado',
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  return (
    <>
      <Typography variant="body2" sx={{ mt: 4, color: 'text.secondary' }}>
        Existentes
      </Typography>
      <List disablePadding sx={{ mt: 1 }}>
        {anexosAtivos.map(
          (anexo) =>
            anexo.nome && (
              <ListItem
                key={anexo?.anexo}
                sx={{ p: 1.5, mb: 1.5, borderRadius: 1, border: (theme) => `solid 1px ${theme.palette.divider}` }}
              >
                <ListItemIcon>{getFileThumb(anexo.nome)}</ListItemIcon>
                <ListItemText>{anexo.nome}</ListItemText>
                <ListItemSecondaryAction>
                  {anexosAtivos.length > 1 && (
                    <Fab
                      color="error"
                      size="small"
                      variant="soft"
                      onClick={() => {
                        handleClickOpen(anexo.id);
                      }}
                      sx={{ width: 30, height: 30 }}
                    >
                      <SvgIconStyle src="/assets/icons/trash.svg" sx={{ width: 20 }} />
                    </Fab>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            )
        )}
      </List>

      <Dialog open={isOpenModalAnexo} onClose={handleCloseModal} fullWidth maxWidth="xs">
        <DialogTitle sx={{ mb: 3 }}>Eliminar anexo</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Tens a certeza de que pretendes eliminar este anexo?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button color="error" variant="outlined" onClick={() => handleDelete(selectedAnexoID)} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
