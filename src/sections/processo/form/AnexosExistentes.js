import { useState } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
// @mui
import Fab from '@mui/material/Fab';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
// utils
import { ptDateTime } from '../../../utils/formatTime';
import { getFileThumb } from '../../../utils/getFileFormat';
import { findColaborador } from '../../../utils/normalizeText';
// redux
import { useSelector, useDispatch } from '../../../redux/store';
import { selectAnexo, closeModalAnexo, deleteItem } from '../../../redux/slices/digitaldocs';
// components
import { Criado } from '../../../components/Panel';
import SvgIconStyle from '../../../components/SvgIconStyle';
import DialogConfirmar from '../../../components/DialogConfirmar';

// ----------------------------------------------------------------------

AnexosExistentes.propTypes = { anexos: PropTypes.array, processoId: PropTypes.number };

export default function AnexosExistentes({ anexos, processoId }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const anexosAtivos = anexos?.filter((row) => row.ativo);
  const [selectedAnexoID, setSelectedAnexoID] = useState(null);
  const { mail, cc, colaboradores } = useSelector((state) => state.intranet);
  const { isOpenModalAnexo, isSaving } = useSelector((state) => state.digitaldocs);

  const handleClickOpen = (idAnexo) => {
    setSelectedAnexoID(idAnexo);
    dispatch(selectAnexo(idAnexo));
  };

  const handleCloseModal = () => {
    dispatch(closeModalAnexo());
  };

  const handleDelete = async (id) => {
    try {
      dispatch(deleteItem('anexo processo', { id, mail, processoId, perfilId: cc?.perfil_id, msg: 'Anexo eliminado' }));
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  return anexosAtivos?.length > 0 ? (
    <>
      <Divider>Anexos existentes</Divider>
      <List disablePadding sx={{ mt: 1 }}>
        {anexosAtivos.map((anexo) => (
          <ListItem key={anexo?.anexo} sx={{ py: 0.5, px: 1, mb: 1, borderRadius: 1, bgcolor: 'background.neutral' }}>
            <ListItemIcon>{getFileThumb(false, null, anexo.nome)}</ListItemIcon>
            <ListItemText
              primary={anexo?.nome}
              secondary={
                <Stack direction="row" spacing={1}>
                  <Criado caption tipo="user" value={findColaborador(anexo?.criador, colaboradores)} />
                  {anexo?.criado_em && <Criado caption tipo="date" value={ptDateTime(anexo?.criado_em)} />}
                </Stack>
              }
              primaryTypographyProps={{ variant: 'subtitle2' }}
            />
            {anexo?.criador?.toLowerCase() === mail?.toLowerCase() && (
              <Fab
                size="small"
                color="error"
                variant="soft"
                sx={{ width: 30, height: 30 }}
                onClick={() => handleClickOpen(anexo.id)}
              >
                <SvgIconStyle src="/assets/icons/trash.svg" sx={{ width: 20 }} />
              </Fab>
            )}
          </ListItem>
        ))}
      </List>

      <DialogConfirmar
        isSaving={isSaving}
        open={isOpenModalAnexo}
        onClose={handleCloseModal}
        desc="eliminar este anexo"
        handleOk={() => handleDelete(selectedAnexoID)}
      />
    </>
  ) : (
    ''
  );
}
