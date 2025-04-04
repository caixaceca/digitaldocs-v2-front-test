import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
// utils
import { ptDateTime } from '../../../utils/formatTime';
// redux
import { useDispatch, useSelector } from '../../../redux/store';
import { getInfoProcesso } from '../../../redux/slices/digitaldocs';
// components
import { SkeletonBar } from '../../../components/skeleton';
import { SearchNotFound } from '../../../components/table';
import { ColaboradorInfo } from '../../../components/Panel';
//
import DetalhesProcesso from './DetalhesProcesso';

// ----------------------------------------------------------------------

Versoes.propTypes = { id: PropTypes.number };

export default function Versoes({ id }) {
  const dispatch = useDispatch();
  const [accord, setAccord] = useState('');
  const { colaboradores } = useSelector((state) => state.intranet);
  const { isLoading, processo } = useSelector((state) => state.digitaldocs);

  const handleAccord = (panel) => (event, isExpanded) => {
    setAccord(isExpanded ? panel : '');
  };

  useEffect(() => {
    if (processo?.hversoes?.length > 0) setAccord(processo?.hversoes?.[0]?.updated_in);
  }, [dispatch, processo?.hversoes]);

  useEffect(() => {
    if (id) dispatch(getInfoProcesso('hversoes', { id }));
  }, [dispatch, id]);

  return (
    <Stack spacing={{ xs: 1, sm: 2 }} sx={{ p: { xs: 1, sm: 2 } }}>
      {isLoading ? (
        <SkeletonBar column={3} height={150} />
      ) : (
        <>
          {!processo?.hversoes || processo?.hversoes?.length === 0 ? (
            <SearchNotFound message="O processo ainda não foi modificado..." />
          ) : (
            processo?.hversoes?.map((row, index) => {
              const colaborador = colaboradores?.find((_row) => _row.perfil_id === row?.updated_by);

              return (
                <Accordion
                  key={`vr_${index}`}
                  expanded={accord === row?.updated_in}
                  onChange={handleAccord(row?.updated_in)}
                >
                  <AccordionSummary>
                    <Stack spacing={1} direction="row" sx={{ flexGrow: 1, pr: 2 }} justifyContent="space-between">
                      <Stack>
                        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                          Alterado em:
                        </Typography>
                        <Typography variant="subtitle1">{ptDateTime(row?.updated_in)}</Typography>
                      </Stack>
                      <ColaboradorInfo
                        id={colaborador?.id}
                        foto={colaborador?.foto_disk}
                        label={colaborador?.uo?.label}
                        nome={colaborador?.perfil?.displayName || `Perfil: ${row.perfil_id}`}
                      />
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <DetalhesProcesso
                      processo={
                        index === 0 ? camposAterados(row, processo) : camposAterados(processo?.hversoes[index - 1], row)
                      }
                    />
                  </AccordionDetails>
                </Accordion>
              );
            })
          )}
        </>
      )}
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function camposAterados(newObj, oldObj) {
  if (Object.keys(oldObj).length === 0 && Object.keys(newObj).length > 0) return newObj;
  const chaves = Object.keys(oldObj);
  const diff = {};
  chaves?.forEach((key) => {
    if (newObj[key] && oldObj[key] !== newObj[key]) {
      diff[key] = newObj[key];
    }
  });
  if (Object.keys(diff).length > 0) return diff;
  return oldObj;
}
