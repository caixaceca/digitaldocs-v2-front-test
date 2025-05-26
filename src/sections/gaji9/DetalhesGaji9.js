import { useState } from 'react';
import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import Skeleton from '@mui/material/Skeleton';
import ListItem from '@mui/material/ListItem';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
// utils
import { newLineText } from '../../utils/formatText';
import { colorLabel } from '../../utils/getColorPresets';
import { ptDate, ptDateTime } from '../../utils/formatTime';
import { sortPermissoes } from '../../utils/formatObject';
// redux
import { updateItem } from '../../redux/slices/gaji9';
import { useSelector, useDispatch } from '../../redux/store';
// components
import Label from '../../components/Label';
import { SearchNotFoundSmall } from '../../components/table';
import { DialogTitleAlt } from '../../components/CustomDialog';
import { TabsWrapperSimple } from '../../components/TabsWrapper';
//
import OpcoesClausula from './opcoes-clausulas';
import GrupoDetail, { BalcoesRepresentante } from './detalhes-grupo';
import { TableRowItem, LabelSN, Resgisto } from '../parametrizacao/Detalhes';

// ----------------------------------------------------------------------

DetalhesGaji9.propTypes = { closeModal: PropTypes.func, item: PropTypes.string, opcao: PropTypes.bool };

