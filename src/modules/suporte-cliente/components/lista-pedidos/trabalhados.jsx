import { useState, useEffect, useMemo, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
// utils
import useTable from '@/hooks/useTable';
import { formatDate } from '@/utils/formatTime';
import { useDispatch, useSelector } from '@/redux/store';
import { getInSuporte } from '@/redux/slices/suporte-cliente';
import { getAccessibleUsers, injectCollaboratorName } from '../../utils';
// Components
import TablePedidos from './table-pedidos';
import { SearchTrabalhados } from './search-toolbar';
import HeaderBreadcrumbs from '@/components/HeaderBreadcrumbs';

// ---------------------------------------------------------------------------------------------------------------------

export default function Trabalhados({ setDepartment, departmentList, department }) {
  const dispatch = useDispatch();
  const { order, page, rowsPerPage, setPage, ...rest } = useTable({ defaultRowsPerPage: 10 });

  const colaboradores = useSelector((state) => state.intranet.colaboradores);
  const { trabalhados, utilizador, utilizadores, assuntos } = useSelector((state) => state.suporte);
  const usersList = getAccessibleUsers(utilizadores, colaboradores, utilizador, department);

  const [subject, setSubject] = useState(null);
  const [datai, setDatai] = useState(new Date());
  const [dataf, setDataf] = useState(new Date());
  const [colaborador, setColaborador] = useState(usersList?.find(({ id }) => id === utilizador?.id));

  useEffect(() => {
    if (!department) setDepartment(departmentList?.find(({ id }) => id == utilizador?.department_id));
  }, [department, departmentList, setDepartment, utilizador?.department_id]);

  const fetchTickets = useCallback(() => {
    if (!department?.id) return;
    dispatch(
      getInSuporte('trabalhados', {
        page,
        size: rowsPerPage,
        reset: { dados: {} },
        subjectId: subject?.id,
        employeeId: colaborador?.id,
        departmentId: department?.id,
        dateTo: formatDate(dataf, 'yyyy-MM-dd'),
        dateFrom: formatDate(datai, 'yyyy-MM-dd'),
      })
    );
  }, [department?.id, dispatch, page, dataf, datai, rowsPerPage, subject?.id, colaborador?.id]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const { data = [], totalElements: total = 0 } = trabalhados || {};
  const dados = useMemo(
    () => injectCollaboratorName(data, utilizadores, colaboradores),
    [data, utilizadores, colaboradores]
  );

  return (
    <>
      <HeaderBreadcrumbs sx={{ px: 1 }} heading="Trabalhados" />
      <Card sx={{ p: 1 }}>
        <SearchTrabalhados
          values={{ colaborador, datai, dataf, subject, department }}
          lists={{ usersList, subjectsList: assuntos, departmentList }}
          setValues={{ setDepartment, setDatai, setDataf, setSubject, setColaborador }}
        />
        <TablePedidos
          dados={dados}
          item="trabalhados"
          hasColab={!!colaborador?.id}
          refetch={() => fetchTickets()}
          useTable={{ total, page, order, rowsPerPage, ...rest }}
        />
      </Card>
    </>
  );
}
