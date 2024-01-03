// redux
import { useDispatch } from '../redux/store';

// ----------------------------------------------------------------------

export default function useModal(closeModal) {
  const dispatch = useDispatch();

  const handleCloseModal = () => {
    dispatch(closeModal);
  };

  return { handleCloseModal };
}