export default function DetalhesGaji9({ closeModal, item, opcao = false }) {
  const { selectedItem, clausulaOpcional } = useSelector((state) => state.gaji9);

  return (
    <Dialog
      open
      fullWidth
      onClose={closeModal}
      maxWidth={
        item === 'grupos' || item === 'clausulas' || item === 'clausulaMinuta' || item === 'representantes'
          ? 'md'
          : 'sm'
      }
    >
      <DialogTitleAlt title="Detalhes" onClose={closeModal} />
      <DialogContent>
        {(opcao && <DetalhesTab item={item} dados={clausulaOpcional} />) ||
          (item === 'grupos' && <GrupoDetail dados={selectedItem} />) ||
          ((item === 'clausulas' || item === 'clausulaMinuta' || item === 'funcoes' || item === 'representantes') && (
            <DetalhesTab item={item} dados={selectedItem} />
          )) || <DetalhesContent dados={selectedItem} item={item} />}
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

DetalhesTab.propTypes = { item: PropTypes.string, dados: PropTypes.object };

function DetalhesTab({ item, dados }) {
  const [currentTab, setCurrentTab] = useState('Info');

  const tabsList = [
    { value: 'Info', component: <DetalhesContent dados={dados} item={item} /> },
    ...((item === 'clausulas' && [{ value: 'Números', component: <AlineasClausula dados={dados?.alineas} /> }]) ||
      (item === 'representantes' && [
        { value: 'Balcões', component: <BalcoesRepresentante id={dados?.id} dados={dados?.balcoes} /> },
      ]) ||
      (item === 'clausulaMinuta' && [
        { value: 'Números', component: <AlineasClausula dados={dados?.alineas} /> },
        { value: 'Cláusulas opcionais', component: <OpcoesClausula /> },
      ]) ||
      (item === 'funcoes' && [
        { value: 'Grupos', component: <UtilizadorInfo dados={dados?.grupos?.map(({ designacao }) => designacao)} /> },
        { value: 'Permissões', component: <UtilizadorInfo dados={dados?.acessos} /> },
      ]) ||
      []),
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

UtilizadorInfo.propTypes = { dados: PropTypes.array };

function UtilizadorInfo({ dados = [] }) {
  return (
    <Stack sx={{ px: 0.5, mt: 3 }}>
      {dados?.length === 0 ? (
        <SearchNotFoundSmall message="Nenhum número adicionado..." />
      ) : (
        <Stack useFlexGap flexWrap="wrap" justifyContent="center" direction="row" spacing={1.5} sx={{ pt: 1 }}>
          {sortPermissoes(dados)?.map((row, index) => (
            <Label color={colorLabel(row, 'default')} key={`${row}_${index}`}>
              {row}
            </Label>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

// ----------------------------------------------------------------------

AlineasClausula.propTypes = { dados: PropTypes.array };

function AlineasClausula({ dados = [] }) {
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

// ----------------------------------------------------------------------

DetalhesContent.propTypes = { dados: PropTypes.object, item: PropTypes.string };

export function DetalhesContent({ dados = null, item = '' }) {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.gaji9);
  const cor = (dados?.revogado && 'error') || (dados?.em_vigor && 'success') || (dados?.em_analise && 'warning');
  const est = (dados?.em_vigor && 'Em vigor') || (dados?.revogado && 'Revogado') || (dados?.em_analise && 'Em análise');

  const ativarDesativado = () => {
    const params = { msg: `Cláusula ${dados?.ativo ? 'desativado' : 'ativado'}`, getItem: 'clausula' };
    dispatch(updateItem('ativar clausula', null, params));
  };

  return (
    <>
      {!dados && isLoading ? (
        <Stack justifyContent="space-between" alignItems="center" spacing={3} sx={{ pt: 2 }}>
          <Skeleton variant="text" sx={{ height: 180, width: 1, transform: 'scale(1)' }} />
          <Skeleton variant="text" sx={{ height: 140, width: 1, transform: 'scale(1)' }} />
          <Skeleton variant="text" sx={{ height: 100, width: 1, transform: 'scale(1)' }} />
        </Stack>
      ) : (
        <>
          {dados ? (
            <>
              <List>
                <ListItem disableGutters divider sx={{ pb: 0 }}>
                  <Typography variant="subtitle1">Dados</Typography>
                </ListItem>
                <Table size="small">
                  <TableBody>
                    <TableRowItem title="ID:" text={dados?.id} />
                    <TableRowItem title="Utilizador ID:" text={dados?.utilizador_id} />
                    <TableRowItem title="Versão:" text={dados?.versao} />
                    {item === 'Minuta' && (
                      <TableRowItem
                        title="Estado:"
                        item={<Label color={cor || 'default'}>{est || 'Desconhecido'}</Label>}
                      />
                    )}
                    <TableRowItem
                      title="Secção:"
                      text={
                        (dados?.solta && 'Solta') ||
                        (dados?.seccao_identificacao && 'Secção de identificação') ||
                        (dados?.seccao_identificacao_caixa && 'Secção de identificação Caixa') ||
                        ''
                      }
                    />
                    <TableRowItem title="Nº entidade:" text={dados?.numero} />
                    <TableRowItem title="Sigla:" text={dados?.sigla} />
                    <TableRowItem title="Código:" text={dados?.codigo} />
                    <TableRowItem title="Nome:" text={dados?.nome} />
                    <TableRowItem title="Tipo:" text={dados?.tipo} />
                    <TableRowItem title="Designação:" text={dados?.designacao} />
                    <TableRowItem title="Descrição:" text={dados?.descricao} />
                    <TableRowItem title="Telefone:" text={dados?.telefone} />
                    <TableRowItem title="Email:" text={dados?.email || dados?.utilizador_email} />
                    <TableRowItem title="Capital social:" text={dados?.capital_social} />
                    <TableRowItem title="Balcão:" text={dados?.balcao} />
                    <TableRowItem title="Função:" text={dados?.funcao || dados?._role} />
                    <TableRowItem title="Atua como:" text={dados?.atua_como} />
                    <TableRowItem title="Estado civil:" text={dados?.estado_civil} />
                    <TableRowItem title="Documento:" text={dados?.documento} />
                    {dados?.descritivo && (
                      <TableRowItem
                        title="Descritivo:"
                        text={`${dados?.descritivo}${dados?.documento_tipo ? ` (${dados?.documento_tipo})` : ''}`}
                      />
                    )}
                    {dados?.numero_ordem > -1 && (
                      <TableRowItem
                        title="Nº de cláusula:"
                        text={`${dados?.numero_ordem}${dados?.descritivo_numero_ordem ? ` (${dados?.descritivo_numero_ordem})` : ''}`}
                      />
                    )}
                    <TableRowItem title="Doc. identificação:" text={dados?.cni} />
                    <TableRowItem title="Local emissão:" text={dados?.local_emissao || dados?.emissor} />
                    <TableRowItem title="Prefixo:" text={dados?.prefixo} />
                    <TableRowItem title="Sufixo:" text={dados?.sufixo} />
                    <TableRowItem title="Rótulo:" text={dados?.rotulo} />
                    <TableRowItem title="Minuta:" text={dados?.minuta} />
                    <TableRowItem title={item === 'clausulas' ? 'Epígrafe:' : 'Título:'} text={dados?.titulo} />
                    <TableRowItem title="Subtítulo:" text={dados?.subtitulo} />
                    <TableRowItem title="Representante:" text={dados?.representante} />
                    {dados?.data_entrega && (
                      <TableRowItem title="Data entrega:" text={ptDateTime(dados?.data_entrega)} />
                    )}
                    {dados?.data_recebido && (
                      <TableRowItem title="Data recebido:" text={ptDateTime(dados?.data_recebido)} />
                    )}
                    <TableRowItem title="Tipo titular:" text={dados?.tipo_titular} id={dados?.tipo_titular_id} />
                    <TableRowItem title="Tipo garantia:" text={dados?.tipo_garantia} id={dados?.tipo_garantia_id} />
                    <TableRowItem title="Componente:" text={dados?.componente} id={dados?.componente_id} />
                    <TableRowItem title="Conteúdo:" text={newLineText(dados?.conteudo)} />
                    {dados?.data_emissao && <TableRowItem title="Data emissão:" text={ptDate(dados?.data_emissao)} />}
                    {dados?.valido_ate && <TableRowItem title="Validade:" text={ptDate(dados?.valido_ate)} />}
                    {dados?.data_inicio && <TableRowItem title="Data início:" text={ptDateTime(dados?.data_inicio)} />}
                    {dados?.data_termino && (
                      <TableRowItem title="Data emissão:" text={ptDateTime(dados?.data_termino)} />
                    )}
                    <TableRowItem title="NIF:" text={dados?.nif} />
                    <TableRowItem title="Freguesia:" text={dados?.freguesia} />
                    <TableRowItem title="Freguesia na banca:" text={dados?.freguesia_banca} />
                    <TableRowItem title="Concelho:" text={dados?.concelho} />
                    <TableRowItem title="Naturalidade na banca:" text={dados?.naturalidade_banca} />
                    <TableRowItem title="Residência:" text={dados?.residencia} />
                    <TableRowItem title="Naturalidade:" text={dados?.naturalidade} />
                    <TableRowItem title="Ilha:" text={dados?.ilha} />
                    <TableRowItem title="Região:" text={dados?.regiao} />

                    <TableRowItem title="Nº matricula:" text={dados?.num_matricula} />
                    <TableRowItem title="Local matricula:" text={dados?.local_matricula} />
                    <TableRowItem title="Email:" text={dados?.morada_eletronico} />
                    <TableRowItem title="Endereço:" text={dados?.morada_sede} />
                    {'consumidor' in dados && (
                      <TableRowItem title="Consumidor:" item={<LabelSN item={dados?.consumidor} />} />
                    )}
                    {'instituicao' in dados && (
                      <TableRowItem title="Intituição:" item={<LabelSN item={dados?.instituicao} />} />
                    )}
                    {'condicional' in dados && (
                      <TableRowItem title="Condicional:" item={<LabelSN item={dados?.condicional} />} />
                    )}
                    <TableRowItem title="Entrada em vigor:" text={ptDateTime(dados?.data_vigor)} />
                    <TableRowItem title="Publicado por:" text={dados?.cc_vigor} />
                    <TableRowItem title="Data de revogação:" text={ptDateTime(dados?.data_revogado)} />
                    <TableRowItem title="Revogado por:" text={dados?.cc_revogado} />
                    {dados?.nota && <TableRowItem title="Observação:" text={newLineText(dados?.nota)} />}
                    {'ativo' in dados && (
                      <TableRowItem
                        title="Ativo:"
                        item={
                          item === 'clausulas' ? (
                            <FormControlLabel
                              label={dados?.ativo ? 'Sim' : 'Não'}
                              control={
                                <Switch checked={dados?.ativo} onClick={() => ativarDesativado()} size="small" />
                              }
                            />
                          ) : (
                            <LabelSN item={dados?.ativo} />
                          )
                        }
                      />
                    )}
                    <TableRowItem title="Observação:" text={dados?.obs || dados?.observacao} />
                  </TableBody>
                </Table>
              </List>
              {item !== 'componentes' && (
                <List>
                  <ListItem disableGutters divider sx={{ pb: 0.5 }}>
                    <Typography variant="subtitle1">Registo</Typography>
                  </ListItem>
                  <Stack useFlexGap flexWrap="wrap" direction="row" sx={{ pt: 1 }} spacing={2}>
                    <Resgisto
                      label={item === 'titulares' ? 'Carregado' : 'Criado'}
                      em={dados?.criado_em || dados?.carregado_em}
                      por={dados?.criador || dados?.criado_por || dados?.carregado_por}
                    />
                    <Resgisto
                      label={item === 'titulares' ? 'Recaregado' : 'Modificado'}
                      em={dados?.modificado_em || dados?.recarregado_em}
                      por={dados?.modificador || dados?.modificado_por || dados?.recarregado_por}
                    />
                    <Resgisto label="Entrega" em={dados?.entrega_em} por={dados?.entrega_por} />
                  </Stack>
                </List>
              )}
            </>
          ) : (
            <SearchNotFoundSmall message="Item não disponível..." />
          )}
        </>
      )}
    </>
  );
}
