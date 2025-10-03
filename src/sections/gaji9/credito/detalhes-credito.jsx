import { useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TableBody from '@mui/material/TableBody';
import DialogContent from '@mui/material/DialogContent';
// utils
import { fCurrency } from '../../../utils/formatNumber';
import { ptDate, ptDateTime } from '../../../utils/formatTime';
// redux
import { useSelector } from '../../../redux/store';
// components
import { SearchNotFoundSmall } from '../../../components/table';
import { DialogTitleAlt } from '../../../components/CustomDialog';
import { TabsWrapperSimple } from '../../../components/TabsWrapper';
//
import SegurosEntidades from './seguros-entidades';
import { TableRowItem, LabelSN, Resgisto } from '../../parametrizacao/Detalhes';

// ---------------------------------------------------------------------------------------------------------------------

export default function DetalhesCredito({ onClose, id, item }) {
  const { credito, selectedItem } = useSelector((state) => state.gaji9);
  const hasTabs = item === 'garantia';
  const dados =
    item === 'garantia' ? credito?.garantias?.find(({ id }) => id === Number(selectedItem?.id)) : selectedItem;

  return (
    <Dialog open fullWidth onClose={onClose} maxWidth={item === 'grupos' || hasTabs ? 'md' : 'sm'}>
      {hasTabs ? (
        <DetalhesTab id={id} item={item} dados={dados} onClose={onClose} participantes={credito?.participantes} />
      ) : (
        <>
          <DialogTitleAlt title="Detalhes" onClose={onClose} />
          <DialogContent>
            <DetalhesContent dados={dados} id={id} item={item} />
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function DetalhesTab({ id, item, dados, participantes = [], onClose }) {
  const [currentTab, setCurrentTab] = useState('Info');

  const tabsList = [
    { value: 'Info', component: <DetalhesContent dados={dados} item={item} id={id} /> },
    ...((item === 'garantia' && [
      ...(dados?.reais
        ? [
            {
              value: 'Entidades',
              component: (
                <SegurosEntidades
                  creditoId={id}
                  ativo={dados?.ativo}
                  garantiaId={dados?.id}
                  dados={participantes?.filter((row) => row?.dono_garantia && row?.garantia_id === dados?.id)}
                />
              ),
            },
          ]
        : []),
      {
        value: 'Seguros',
        component: (
          <SegurosEntidades ativo={dados?.ativo} garantiaId={dados?.id} creditoId={id} dados={dados?.seguros} seguros />
        ),
      },
      {
        value: 'Metadados',
        component: <DetalhesContent item="metadados-garantia" dados={dados?.metadados} id={id} />,
      },
    ]) ||
      []),
  ];

  return (
    <>
      <DialogTitleAlt
        title="Detalhes"
        onClose={onClose}
        content={
          <TabsWrapperSimple
            tabsList={tabsList}
            currentTab={currentTab}
            sx={{ mt: 1.5, mb: 2, boxShadow: 'none' }}
            changeTab={(_, newValue) => setCurrentTab(newValue)}
          />
        }
      />
      <DialogContent>{tabsList?.find(({ value }) => value === currentTab)?.component}</DialogContent>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function DetalhesContent({ dados = null, item }) {
  return dados ? (
    <>
      <Table size="small" sx={{ my: 1 }}>
        <TableBody>
          {/* META DADOS - Garantia */}
          {item === 'metadados-garantia' && (
            <>
              <TableRowItem title="Conta DO:" text={dados?.conta_dp} />
              <TableRowItem title="Saldo DP:" text={dados?.saldo_dp ? fCurrency(dados?.saldo_dp) : ''} />
              <TableRowItem title="Balcão DP:" text={dados?.balca_dp} />
              <TableRowItem title="Data vencimento DP:" text={ptDate(dados?.data_vencimento_dp)} />
              <TableRowItem title="Data constituição DP:" text={ptDate(dados?.data_constituicao_dp)} />
              <TableRowItem title="Título:" text={dados?.titulo} />
              <TableRowItem title="Total título:" text={dados?.total_titulo ? fCurrency(dados?.total_titulo) : ''} />
              <TableRowItem title="Instituição emissora:" text={dados?.instituicao_emissora_titulo} />
              <TableRowItem title="Instituição registo:" text={dados?.instituicao_registo_titulo} />
              <TableRowItem title="Cliente registo:" text={dados?.cliente_registo_titulo} />
              <TableRowItem title="Conservatória:" text={dados?.conservatoria} />
              <TableRowItem title="Identificação fração:" text={dados?.identificacao_fracao} />
              <TableRowItem title="Tipo matriz:" text={dados?.tipo_matriz} />
              <TableRowItem title="Nº matriz predial:" text={dados?.num_matriz_predial} />
              <TableRowItem title="Nº registo predial:" text={dados?.num_registo_predial} />
              <TableRowItem title="Nº descrição predial:" text={dados?.num_descricao_predial} />
              <TableRowItem title="Tipo de imóvel:" text={dados?.tipo_imovel} />
              <TableRowItem title="Ilha:" text={dados?.ilha} />
              <TableRowItem title="Freguesia:" text={dados?.freguesia} />
              <TableRowItem title="Concelho:" text={dados?.concelho} />
              <TableRowItem title="Cidade:" text={dados?.cidade} />
              <TableRowItem title="Zona:" text={dados?.zona} />
              <TableRowItem title="Área do terreno:" text={dados?.area_terreno ? `${dados?.area_terreno} m²` : ''} />
              <TableRowItem title="Piso:" text={dados?.piso} />
              <TableRowItem title="Marca da viatura:" text={dados?.marca_viatura} />
              <TableRowItem title="Modelo da viatura:" text={dados?.modelo_viatura} />
              <TableRowItem title="Matrícula da viatura:" text={dados?.matricula_viatura} />
              <TableRowItem title="Nura da viatura:" text={dados?.nura_viatura} />
              <TableRowItem title="Ano de fabricação:" text={dados?.ano_fabrico} />
            </>
          )}

          {/* CONTRATO */}
          {item === 'contrato' && (
            <>
              <TableRowItem title="Versão:" text={dados?.versao} />
              <TableRowItem title="Código:" text={dados?.codigo} />
              <TableRowItem title="Representante:" text={dados?.representante} />
              <TableRowItem title="Data entrega:" text={ptDateTime(dados?.data_entrega)} />
              <TableRowItem title="Data recebimento:" text={ptDateTime(dados?.data_recebido)} />
            </>
          )}

          {/* GARANTIAS */}
          {item === 'garantia' && (
            <>
              <TableRowItem title="Garantia:" text={dados?.tipo} />
              <TableRowItem title="Subtipo da garantia:" text={dados?.subtipo} />
              <TableRowItem title="Conta DP:" text={dados?.conta_dp} />
              <TableRowItem title="Valor:" text={fCurrency(dados?.valor)} />
            </>
          )}

          {'ativo' in dados && <TableRowItem title="Ativo:" item={<LabelSN item={dados?.ativo} />} />}
        </TableBody>
      </Table>
      <Stack>
        <Divider sx={{ my: 1 }} />
        <Stack useFlexGap flexWrap="wrap" direction="row" spacing={3} justifyContent="center">
          <Resgisto label="Criado" em={dados?.criado_em} por={dados?.criador || dados?.feito_por} />
          <Resgisto
            label="Modificado"
            por={dados?.modificador || dados?.modificado_por}
            em={dados?.modificado_em || dados?.ultima_modificacao}
          />
          <Resgisto label="Entrega" em={dados?.entrega_em} por={dados?.entrega_por} />
        </Stack>
      </Stack>
    </>
  ) : (
    <SearchNotFoundSmall message="Nenhuma informação disponível..." />
  );
}
