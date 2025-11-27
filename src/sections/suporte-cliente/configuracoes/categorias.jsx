import { useState } from 'react';
// @mui
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import DialogContent from '@mui/material/DialogContent';
// redux
import { useSelector } from '../../../redux/store';
// Components
import { CategoriasForm } from './form-configuracoes';
import { DefaultAction } from '../../../components/Actions';
import { DialogTitleAlt } from '../../../components/CustomDialog';
import { TableSearchNotFound } from '../../../components/table/SearchNotFound';

// ---------------------------------------------------------------------------------------------------------------------

export default function Categorias({ onClose }) {
  const [item, setItem] = useState(null);
  const { categorias } = useSelector((state) => state.suporte);

  return (
    <>
      <Dialog open onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitleAlt title="Categorias" onClose={onClose} />
        <DialogContent>
          <Table sx={{ mt: 3 }} size="small">
            <TableHead>
              <TableRow>
                <TableCell>Categoria</TableCell>
                <TableCell width={10}>
                  <DefaultAction label="ADICIONAR" small onClick={() => setItem({ action: 'add' })} />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categorias?.map((row, index) => (
                <TableRow hover key={`categoria_${index}`}>
                  <TableCell>{row?.name}</TableCell>
                  <TableCell>
                    <DefaultAction label="EDITAR" small onClick={() => setItem({ action: 'edit', ...row })} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {categorias?.length === 0 && (
              <TableSearchNotFound message="Não foi encontrado nenhum registo disponível..." />
            )}
          </Table>
        </DialogContent>
      </Dialog>
      {item && <CategoriasForm selectedItem={item} onClose={() => setItem(null)} />}
    </>
  );
}
