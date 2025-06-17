import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// @mui
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
// utils
import { fNumber } from '../../../utils/formatNumber';
// redux
import { useSelector, useDispatch } from '../../../redux/store';
import { getFromGaji9, deleteItem } from '../../../redux/slices/gaji9';
// components
import DetalhesGaji9 from '../detalhes-gaji9';
import { labelTitular } from '../applySortFilter';
import { DefaultAction } from '../../../components/Actions';
import { TableSearchNotFound } from '../../../components/table';
import { DialogConfirmar } from '../../../components/CustomDialog';
import { CellChecked, newLineText, noDados } from '../../../components/Panel';
import { SearchNotFoundSmall } from '../../../components/table/SearchNotFound';
import { RegraForm, TiposTitularesForm, ComponetesForm, SegmentosForm } from './form-opcoes';

// ---------------------------------------------------------------------------------------------------------------------

AlineasClausula.propTypes = { dados: PropTypes.array };

export function AlineasClausula({ dados = [] }) {
  return (
    <Stack sx={{ px: 0.5, mt: 3 }}>
      {dados?.length === 0 ? (
        <SearchNotFoundSmall message="Nenhum número adicionado..." />
      ) : (
        <>
          {dados?.map(({ numero_ordem: numero, conteudo, sub_alineas: alineas }, index) => (
            <Stack direction="row" key={`alinea_${index}`} spacing={1} sx={{ py: 0.75 }}>
              <Typography variant="subtitle2">{numero}.</Typography>
              <Stack>
                <Typography variant="body2">{newLineText(conteudo)}</Typography>
                {alineas?.map(({ numero_ordem: numero, conteudo }, index1) => (
                  <Stack direction="row" key={`alinea_${index}_alinea_${index1}`} spacing={1} sx={{ py: 0.25 }}>
                    <Typography variant="subtitle2">{numero}.</Typography>
                    <Typography variant="body2">{newLineText(conteudo)}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          ))}
        </>
      )}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function OpcoesClausula() {
  const dispatch = useDispatch();
  const [modal, setModal] = useState('');
  const { isSaving, selectedItem } = useSelector((state) => state.gaji9);
  const clausula = [];
  const opcoes = clausula?.opcoes || [];

  useEffect(() => {
    dispatch(getFromGaji9('clausulas', { condicional: true }));
  }, [dispatch]);

  const openModal = (modal, id) => {
    setModal(modal);
    if (modal === 'detalhes') dispatch(getFromGaji9('clausula', { id, item: 'clausulaOpcional' }));
  };

  const eliminarRegra = () => {
    const params = { condicionalId: modal, clausulaId: clausula?.clausula_id };
    dispatch(deleteItem('eliminarRegra', { ...params, msg: 'Regra eliminada', onClose: () => setModal('') }));
  };

  return (
    <>
      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell size="small">Cláusula</TableCell>
            <TableCell size="small" align="right">
              Montante
            </TableCell>
            <TableCell size="small" align="right">
              Prazo
            </TableCell>
            <TableCell size="small">Taxa negociada</TableCell>
            <TableCell size="small">2ª habitação</TableCell>
            <TableCell size="small">Isenção comissão</TableCell>
            <TableCell size="small" align="right" width={10}>
              <Stack direction="row" justifyContent="right">
                <DefaultAction small label="Adicionar" onClick={() => openModal('create', '')} />
              </Stack>
            </TableCell>
          </TableRow>
        </TableHead>
        {opcoes?.length === 0 ? (
          <TableSearchNotFound height={150} message="Nenhuma regra adicionada..." />
        ) : (
          <TableBody>
            {opcoes?.map((row, index) => (
              <TableRow haver key={`regra_${index}`}>
                <TableCell>{clausula?.titulo || noDados()}</TableCell>
                <TableCell align="right">
                  {row?.montante_maior_que && <Typography>{`> ${fNumber(row?.montante_maior_que)}`}</Typography>}
                  {row?.montante_menor_que && <Typography>{`< ${fNumber(row?.montante_menor_que)}`}</Typography>}
                  {!row?.montante_maior_que && !row?.montante_menor_que && noDados('(Não definido)')}
                </TableCell>
                <TableCell align="right">
                  {row?.prazo_maior_que && <Typography>{`> ${fNumber(row?.prazo_maior_que)}`}</Typography>}
                  {row?.prazo_menor_que && <Typography>{`< ${fNumber(row?.prazo_menor_que)}`}</Typography>}
                  {!row?.prazo_maior_que && !row?.prazo_menor_que && noDados('(Não definido)')}
                </TableCell>
                <CellChecked check={row?.taxa_juros_negociado} />
                <CellChecked check={row?.segunda_habitacao} />
                <CellChecked check={row?.isencao_comissao} />
                <TableCell>
                  <Stack direction="row" spacing={0.75}>
                    <DefaultAction small label="ELIMINAR" onClick={() => openModal(row?.clausula_id, '')} />
                    <DefaultAction small label="DETALHES" onClick={() => openModal('detalhes', row?.clausula_id)} />
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>

      {modal === 'detalhes' && <DetalhesGaji9 closeModal={() => setModal('')} item="clausulas" opcao />}
      {modal === 'create' && <RegraForm onClose={() => setModal('')} dados={selectedItem} />}
      {!!modal && modal !== 'create' && modal !== 'detalhes' && (
        <DialogConfirmar
          isSaving={isSaving}
          desc="eliminar esta regra"
          onClose={() => setModal('')}
          handleOk={() => eliminarRegra()}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

Relacionados.propTypes = { id: PropTypes.number, dados: PropTypes.array, item: PropTypes.string };

export function Relacionados({ id, dados = [], item = 'tipo de titular' }) {
  const dispatch = useDispatch();
  const [modal, setModal] = useState('');
  const { isSaving, selectedItem } = useSelector((state) => state.gaji9);

  const eliminarItem = () => {
    const params = { itemId: id, id: modal, msg: 'Item eliminado', getItem: 'selectedItem' };
    const itemDel =
      (item === 'componente' && 'componenteSeg') || (item === 'segmento' && 'segmentoCl') || 'tipoTitularCl';
    dispatch(deleteItem(itemDel, { ...params, onClose: () => setModal('') }));
  };

  return (
    <>
      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell size="small">
              {(item === 'componente' && 'Componente') || (item === 'segmento' && 'Segmento') || 'Tipo de titular'}
            </TableCell>
            <TableCell size="small" align="center">
              Ativo
            </TableCell>
            <TableCell size="small" align="right" width={10}>
              <DefaultAction small label="Adicionar" onClick={() => setModal('create')} />
            </TableCell>
          </TableRow>
        </TableHead>
        {dados?.length === 0 ? (
          <TableSearchNotFound height={150} message="Nenhum item relacionado..." />
        ) : (
          <TableBody>
            {dados?.map((row, index) => (
              <TableRow haver key={`relacionado_${index}`}>
                <TableCell>
                  {row?.componente || row?.segmento || labelTitular(row?.tipo_titular, row?.consumidor) || noDados()}
                </TableCell>
                <CellChecked check={row?.ativo} />
                <TableCell>
                  <DefaultAction small label="ELIMINAR" onClick={() => setModal(row?.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>

      {modal === 'create' && item === 'componente' && (
        <ComponetesForm onClose={() => setModal('')} id={id} ids={extrairIds(selectedItem, 'componentes')} />
      )}
      {modal === 'create' && item === 'segmento' && (
        <SegmentosForm onClose={() => setModal('')} id={id} ids={extrairIds(selectedItem, 'segmentos')} />
      )}
      {modal === 'create' && item === 'tipo de titular' && (
        <TiposTitularesForm onClose={() => setModal('')} id={id} ids={extrairIds(selectedItem, 'tipos_titulares')} />
      )}
      {!!modal && modal !== 'create' && (
        <DialogConfirmar
          isSaving={isSaving}
          onClose={() => setModal('')}
          desc={`eliminar este ${item}`}
          handleOk={() => eliminarItem()}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function extrairIds(dados, item) {
  const ids = [];
  if (item === 'segmentos' && dados?.segmento_id != null) ids.push(dados.segmento_id);
  if (item === 'componentes' && dados?.componente_id != null) ids.push(dados.componente_id);
  if (item === 'tipos_titulares' && dados?.tipo_titular_id != null) ids.push(dados.tipo_titular_id);
  if (Array.isArray(dados[item])) {
    dados[item].forEach((t) => {
      if (t?.id != null) ids.push(t.id);
    });
  }
  return ids;
}
