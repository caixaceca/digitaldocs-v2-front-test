import { useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
// components
import { DefaultAction } from '@/components/Actions';
import { ActionForm, MessageForm } from './form-ticket';

// ---------------------------------------------------------------------------------------------------------------------

export default function Actions({ dados, onClose, admin }) {
  const [modal, setModal] = useState('');

  return (
    <>
      <Stack useFlexGap flexWrap="wrap" direction="row" spacing={1} justifyContent="flex-end">
        <DefaultAction small button icon="editar" label="Estado" onClick={() => setModal('change-status')} />
        <DefaultAction small button icon="adicionar" label="Mensagem" onClick={() => setModal('add-message')} />
        {admin && <DefaultAction small button label="Atribuir" color="info" onClick={() => setModal('assign')} />}
        <DefaultAction small button label="Encaminhar" onClick={() => setModal('change-department')} />
      </Stack>

      {modal === 'add-message' && <MessageForm dados={dados} onClose={() => setModal('')} />}
      {modal && modal !== 'add-message' && (
        <ActionForm item={modal} dados={dados} onClose={() => setModal('')} closeTicket={onClose} />
      )}
    </>
  );
}
