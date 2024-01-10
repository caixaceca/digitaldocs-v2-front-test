import { useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// utils
import { ptDateTime } from '../../../utils/formatTime';
import { newLineText } from '../../../utils/normalizeText';
// hooks
import useToggle from '../../../hooks/useToggle';
// redux
import { useDispatch, useSelector } from '../../../redux/store';
import { selectItem, openModal } from '../../../redux/slices/cc';
// components
import Label from '../../../components/Label';
import { ColaboradorInfo } from '../../../components/Panel';
import { DefaultAction } from '../../../components/Actions';
//
import { ParecerForm } from '../Form/IntervencaoForm';

// ----------------------------------------------------------------------

export default function Pareceres() {
  const dispatch = useDispatch();
  const [accord, setAccord] = useState(false);
  const { toggle: open, onOpen, onClose } = useToggle();
  const { pedidoCC } = useSelector((state) => state.cc);
  const { cc, colaboradores } = useSelector((state) => state.intranet);

  const handleAccord = (panel) => (event, isExpanded) => {
    setAccord(isExpanded ? panel : false);
  };

  const handleParecer = (item) => {
    dispatch(openModal());
    dispatch(selectItem(item));
  };

  return (
    <>
      <DefaultAction icon="parecer" label={`Pareceres - ${pedidoCC?.estados?.[0]?.estado}`} handleClick={onOpen} />
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>{`Pareceres - ${pedidoCC?.estados?.[0]?.estado}`}</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          {pedidoCC?.estados?.[0]?.pareceres?.map((row, index) => {
            const colaborador = colaboradores?.find((colab) => colab.perfil_id === row.perfil_id);
            return (
              <Accordion
                sx={{ py: 0.5 }}
                key={`view_${index}`}
                expanded={accord === row.perfil_id}
                onChange={handleAccord(row.perfil_id)}
              >
                <AccordionSummary expandIcon={<KeyboardArrowDownIcon />}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flexGrow: 1, pr: 2 }}>
                    <ColaboradorInfo
                      foto={colaborador?.foto_disk}
                      label={colaborador?.uo?.label}
                      nome={colaborador?.perfil?.displayName || `Perfil: ${row.perfil_id}`}
                    />
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Stack>
                        <Label
                          variant="ghost"
                          color={(!row?.descritivo && 'warning') || (row?.parecer_favoravel && 'success') || 'error'}
                        >
                          {(!row?.descritivo && 'Sem parecer') ||
                            (row?.parecer_favoravel && 'Favorável') ||
                            'Não Favorável'}
                        </Label>
                        {(row?.validado_em || row?.descritivo) && (
                          <Typography
                            variant="caption"
                            sx={{ px: 0.5, textAlign: 'center', color: !row?.validado_em && 'warning.main' }}
                          >
                            {row?.validado_em ? ptDateTime(row.validado_em) : 'Não validado'}
                          </Typography>
                        )}
                      </Stack>
                      {row.perfil_id === cc?.perfil_id && (
                        <>
                          {(row?.descritivo && !row?.validado && (
                            <DefaultAction
                              small
                              icon="edit"
                              label="EDITAR"
                              color="warning"
                              handleClick={() => handleParecer(row)}
                            />
                          )) ||
                            (!row?.descritivo && (
                              <DefaultAction
                                small
                                icon="add"
                                label="ADICIONAR"
                                handleClick={() => handleParecer(row)}
                              />
                            ))}
                          <ParecerForm />
                        </>
                      )}
                    </Stack>
                  </Stack>
                </AccordionSummary>
                {row?.descritivo && <AccordionDetails>{newLineText(row?.descritivo)}</AccordionDetails>}
              </Accordion>
            );
          })}
        </DialogContent>
      </Dialog>
    </>
  );
}
