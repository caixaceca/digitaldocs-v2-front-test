import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
// utils
import { fDateTime } from '../../../utils/formatTime';
// redux
import { getAll } from '../../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../../redux/store';
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
  const [accord, setAccord] = useState(false);
  const { isLoading, processo } = useSelector((state) => state.digitaldocs);
  const { mail, colaboradores, cc } = useSelector((state) => state.intranet);

  const handleAccord = (panel) => (event, isExpanded) => {
    setAccord(isExpanded ? panel : false);
  };

  useEffect(() => {
    if (processo?.hversoes?.length > 0) {
      setAccord(processo?.hversoes?.[0]?.updated_in);
    }
  }, [dispatch, processo?.hversoes]);

  useEffect(() => {
    if (mail && id && cc?.perfil_id) {
      dispatch(getAll('hversoes', { mail, id, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, id, mail, cc?.perfil_id]);

  return (
    <Stack sx={{ p: { xs: 1, sm: 3 } }}>
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
                <Stack key={row?.updated_in}>
                  <Accordion expanded={accord === row?.updated_in} onChange={handleAccord(row?.updated_in)}>
                    <AccordionSummary>
                      <Stack spacing={1} direction="row" sx={{ flexGrow: 1, pr: 2 }} justifyContent="space-between">
                        <Stack>
                          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                            Alterado em:
                          </Typography>
                          <Typography variant="subtitle1">
                            {row?.updated_in ? fDateTime(row?.updated_in) : ''}
                          </Typography>
                        </Stack>
                        <ColaboradorInfo
                          foto={colaborador?.foto_disk}
                          label={colaborador?.uo?.label}
                          nome={colaborador?.perfil?.displayName || `Perfil: ${row.perfil_id}`}
                        />
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <DetalhesProcesso
                        processo={
                          index === 0
                            ? camposAterados(row, processo)
                            : camposAterados(processo?.hversoes[index - 1], row)
                        }
                      />
                    </AccordionDetails>
                  </Accordion>
                  {accord !== row?.updated_in && processo?.hversoes?.length > index + 1 && <Divider />}
                </Stack>
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
