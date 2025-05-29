import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
// utils
import { fPercent } from '../../utils/formatNumber';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { getFromParametrizacao } from '../../redux/slices/parametrizacao';
// components
import { CellChecked } from '../../components/Panel';
import { DefaultAction } from '../../components/Actions';
import { SearchNotFoundSmall } from '../../components/table';
import { TabsWrapperSimple } from '../../components/TabsWrapper';
//
import { RegrasForm } from './form-estado';
import { DetalhesContent } from './Detalhes';

// ----------------------------------------------------------------------

DetalhesTransicao.propTypes = { dados: PropTypes.object };

export default function DetalhesTransicao({ dados }) {
  const [currentTab, setCurrentTab] = useState('Info');

  const tabsList = [
    { value: 'Info', component: <DetalhesContent dados={dados} /> },
    { value: 'Regras', component: <RegrasTransicoes dados={dados} /> },
  ];

  return (
    <>
      <TabsWrapperSimple
        tabsList={tabsList}
        currentTab={currentTab}
        sx={{ mt: 2, mb: 1, boxShadow: 'none' }}
        changeTab={(_, newValue) => setCurrentTab(newValue)}
      />
      <Box>{tabsList?.find((tab) => tab?.value === currentTab)?.component}</Box>
    </>
  );
}

// ----------------------------------------------------------------------

RegrasTransicoes.propTypes = { dados: PropTypes.object };

function RegrasTransicoes({ dados }) {
  const dispatch = useDispatch();
  const [item, setItem] = useState(null);
  const { colaboradores } = useSelector((state) => state.intranet);
  const { colaboradoresEstado } = useSelector((state) => state.parametrizacao);

  useEffect(() => {
    dispatch(getFromParametrizacao('colaboradoresEstado', { id: dados?.estado_inicial_id }));
  }, [dispatch, dados?.estado_inicial_id]);

  return (
    <>
      <Table sx={{ mt: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell size="small">Colaborador</TableCell>
            <TableCell size="small" align="right">
              Percentagem
            </TableCell>
            <TableCell size="small" align="center">
              Aprovação
            </TableCell>
            <TableCell size="small" align="center">
              Facultativo
            </TableCell>
            <TableCell size="small" align="center">
              Ativo
            </TableCell>
            <TableCell size="small" width={10}>
              <DefaultAction label="ADICIONAR" small onClick={() => setItem({ action: 'add' })} />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dados?.regras?.map((row, index) => (
            <TableRow hover key={`${row?.id}_${index}`}>
              <TableCell>
                {colaboradores?.find(({ perfil }) => perfil?.id === row?.perfil_id)?.nome || row?.perfil_id}
              </TableCell>
              <TableCell align="right">{fPercent(row?.percentagem)}</TableCell>
              <CellChecked check={row?.para_aprovacao} />
              <CellChecked check={row?.facultativo} />
              <CellChecked check={row?.ativo} />
              <TableCell>
                <DefaultAction small label="EDITAR" onClick={() => setItem(row)} />
              </TableCell>
            </TableRow>
          ))}
          {(!dados?.regras || dados?.regras?.length === 0) && (
            <TableRow>
              <TableCell colSpan={5}>
                <SearchNotFoundSmall message="Nenhum registo disponível..." />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {!!item && (
        <RegrasForm
          onClose={() => setItem(null)}
          item={{ ...dados, perfis: colaboradoresEstado }}
          selectedItem={item?.action === 'add' ? null : item}
        />
      )}
    </>
  );
}
