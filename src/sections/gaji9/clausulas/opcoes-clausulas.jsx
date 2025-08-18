import { useEffect, useState } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fNumber } from '../../../utils/formatNumber';
import { numeroParaLetra } from '../../../utils/formatText';
// redux
import { useSelector, useDispatch } from '../../../redux/store';
import { getFromGaji9, setModal, deleteItem } from '../../../redux/slices/gaji9';
// components
import DetalhesGaji9 from '../detalhes-gaji9';
import { labelTitular } from '../applySortFilter';
import { DefaultAction } from '../../../components/Actions';
import { TableSearchNotFound } from '../../../components/table';
import { DialogConfirmar } from '../../../components/CustomDialog';
import SearchNotFound from '../../../components/table/SearchNotFound';
import { CellChecked, newLineText, noDados } from '../../../components/Panel';
import { ComponetesForm, SegmentosForm, FinalidadesForm, CondicionalForm } from './form-opcoes';

const sx = { '&:hover': { backgroundColor: 'action.hover', borderRadius: 1.5 }, p: 1.25 };

// ---------------------------------------------------------------------------------------------------------------------

export function NumerosClausula({ id = '', dados = [], condicional = false, minuta = false }) {
  const [item, setItem] = useState('');

  return (
    <Card sx={condicional || minuta ? { boxShadow: 'none', bgcolor: 'transparent', borderRadius: 0 } : { p: 2 }}>
      {dados?.length === 0 ? (
        <SearchNotFound message="Nenhum número adicionado..." />
      ) : (
        <Stack spacing={condicional ? 1.5 : 0.5}>
          {dados?.map((numero, index) => (
            <Stack spacing={1} direction="row" key={`numero_${index}`} sx={condicional ? null : sx}>
              {!condicional && !minuta && (
                <DefaultAction small label="CONDICIONAL" onClick={() => setItem({ ...numero, componente: 'Número' })} />
              )}
              <Stack spacing={1} direction="row">
                {numero?.numero_ordem && (
                  <Typography variant={condicional ? 'subtitle2' : 'subtitle1'}>{numero?.numero_ordem}.</Typography>
                )}
                <Stack spacing={condicional ? 1 : 0}>
                  {numero?.conteudo && (
                    <Typography variant={condicional ? 'body2' : 'body1'}>{newLineText(numero?.conteudo)}</Typography>
                  )}
                  {numero?.sub_alineas?.map((alinea, index1) => (
                    <Stack spacing={1} direction="row" sx={condicional ? null : sx} key={`num_${index}_al_${index1}`}>
                      {!condicional && !minuta && (
                        <DefaultAction
                          small
                          label="CONDICIONAL"
                          onClick={() => setItem({ ...alinea, componente: 'Alínea', numero: numero?.numero_ordem })}
                        />
                      )}
                      <Stack direction="row" spacing={condicional ? 0.5 : 1}>
                        <Typography variant={condicional ? 'subtitle2' : 'subtitle1'}>
                          {numeroParaLetra(alinea?.numero_ordem)}.
                        </Typography>
                        <Typography variant={condicional ? 'body2' : 'body1'}>
                          {newLineText(alinea?.conteudo)}
                        </Typography>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Stack>
          ))}
        </Stack>
      )}
      {item && <CondicionalForm onClose={() => setItem(null)} id={id} dados={item} />}
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function OpcoesClausula() {
  const dispatch = useDispatch();
  const [modal, setModal] = useState('');
  const clausula = [];
  const opcoes = clausula?.opcoes || [];

  const openModal = (modal, id) => {
    setModal(modal);
    if (modal === 'detalhes') dispatch(getFromGaji9('clausula', { id, item: 'clausulaOpcional' }));
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
              {' '}
            </TableCell>
          </TableRow>
        </TableHead>
        {opcoes?.length === 0 ? (
          <TableSearchNotFound height={150} message="Nenhuma regra adicionada..." />
        ) : (
          <TableBody>
            {opcoes?.map((row, index) => (
              <TableRow hover key={`regra_${index}`}>
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
                  <DefaultAction small label="DETALHES" onClick={() => openModal('detalhes', row?.clausula_id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>

      {modal === 'detalhes' && <DetalhesGaji9 closeModal={() => setModal('')} item="clausulas" opcao />}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Relacionados({ id, dados = [], item = '', na = false }) {
  const dispatch = useDispatch();
  const [modal, setModal] = useState('');
  const { isSaving } = useSelector((state) => state.gaji9);

  useEffect(() => {
    if (item === 'Finalidade') dispatch(getFromGaji9('finalidades'));
  }, [dispatch, item]);

  const eliminarItem = () => {
    const itemDel = (item === 'Componente' && 'componenteSeg') || (item === 'Finalidade' && 'finalidadeSeg');
    const params = { itemId: id, id: modal, msg: 'Item eliminado', getItem: 'selectedItem' };
    dispatch(deleteItem(itemDel, { ...params, onClose: () => setModal('') }));
  };

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell size="small">{item}</TableCell>
            <TableCell size="small" align="center">
              Ativo
            </TableCell>
            {!na && (
              <TableCell size="small" align="right" width={10}>
                <DefaultAction small label="Adicionar" onClick={() => setModal('create')} />
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        {dados?.length === 0 ? (
          <TableSearchNotFound height={150} message="Nenhum item relacionado..." />
        ) : (
          <TableBody>
            {dados?.map((row, index) => (
              <TableRow hover key={`relacionado_${index}`}>
                <TableCell>
                  {row?.segmento || row?.componente || row?.finalidade || row?.designacao || noDados()}
                </TableCell>
                <CellChecked check={row?.ativo} />
                {!na && (
                  <TableCell>
                    <DefaultAction small label="ELIMINAR" onClick={() => setModal(row?.id)} disabled={!row?.ativo} />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>

      {modal === 'create' && item === 'Segmento' && <SegmentosForm onClose={() => setModal('')} id={id} />}
      {modal === 'create' && item === 'Componente' && <ComponetesForm onClose={() => setModal('')} id={id} />}
      {modal === 'create' && item === 'Finalidade' && <FinalidadesForm onClose={() => setModal('')} id={id} />}
      {!!modal && modal !== 'create' && (
        <DialogConfirmar
          isSaving={isSaving}
          desc="eliminar este item"
          onClose={() => setModal('')}
          handleOk={() => eliminarItem()}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function RelacionadosCl({ dados = [], item = 'Tipo de titular' }) {
  const dispatch = useDispatch();

  return (
    <Card sx={{ p: 1 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{item}</TableCell>
              {item === 'Condição' ? (
                <>
                  <TableCell>Componente</TableCell>
                  <TableCell>Conteúdo</TableCell>
                </>
              ) : (
                <TableCell align="center">Ativo</TableCell>
              )}
              <TableCell width={10}> </TableCell>
            </TableRow>
          </TableHead>
          {dados?.length === 0 ? (
            <TableSearchNotFound height={150} message="Não foi encontrado nenhum item..." />
          ) : (
            <TableBody>
              {dados?.map(({ id, ativo = false, ...res }, index) => (
                <TableRow hover key={`relacionado_${index}`}>
                  {item === 'Condição' ? (
                    <>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        <Typography variant="subtitle2">
                          {(res?.com_nip && 'Com NIP') ||
                            (res?.com_seguro && 'Com seguro') ||
                            (res?.isencao_comissao && 'Isenção de comissão') ||
                            (res?.habitacao_propria_1 && '1ª habitação própria') ||
                            (res?.taxa_juros_negociado && 'Taxa juros negociada') ||
                            (res?.isento_imposto_selo && 'Isento de imposto selo') ||
                            (res?.com_prazo_utilizacao && 'Com prazo de utilização')}
                        </Typography>
                        {res?.prazo_maior_que != null && res?.prazo_menor_que != null && (
                          <Typography variant="subtitle2" noWrap>
                            Prazo: <br />
                            {fNumber(res?.prazo_maior_que)} - {fNumber(res?.prazo_menor_que)}
                          </Typography>
                        )}
                        {res?.montante_maior_que != null && res?.montante_menor_que != null && (
                          <>
                            <Typography variant="subtitle2">Montante:</Typography>
                            <Typography variant="subtitle2" noWrap>
                              {fNumber(res?.montante_maior_que)} - {fNumber(res?.montante_menor_que)}
                            </Typography>
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        {res?.conteudo_principal && 'Conteúdo principal'}
                        {res?.alinea && (
                          <>
                            Número: <b>{res?.alinea?.numero_ordem}</b>
                          </>
                        )}
                        {res?.sub_alinea && (
                          <>
                            Número: <b>{res?.numero_ordem}</b> <br />
                            Alínea: <b>{numeroParaLetra(res?.sub_alinea?.numero_ordem)}</b>
                          </>
                        )}
                      </TableCell>
                      <TableCell sx={{ minWidth: 400 }}>
                        {res?.conteudo_principal && newLineText(res?.conteudo_principal)}
                        {res?.alinea && <NumerosClausula dados={[res?.alinea]} condicional />}
                        {res?.sub_alinea && (
                          <NumerosClausula condicional dados={[{ sub_alineas: [res?.sub_alinea] }]} />
                        )}
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>
                        {res?.segmento || labelTitular(res?.tipo_titular, res?.consumidor) || noDados()}
                      </TableCell>
                      <CellChecked check={item === 'Condição' || ativo} />
                    </>
                  )}
                  <TableCell>
                    <DefaultAction
                      small
                      label="ELIMINAR"
                      disabled={item !== 'Condição' && !ativo}
                      onClick={() => dispatch(setModal({ item: `eliminar-${item}`, dados: id }))}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </TableContainer>
    </Card>
  );
}
