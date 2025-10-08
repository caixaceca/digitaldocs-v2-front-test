import { useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TableBody from '@mui/material/TableBody';
import DialogContent from '@mui/material/DialogContent';
// utils
import { useSelector } from '../../../redux/store';
import { ptDateTime } from '../../../utils/formatTime';
import { fCurrency } from '../../../utils/formatNumber';
// components
import { SearchNotFoundSmall } from '../../../components/table';
import { DialogTitleAlt } from '../../../components/CustomDialog';
import { TabsWrapperSimple } from '../../../components/TabsWrapper';
//
import SegurosEntidades from './seguros-entidades';
import MetadadosGarantia from '../../processo/info-credito/metadados-garantia';
import { TableRowItem, LabelSN, Resgisto } from '../../parametrizacao/Detalhes';

// ---------------------------------------------------------------------------------------------------------------------

export default function DetalhesCredito({ onClose, id, item }) {
  const { credito, selectedItem } = useSelector((state) => state.gaji9);
  const dados =
    item === 'garantia' ? credito?.garantias?.find(({ id }) => id === Number(selectedItem?.id)) : selectedItem;

  return (
    <Dialog open fullWidth onClose={onClose} maxWidth={item === 'garantia' ? 'md' : 'sm'}>
      {item === 'garantia' ? (
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
        component: <MetadadosGarantia dados={dados?.metadados} />,
      },
    ]) ||
      []),
  ];

  return (
    <>
      <DialogTitleAlt
        onClose={onClose}
        title="Detalhes da garantia"
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

          {dados && 'ativo' in dados && <TableRowItem title="Ativo:" item={<LabelSN item={dados?.ativo} />} />}
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
