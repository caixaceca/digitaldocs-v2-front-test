import React, { useMemo } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
// utils
import { ptDateTime } from '../../../utils/formatTime';
import { getCustomerTypeLabel, getColorRating, ratingList } from '../utils';
// components
import { newLineText } from '../../../components/Panel';
import Label, { LabelSN } from '../../../components/Label';
//
import Mensagens from './mensagens';

// ---------------------------------------------------------------------------------------------------------------------

export const Detalhes = React.memo(({ ticket }) => {
  const { messages = [], description, attachments = [], customer = {}, ...res } = ticket || {};

  const allMessages = useMemo(() => {
    const rootMessage = { content: description ?? '', sent_at: res?.created_at, from: 'Cliente', attachments };
    const normalized = messages.map((m) => ({ ...m, from: m?.user_id }));
    const combined = [rootMessage, ...normalized].sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));
    return combined;
  }, [description, res?.created_at, attachments, messages]);

  return (
    <>
      <Stack useFlexGap flexWrap="wrap" direction={{ xs: 'column', sm: 'row' }} spacing={5}>
        <Stack spacing={1}>
          <ItemDesc label="Cliente da Caixa" value={<LabelSN val={customer?.is_cliente} />} />
          <ItemDesc label="Nome" value={customer?.fullname} />
          <ItemDesc label="E-mail" value={customer?.email} />
          <ItemDesc label="Telefone" value={customer?.phone} />
          {!customer?.is_cliente && <ItemDesc label="Emigrante" value={<LabelSN val={customer?.is_emigrant} />} />}
        </Stack>

        {customer?.is_cliente && (
          <Stack spacing={1}>
            <ItemDesc label="Emigrante" value={<LabelSN val={customer?.is_emigrant} />} />
            <ItemDesc label="Tipo de cliente" value={getCustomerTypeLabel(customer?.customer_type)} />
            <ItemDesc label="Agência" value={customer?.agency_name} />
            <ItemDesc label="Número de conta" value={customer?.account_number} />
          </Stack>
        )}
        {res?.created_by_email && (
          <Label color="info" startIcon={<InfoOutlineIcon />}>
            Criado a partir do email
          </Label>
        )}
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        Histórico de mensagens
      </Typography>

      <Mensagens messages={allMessages} />

      {ticket?.customer_satisfaction && <Avaliacao avaliacao={ticket?.customer_satisfaction} />}
    </>
  );
});

function ItemDesc({ label, value }) {
  return value ? (
    <Typography variant="body2">
      <strong>{label}:</strong> {value}
    </Typography>
  ) : null;
}

// ---------------------------------------------------------------------------------------------------------------------

function Avaliacao({ avaliacao }) {
  const { comments, evaluation_datetime: date } = avaliacao;
  const rating = ratingList?.find(({ id }) => id === avaliacao?.rating)?.rating;

  return (
    <>
      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
        Avaliação do cliente
      </Typography>

      <Stack direction="row" spacing={1} alignItems="flex-end" useFlexGap flexWrap="wrap">
        <Rating name="read-only" value={rating} readOnly sx={{ color: 'success.main' }} />
        <Typography variant="subtitle1" sx={{ color: getColorRating(rating), lineHeight: 1.5, px: 1 }}>
          {ratingList?.find(({ id }) => id === avaliacao?.rating)?.label}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
          {ptDateTime(date)}
        </Typography>
      </Stack>

      {comments && (
        <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
          {newLineText(comments)}
        </Typography>
      )}
    </>
  );
}
