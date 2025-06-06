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
// hooks
import { getComparator, applySort } from '../../../hooks/useTable';
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

  const { hversoes = {} } = processo;
  const { versoes = [] } = hversoes;

  useEffect(() => {
    if (versoes && versoes?.length > 0) setAccord(versoes?.[0]?.feito_em);
  }, [dispatch, versoes]);

  useEffect(() => {
    if (id) dispatch(getInfoProcesso('hversoes', { id }));
  }, [dispatch, id]);

  const handleAccord = (panel) => (event, isExpanded) => {
    setAccord(isExpanded ? panel : '');
  };

  return (
    <Stack spacing={{ xs: 1, sm: 2 }} sx={{ p: { xs: 1, sm: 2 } }}>
      {isLoading ? (
        <SkeletonBar column={3} height={150} />
      ) : (
        <>
          {!versoes || versoes?.length === 0 ? (
            <SearchNotFound message="O processo ainda não foi modificado..." />
          ) : (
            applySort(versoes, getComparator('desc', 'feito_em'))?.map((row, index) => {
              const colaborador = colaboradores?.find(
                ({ email }) => email?.toLowerCase() === row?.feito_por?.toLowerCase()
              );

              return (
                <Accordion
                  key={`vr_${index}`}
                  expanded={accord === row?.feito_em}
                  onChange={handleAccord(row?.feito_em)}
                >
                  <AccordionSummary>
                    <Stack spacing={1} direction="row" sx={{ flexGrow: 1, pr: 2 }} justifyContent="space-between">
                      <Stack>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Alterado em:
                        </Typography>
                        <Typography variant="subtitle2">{ptDateTime(row?.feito_em)}</Typography>
                      </Stack>
                      <ColaboradorInfo
                        id={colaborador?.id}
                        foto={colaborador?.foto_disk}
                        label={colaborador?.uo?.label}
                        nome={colaborador?.perfil?.displayName || row.feito_por}
                      />
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <DetalhesProcesso processo={row} versoes />
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
