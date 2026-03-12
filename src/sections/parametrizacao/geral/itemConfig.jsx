import TableCell from '@mui/material/TableCell';
// components
import { EstadoDetail } from '../details/estado-detail';
import { CellChecked, noDados } from '@/components/Panel';

// ---------------------------------------------------------------------------------------------------------------------

export const ITEM_CONFIG = {
  linhas: {
    canEdit: true,
    showAtivo: true,
    skeletonColumns: 4,
    defaultOrderBy: 'designacao',
    headers: [
      { id: 'linha', label: 'Designação' },
      { id: 'descricao', label: 'Segmento' },
      { id: 'ativo', label: 'Ativo', align: 'center', width: 10 },
      { id: '', width: 10 },
    ],
    renderCells: (row) => (
      <>
        <TableCell>{row.linha}</TableCell>
        <TableCell>{row.descricao}</TableCell>
      </>
    ),
  },

  despesas: {
    canEdit: true,
    showAtivo: true,
    skeletonColumns: 3,
    defaultOrderBy: 'designacao',
    headers: [
      { id: 'linha', label: 'Designação' },
      { id: 'ativo', label: 'Ativo', align: 'center', width: 10 },
      { id: '', width: 10 },
    ],
    renderCells: (row) => <TableCell>{row.designacao || row.descritivo}</TableCell>,
  },

  fluxos: {
    canEdit: false,
    showAtivo: true,
    skeletonColumns: 6,
    defaultOrderBy: 'assunto',
    headers: [
      { id: 'assunto', label: 'Assunto' },
      { id: 'modelo', label: 'Modelo' },
      { id: 'is_interno', label: 'Interno', align: 'center' },
      { id: 'is_credito', label: 'Crédito', align: 'center' },
      { id: 'is_ativo', label: 'Ativo', align: 'center', width: 10 },
      { id: '', width: 10 },
    ],
    renderCells: (row) => (
      <>
        <TableCell>{row.assunto}</TableCell>
        <TableCell>{row.modelo}</TableCell>
        <CellChecked check={row.is_interno} />
        <CellChecked check={row.is_credito} />
      </>
    ),
  },

  estados: {
    canEdit: false,
    showAtivo: false,
    skeletonColumns: 5,
    defaultOrderBy: 'nome',
    headers: [
      { id: 'nome', label: 'Nome' },
      { id: 'uo', label: 'Unidade orgânica' },
      { id: 'is_inicial', label: 'Inicial', align: 'center' },
      { id: 'is_final', label: 'Final', align: 'center' },
      { id: '', width: 10 },
    ],
    renderCells: (row) => <EstadoDetail row={row} />,
  },

  origens: {
    canEdit: false,
    showAtivo: false,
    skeletonColumns: 7,
    defaultOrderBy: 'designacao',
    headers: [
      { id: 'designacao', label: 'Designação' },
      { id: 'seguimento', label: 'Segmento' },
      { id: 'tipo', label: 'Tipo' },
      { id: 'ilha', label: 'Localização' },
      { id: 'email', label: 'Email' },
      { id: 'telefone', label: 'Telefone' },
      { id: '', width: 10 },
    ],
    renderCells: (row) => (
      <>
        <TableCell>{row.designacao}</TableCell>
        <TableCell>{row.seguimento}</TableCell>
        <TableCell>{row.tipo}</TableCell>
        <TableCell>
          {row.ilha} - {row.cidade}
        </TableCell>
        <TableCell>{row.email || noDados('(Não definido)')}</TableCell>
        <TableCell>{row.telefone || noDados('(Não definido)')}</TableCell>
      </>
    ),
  },

  documentos: {
    canEdit: true,
    showAtivo: true,
    skeletonColumns: 5,
    defaultOrderBy: 'designacao',
    headers: [
      { id: 'designacao', label: 'Designação' },
      { id: '', label: 'Anexo', align: 'center' },
      { id: 'obriga_prazo_validade', label: 'Validade', align: 'center' },
      { id: 'ativo', label: 'Ativo', align: 'center', width: 10 },
      { id: '', width: 10 },
    ],
    renderCells: (row) => (
      <>
        <TableCell>{row.designacao}</TableCell>
        <TableCell align="center">{(row?.anexo && 'Anexo') || (row.formulario && 'Formulário') || null}</TableCell>
        <CellChecked check={row.obriga_prazo_validade} />
      </>
    ),
  },

  precarios: {
    canEdit: true,
    showAtivo: true,
    skeletonColumns: 3,
    defaultOrderBy: 'designacao',
    headers: [
      { id: 'componente', label: 'Componente' },
      { id: 'linha', label: 'Linha' },
      { id: 'ativo', label: 'Ativo', align: 'center', width: 10 },
      { id: '', width: 10 },
    ],
    renderCells: (row) => (
      <>
        <TableCell>{row.componente || noDados('(Não definido...)')}</TableCell>
        <TableCell>{row.linha || noDados('(Não definido...)')}</TableCell>
      </>
    ),
  },
};

export function getItemConfig(item) {
  const config = ITEM_CONFIG[item];
  if (!config) throw new Error(`[ITEM_CONFIG] Tipo desconhecido: "${item}"`);
  return config;
}
