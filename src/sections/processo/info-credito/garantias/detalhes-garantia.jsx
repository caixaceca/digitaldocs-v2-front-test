// @mui
import List from '@mui/material/List';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TableBody from '@mui/material/TableBody';
import DialogContent from '@mui/material/DialogContent';
// utils
import { fCurrency, fPercent } from '@/utils/formatNumber';
import { useTabsSync } from '@/hooks/minimal-hooks/use-tabs-sync';
// components
import { noDados } from '@/components/Panel';
import Label, { LabelSN } from '@/components/Label';
import { SearchNotFoundSmall } from '@/components/table';
import { DialogTitleAlt } from '@/components/CustomDialog';
import { TabsWrapperSimple } from '@/components/TabsWrapper';
//
import ImoveisGarantia from './imoveis-garantia';
import TableInfoGarantias from './table-info-garantias';
import { Resgisto, TableRowItem } from '../../../parametrizacao/Detalhes';

// ---------------------------------------------------------------------------------------------------------------------

export default function DetalhesGarantia({ dados, onClose }) {
  const {
    contas = [],
    seguros = [],
    titulos = [],
    imoveis = [],
    fiadores = [],
    livrancas = [],
  } = dados?.metadados || {};

  const tabsList = [
    { value: 'Info', component: <InfoGarantia dados={dados} info /> },
    ...(fiadores?.length > 0
      ? [{ value: 'Fiadores', component: <TableInfoGarantias item="fiadores" dados={fiadores ?? []} /> }]
      : []),
    ...(livrancas?.length > 0
      ? [{ value: 'Livranças', component: <ImoveisGarantia item="livrancas" dados={livrancas ?? []} /> }]
      : []),
    ...(seguros?.length > 0
      ? [{ value: 'Seguros', component: <TableInfoGarantias item="seguros" dados={seguros ?? []} garantia /> }]
      : []),
    ...(contas?.length > 0
      ? [{ value: 'Contas DP', component: <ImoveisGarantia item="contas" dados={contas ?? []} /> }]
      : []),
    ...(titulos?.length > 0
      ? [{ value: 'Títulos', component: <ImoveisGarantia item="titulos" dados={titulos ?? []} /> }]
      : []),
    ...(imoveis?.veiculos?.length > 0
      ? [{ value: 'Veículos', component: <ImoveisGarantia item="veiculos" dados={imoveis?.veiculos ?? []} /> }]
      : []),
    ...(imoveis?.terrenos?.length > 0
      ? [{ value: 'Terrenos', component: <ImoveisGarantia item="terrenos" dados={imoveis?.terrenos ?? []} /> }]
      : []),
    ...(imoveis?.apartamentos?.length > 0
      ? [
          {
            value: 'Apartamentos',
            component: <ImoveisGarantia item="apartamentos" dados={imoveis?.apartamentos ?? []} />,
          },
        ]
      : []),
    ...(imoveis?.predios?.length > 0
      ? [{ value: 'Prédios', component: <ImoveisGarantia item="predios" dados={imoveis?.predios ?? []} /> }]
      : []),
  ];

  const [tab, setTab] = useTabsSync(tabsList, 'Info', '');

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitleAlt
        onClose={onClose}
        title="Detalhes da garantia"
        content={
          <TabsWrapperSimple tabsList={tabsList} tab={tab} sx={{ mt: 1.5, mb: 2, boxShadow: 'none' }} setTab={setTab} />
        }
      />
      <DialogContent>{tabsList?.find(({ value }) => value === tab)?.component}</DialogContent>
    </Dialog>
  );
}

function InfoGarantia({ dados, info = false }) {
  return (
    <List sx={{ width: 1 }}>
      {dados ? (
        <>
          <Table size="small">
            <TableBody>
              <TableRowItem title="Garantia:" text={dados?.tipo_garantia} />
              <TableRowItem title="Subtipo:" text={dados?.subtipo_garantia} />
              <TableRowItem title="Tipo:" item={<Label color="default">{dados?.reais ? 'Real' : 'Pessoal'}</Label>} />
              <TableRowItem
                title="Cobertura:"
                text={fPercent(dados?.percentagem_cobertura) || noDados('(Não definido...)')}
              />
              <TableRowItem title="Valor:" text={fCurrency(dados?.valor_garantia)} />
              <TableRowItem title="Ativo:" item={<LabelSN val={dados?.ativo} />} />
            </TableBody>
          </Table>
          {info && (
            <Stack>
              <Divider sx={{ my: 1 }} />
              <Stack useFlexGap flexWrap="wrap" direction="row" spacing={3} justifyContent="center">
                <Resgisto label="Criado" em={dados?.criado_em} por={dados?.criador} />
                <Resgisto label="Modificado" em={dados?.modificado_em} por={dados?.modificador} />
              </Stack>
            </Stack>
          )}
        </>
      ) : (
        <SearchNotFoundSmall message="Nenhuma informação disponível..." />
      )}
    </List>
  );
}
