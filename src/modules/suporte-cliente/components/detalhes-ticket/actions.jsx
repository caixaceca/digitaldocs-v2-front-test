import { useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import DialogActions from '@mui/material/DialogActions';
// utils
import { useDispatch } from '@/redux/store';
import { createInSuporte } from '@/redux/slices/suporte-cliente';
// components
import { DefaultAction } from '@/components/Actions';
import { ActionForm, MessageForm } from './form-ticket';
import { DialogConfirmar } from '@/components/CustomDialog';

// ---------------------------------------------------------------------------------------------------------------------

const ACTION_BUTTONS = [
  { key: 'change-status', icon: 'editar', label: 'Estado', tooltip: 'Alterar estado do ticket' },
  { key: 'add-message', icon: 'adicionar', label: 'Mensagem', tooltip: 'Adicionar mensagem' },
  { key: 'change-department', icon: null, label: 'Encaminhar', tooltip: 'Encaminhar para outro departamento' },
];

const ADMIN_BUTTONS = [
  { key: 'change-subject', label: 'Assunto', icon: 'editar', tooltip: 'Alterar assunto do ticket' },
  { key: 'assign', label: 'Atribuir', color: 'info', tooltip: 'Atribuir ticket a um colaborador' },
];

// ---------------------------------------------------------------------------------------------------------------------

function useTicketPermissions({ dados, utilizador }) {
  const role = utilizador?.role;
  const status = dados?.status;

  const isOperator = role === 'OPERATOR';
  const isAdmin = role === 'ADMINISTRATOR';
  const isCoordinator = role === 'COORDINATOR';
  const canChange = status === 'OPEN' || status === 'IN_PROGRESS';

  const isUnassigned = !dados?.current_user_id;
  const isAssignedToMe = dados?.current_user_id === utilizador?.id;
  const isInDepartment = isAdmin || dados?.current_department_id === utilizador?.department_id;

  // OPERATOR: precisa que o ticket esteja atribuído a ele ou não atribuído
  // COORDINATOR: pode agir independentemente de ownership
  // ADMIN: pode tudo, sem restrição de departamento
  const canActOnTicket =
    isAdmin || (isInDepartment && (isCoordinator || (isOperator && (isAssignedToMe || isUnassigned))));

  return {
    canSendLembrete: status === 'DRAFT',
    canSeeActionButtons: canChange && canActOnTicket,
    canSeeAdminButtons: canChange && isInDepartment && (isAdmin || isCoordinator),
  };
}

// ---------------------------------------------------------------------------------------------------------------------

export default function Actions({ dados, onClose, utilizador, refetch }) {
  const dispatch = useDispatch();
  const [modal, setModal] = useState('');

  const { canSeeActionButtons, canSeeAdminButtons, canSendLembrete } = useTicketPermissions({ dados, utilizador });

  const openModal = (key) => setModal(key);
  const closeModal = () => setModal('');

  const hasAnyAction = canSeeActionButtons || canSeeAdminButtons || canSendLembrete;
  if (!hasAnyAction) return null;

  return (
    <>
      <Divider sx={{ borderStyle: 'dotted' }} />
      <DialogActions>
        <Stack useFlexGap flexWrap="wrap" direction="row" spacing={1} justifyContent="center" sx={{ width: 1 }}>
          {canSeeActionButtons &&
            ACTION_BUTTONS.map(({ key, icon, label, tooltip }) => (
              <Tooltip key={key} title={tooltip} arrow placement="top">
                <DefaultAction small button icon={icon} label={label} onClick={() => openModal(key)} />
              </Tooltip>
            ))}

          {canSeeAdminButtons &&
            ADMIN_BUTTONS.map(({ key, icon, label, color, tooltip }) => (
              <Tooltip key={key} title={tooltip} arrow placement="top">
                <DefaultAction small button icon={icon} label={label} color={color} onClick={() => openModal(key)} />
              </Tooltip>
            ))}

          {canSendLembrete && (
            <DefaultAction small button label="Enviar lembrete" color="inherit" onClick={() => openModal('lembrete')} />
          )}
        </Stack>

        {modal === 'add-message' && <MessageForm dados={dados} onClose={closeModal} />}
        {modal && modal !== 'add-message' && modal !== 'lembrete' && (
          <ActionForm item={modal} dados={dados} onClose={closeModal} closeTicket={onClose} refetch={refetch} />
        )}
        {modal === 'lembrete' && (
          <DialogConfirmar
            color="success"
            onClose={closeModal}
            title="Enviar lembrete"
            desc="enviar um lembrete de validação do email para o registo do pedido"
            handleOk={() => {
              const params = { msg: 'Lembrete enviado', onClose: () => closeModal() };
              dispatch(createInSuporte('lembrete', null, { id: dados?.id, ...params }));
            }}
          />
        )}
      </DialogActions>
    </>
  );
}
