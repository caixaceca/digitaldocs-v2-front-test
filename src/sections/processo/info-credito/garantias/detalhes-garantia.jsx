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
import { chaveMetaGarantia } from '../../form/credito/garantias/form-garantias-credito';
// components
import { noDados } from '@/components/Panel';
import Label, { LabelSN } from '@/components/Label';
import { SearchNotFoundSmall } from '@/components/table';
import { DialogTitleAlt } from '@/components/CustomDialog';
import { TabsWrapperSimple } from '@/components/TabsWrapper';
//
import Entidades from './entidades';
import TableSeguros from './table-seguros';
import { Livranca } from './imoveis-garantia';
import ImoveisGarantia from './imoveis-garantia';
import { Resgisto, TableRowItem } from '../../../parametrizacao/details';

// ---------------------------------------------------------------------------------------------------------------------

export default function DetalhesGarantia({ dados, onClose, openForm = null }) {
  const id = dados?.id;
  const { garantidores = [], bem = null, numero_livranca: livranca = '' } = dados?.metadados || {};

  const tabsList = [
    { value: 'Garantia', component: <InfoGarantia dados={dados} info /> },
    ...(livranca ? [{ value: 'Livrança', component: <Livranca livranca={livranca} donos={garantidores} /> }] : []),
    ...(garantidores?.length > 0 && !livranca
      ? [{ value: 'Fiador(es)', component: <Entidades showDetails dados={garantidores} /> }]
      : []),
    ...(bem?.tipo
      ? [
          {
            value: chaveMetaGarantia?.find(({ chave }) => chave === bem?.tipo)?.label || 'Bem',
            component: <ImoveisGarantia item={bem?.tipo} dados={bem} openForm={openForm} id={id} />,
          },
        ]
      : []),
    ...(bem?.seguros?.length > 0 ? [{ value: 'Seguros', component: <TableSeguros dados={bem?.seguros ?? []} /> }] : []),
  ];

  const [tab, setTab] = useTabsSync(tabsList, 'Garantia', '');

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

// ---------------------------------------------------------------------------------------------------------------------

export function DetalhesBemFinanciado({ dados, onClose }) {
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitleAlt onClose={onClose} title={`Detalhes do ${dados?.label} financiado`} />
      <DialogContent sx={{ mt: 3 }}>
        <ImoveisGarantia item={dados?.tipo} dados={dados} />
      </DialogContent>
    </Dialog>
  );
}
