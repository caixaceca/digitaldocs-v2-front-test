import PropTypes from 'prop-types';
// @mui
import { Fab, Tooltip } from '@mui/material';
import SettingsBackupRestoreOutlinedIcon from '@mui/icons-material/SettingsBackupRestoreOutlined';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { resgatarProcesso } from '../../redux/slices/digitaldocs';
// hooks
import useToggle from '../../hooks/useToggle';
// components
import DialogConfirmar from '../../components/DialogConfirmar';

// ----------------------------------------------------------------------

Resgatar.propTypes = { fluxiId: PropTypes.number, estadoId: PropTypes.number, processoId: PropTypes.number };

export default function Resgatar({ fluxiId, estadoId, processoId }) {
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { mail, currentColaborador } = useSelector((state) => state.intranet);

  const handleResgatar = () => {
    const formData = { estado_id: estadoId, fluxoID: fluxiId, perfil_id: currentColaborador?.perfil_id };
    dispatch(resgatarProcesso(JSON.stringify(formData), processoId, mail));
    onClose();
  };

  return (
    <>
      <Tooltip title="RESGATAR" arrow>
        <Fab color="warning" size="small" variant="soft" onClick={onOpen}>
          <SettingsBackupRestoreOutlinedIcon />
        </Fab>
      </Tooltip>

      <DialogConfirmar
        open={open}
        onClose={onClose}
        isLoading={isSaving}
        handleOk={handleResgatar}
        color="warning"
        title="Resgatar"
        desc="resgatar este processo"
      />
    </>
  );
}
