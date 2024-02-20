import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// utils
import { fDateTime } from '../../utils/formatTime';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAll } from '../../redux/slices/digitaldocs';
// components
import { SkeletonBar } from '../../components/skeleton';
import { SearchNotFound } from '../../components/table';
import { ColaboradorInfo } from '../../components/Panel';
//
import DetalhesProcesso from './DetalhesProcesso';

// ----------------------------------------------------------------------

Versoes.propTypes = { id: PropTypes.number };

export default function Versoes({ id }) {
  const dispatch = useDispatch();
  const [accord, setAccord] = useState(false);
  const { mail, colaboradores, cc } = useSelector((state) => state.intranet);
  const { isLoading, versoes, processo } = useSelector((state) => state.digitaldocs);

  const handleAccord = (panel) => (event, isExpanded) => {
    setAccord(isExpanded ? panel : false);
  };

  useEffect(() => {
    if (versoes?.length > 0) {
      setAccord(versoes?.[0]?.updated_in);
    }
  }, [dispatch, versoes]);

  useEffect(() => {
    if (mail && id && cc?.perfil_id) {
      dispatch(getAll('versoes', { mail, id, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, id, mail, cc?.perfil_id]);

  return (
    <>
      {isLoading ? (
        <Stack sx={{ p: 2 }}>
          <SkeletonBar column={3} height={150} />
        </Stack>
      ) : (
        <>
          {versoes?.length === 0 ? (
            <SearchNotFound message="O processo ainda não foi modificado..." />
          ) : (
            versoes?.map((row, index) => {
              const colaborador = colaboradores?.find((_row) => _row.perfil_id === row?.updated_by);

              const getNew = (newObj, oldObj) => {
                if (Object.keys(oldObj).length === 0 && Object.keys(newObj).length > 0) return newObj;
                const diff = {};
                // eslint-disable-next-line no-restricted-syntax
                for (const key in oldObj) {
                  if (newObj[key] && oldObj[key] !== newObj[key]) {
                    diff[key] = newObj[key];
                  }
                }
                if (Object.keys(diff).length > 0) return diff;

                return oldObj;
              };
              return (
                <Accordion
                  sx={{ px: 1 }}
                  key={row?.updated_in}
                  expanded={accord === row?.updated_in}
                  onChange={handleAccord(row?.updated_in)}
                >
                  <AccordionSummary expandIcon={<KeyboardArrowDownIcon />}>
                    <Stack spacing={0.5} direction="row" alignItems="center" sx={{ flexGrow: 1, pr: 2 }}>
                      <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                        ALTERADO EM:
                      </Typography>
                      <Typography variant="subtitle1">{row?.updated_in ? fDateTime(row?.updated_in) : ''}</Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ColaboradorInfo
                      foto={colaborador?.foto_disk}
                      label={colaborador?.uo?.label}
                      nome={colaborador?.perfil?.displayName || `Perfil: ${row.perfil_id}`}
                      sx={{ justifyContent: 'center' }}
                    />
                    <DetalhesProcesso
                      processo={index === 0 ? getNew(row, processo) : getNew(versoes[index - 1], row)}
                    />
                  </AccordionDetails>
                </Accordion>
              );
            })
          )}
        </>
      )}
    </>
  );
}
