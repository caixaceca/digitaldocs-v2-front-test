// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import TableBody from '@mui/material/TableBody';
import DialogContent from '@mui/material/DialogContent';
// utils
import { useSelector } from '@/redux/store';
import { colorLabel } from '@/utils/getColorPresets';
import { sortPermissoes } from '@/utils/formatObject';
import { ptDate, ptDateTime } from '@/utils/formatTime';
import { useTabsSync } from '@/hooks/minimal-hooks/use-tabs-sync';
// components
import Label from '@/components/Label';
import { SearchNotFoundSmall } from '@/components/table';
import { DialogTitleAlt } from '@/components/CustomDialog';
import { TabsWrapperSimple } from '@/components/TabsWrapper';
//
import { TableRowItem, LabelSN, Resgisto } from '../parametrizacao/Detalhes';
import { GrupoDetail, BalcoesRepresentante, SubtiposGarantias } from './sub-items';
import { OpcoesClausula, NumerosClausula, Relacionados } from './clausulas/opcoes-clausulas';

// ---------------------------------------------------------------------------------------------------------------------

export default function DetalhesGaji9({ closeModal, item, opcao = false }) {
  const { selectedItem, clausulaOpcional } = useSelector((state) => state.gaji9);
  const hasTabs =
    item === 'clausulas' || item === 'clausulaMinuta' || item === 'representantes' || item === 'tiposGarantias';

  return (
    <Dialog open fullWidth onClose={closeModal} maxWidth={item === 'grupos' || hasTabs ? 'md' : 'sm'}>
      <DialogTitleAlt title="Detalhes" onClose={closeModal} />
      <DialogContent>
        {(opcao && <DetalhesTab item={item} dados={clausulaOpcional} />) ||
          (item === 'grupos' && <GrupoDetail dados={selectedItem} />) ||
          ((hasTabs || item === 'funcoes' || item === 'segmentos' || item === 'finalidades') && (
            <DetalhesTab item={item} dados={selectedItem} />
          )) || <DetalhesContent dados={selectedItem} item={item} />}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function DetalhesTab({ item, dados }) {
  const tabsList = [
    { value: 'Info', component: <DetalhesContent dados={dados} item={item} /> },
    ...((item === 'segmentos' && [
      {
        value: 'Componentes',
        component: <Relacionados item="Componente" id={dados?.id} dados={dados?.componentes} />,
      },
      {
        value: 'Finalidades',
        component: <Relacionados item="Finalidade" id={dados?.id} dados={dados?.finalidades} />,
      },
    ]) ||
      (item === 'finalidades' && [
        { value: 'Segmentos', component: <Relacionados item="Segmento" na id={dados?.id} dados={dados?.segmentos} /> },
      ]) ||
      (item === 'tiposGarantias' && [
        { value: 'Subtipos', component: <SubtiposGarantias id={dados?.id} dados={dados?.subtipos} /> },
      ]) ||
      (item === 'representantes' && [
        { value: 'Balcões', component: <BalcoesRepresentante id={dados?.id} dados={dados?.balcoes} /> },
      ]) ||
      (item === 'clausulaMinuta' && [
        { value: 'Números', component: <NumerosClausula dados={dados?.alineas} minuta /> },
        { value: 'Cláusulas opcionais', component: <OpcoesClausula /> },
      ]) ||
      (item === 'funcoes' && [
        { value: 'Grupos', component: <UtilizadorInfo dados={dados?.grupos?.map(({ designacao }) => designacao)} /> },
        { value: 'Permissões', component: <UtilizadorInfo dados={dados?.acessos} /> },
      ]) ||
      []),
  ];

  const [tab, setTab] = useTabsSync(tabsList, 'Info');

  return (
    <>
      <TabsWrapperSimple tabsList={tabsList} tab={tab} sx={{ my: 2, boxShadow: 'none' }} setTab={setTab} />
      <Box>{tabsList?.find(({ value }) => value === tab)?.component}</Box>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------------------------------------------------

export function DetalhesContent({ dados = null, item = '' }) {
  const { isLoading } = useSelector((state) => state.gaji9);
  const cor = (dados?.revogado && 'error') || (dados?.em_vigor && 'success') || (dados?.em_analise && 'warning');
  const est = (dados?.em_vigor && 'Em vigor') || (dados?.revogado && 'Revogado') || (dados?.em_analise && 'Em análise');

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
              <Table size="small" sx={{ my: 1 }}>
                <TableBody>
                  <TableRowItem title="ID:" text={dados?.id} />
                  <TableRowItem title="Utilizador ID:" text={dados?.utilizador_id} />
                  <TableRowItem title="Versão:" text={dados?.versao} />
                  <TableRowItem title="Código:" text={dados?.codigo} />
                  <TableRowItem title="Situação:" text={dados?.situacao} />
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
                      text={`${dados?.numero_ordem}${
                        dados?.descritivo_numero_ordem ? ` (${dados?.descritivo_numero_ordem})` : ''
                      }`}
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
                  <TableRowItem title="Tipo de titular:" text={dados?.tipo_titular} id={dados?.tipo_titular_id} />
                  <TableRowItem title="Tipo de garantia:" text={dados?.tipo_garantia} id={dados?.tipo_garantia_id} />
                  <TableRowItem
                    title="Subtipo da garantia:"
                    text={dados?.subtipo_garantia}
                    id={dados?.subtipo_garantia_id}
                  />
                  <TableRowItem title="Segmento:" text={dados?.segmento} id={dados?.segmento_id} />
                  <TableRowItem title="Componente:" text={dados?.componente} id={dados?.componente_id} />
                  <TableRowItem title="Conteúdo:" text={dados?.conteudo} />
                  <TableRowItem title="Data emissão:" text={ptDate(dados?.data_emissao)} />
                  <TableRowItem title="Validade:" text={ptDate(dados?.valido_ate)} />
                  <TableRowItem title="Data início:" text={ptDateTime(dados?.data_inicio)} />
                  <TableRowItem title="Data emissão:" text={ptDateTime(dados?.data_termino)} />
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
                  {dados && 'consumidor' in dados && (
                    <TableRowItem title="Consumidor:" item={<LabelSN item={dados?.consumidor} />} />
                  )}
                  {dados && 'instituicao' in dados && (
                    <TableRowItem title="Intituição:" item={<LabelSN item={dados?.instituicao} />} />
                  )}
                  <TableRowItem title="Entrada em vigor:" text={ptDateTime(dados?.data_vigor)} />
                  <TableRowItem title="Publicado por:" text={dados?.cc_vigor} />
                  <TableRowItem title="Data de revogação:" text={ptDateTime(dados?.data_revogado)} />
                  <TableRowItem title="Revogado por:" text={dados?.cc_revogado} />
                  <TableRowItem title="Observação:" text={dados?.nota} />
                  {dados && 'reais' in dados && (
                    <TableRowItem
                      title="Tipo:"
                      text={<Label color="default">{dados?.reais ? 'Real' : 'Pessoal'}</Label>}
                    />
                  )}
                  {dados && 'ativo' in dados && <TableRowItem title="Ativo:" item={<LabelSN item={dados?.ativo} />} />}
                  <TableRowItem title="Observação:" text={dados?.obs || dados?.observacao} />
                </TableBody>
              </Table>
              <Stack>
                <Divider sx={{ my: 1 }} />
                <Stack useFlexGap flexWrap="wrap" direction="row" spacing={3} justifyContent="center">
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
                </Stack>
              </Stack>
            </>
          ) : (
            <SearchNotFoundSmall message="Item não disponível..." />
          )}
        </>
      )}
    </>
  );
}
