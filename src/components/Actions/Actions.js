import PropTypes from 'prop-types';
// @mui
import { Fab, Button, Tooltip } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { openModal, selectItem, getItem } from '../../redux/slices/digitaldocs';
//
import SvgIconStyle from '../SvgIconStyle';

// ----------------------------------------------------------------------

export function AddItem() {
  const dispatch = useDispatch();

  const handleAdd = () => {
    dispatch(openModal());
  };

  return (
    <Button variant="soft" startIcon={<AddCircleIcon />} onClick={handleAdd}>
      Adicionar
    </Button>
  );
}

// ----------------------------------------------------------------------

UpdateItem.propTypes = { dados: PropTypes.object, id: PropTypes.number, item: PropTypes.string };

export function UpdateItem({ item = '', id = 0, dados = null }) {
  const dispatch = useDispatch();
  const { mail, cc } = useSelector((state) => state.intranet);

  const handleUpdateByItem = () => {
    dispatch(selectItem(dados));
  };

  const handleUpdateById = (id) => {
    if (id && cc?.perfil_id && mail) {
      dispatch(getItem(item, { id, mail, from: 'listagem', perfilId: cc?.perfil_id }));
    }
  };

  return dados ? (
    <Tooltip title="Editar" arrow>
      <Fab size="small" variant="soft" color="warning" onClick={() => handleUpdateByItem()}>
        <SvgIconStyle src="/assets/icons/editar.svg" />
      </Fab>
    </Tooltip>
  ) : (
    <Tooltip title="Editar" arrow>
      <Fab size="small" variant="soft" color="warning" onClick={() => handleUpdateById(id)}>
        <SvgIconStyle src="/assets/icons/editar.svg" />
      </Fab>
    </Tooltip>
  );
}

// ----------------------------------------------------------------------

ViewItem.propTypes = { handleView: PropTypes.func };

export function ViewItem({ handleView }) {
  return (
    <Tooltip title="DETALHES" arrow>
      <Fab color="success" size="small" variant="soft" onClick={handleView}>
        <SvgIconStyle src="/assets/icons/view.svg" />
      </Fab>
    </Tooltip>
  );
}

// ----------------------------------------------------------------------

DeleteItem.propTypes = { handleDelete: PropTypes.func };

export function DeleteItem({ handleDelete }) {
  return (
    <Tooltip title="Eliminar" arrow>
      <Fab color="error" size="small" variant="soft" onClick={handleDelete}>
        <SvgIconStyle src="/assets/icons/trash.svg" />
      </Fab>
    </Tooltip>
  );
}

// ----------------------------------------------------------------------

Checked.propTypes = { check: PropTypes.bool };

export function Checked({ check }) {
  return check ? (
    <CheckCircleOutlineOutlinedIcon sx={{ color: 'success.main', width: 20 }} />
  ) : (
    <CloseOutlinedIcon sx={{ color: 'focus.main', width: 20 }} />
  );
}
