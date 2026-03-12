// @mui
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
//
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
// utils
import { useSelector } from '@/redux/store';
import { fNumber } from '@/utils/formatNumber';
import { useTabsSync } from '@/hooks/minimal-hooks/use-tabs-sync';
import { PARAMS_NUMERICOS, PARAMS_BOOLEANOS } from '../forms/precario-utils';
//
import { DetalhesContent } from '.';
import { noDados } from '@/components/Panel';
import { SearchNotFoundSmall } from '@/components/table';
import { TabsWrapperSimple } from '@/components/TabsWrapper';

// ---------------------------------------------------------------------------------------------------------------------

export default function DetalhesPrecario({ dados }) {
  const tabsList = [
    { value: 'Condições', component: <DetalhesContent dados={dados} item="precario" /> },
    { value: 'Parâmetros', component: <Parametros dados={dados} /> },
  ];

  const [tab, setTab] = useTabsSync(tabsList, 'Info', '');

  return (
    <>
      <TabsWrapperSimple tabsList={tabsList} tab={tab} sx={{ mt: 2, mb: 1, boxShadow: 'none' }} setTab={setTab} />
      {tabsList?.find(({ value }) => value === tab)?.component}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Parametros() {
  const { selectedItem } = useSelector((state) => state.parametrizacao);
  const item = selectedItem;
  if (!item) return null;

  const precario = item?.precario ?? {};
  const paramsAtivos = PARAMS_NUMERICOS.filter((p) => precario[p.id]);

  return (
    <Stack spacing={3}>
      {paramsAtivos.length > 0 ? (
        <Grid container spacing={3} sx={{ pt: 2 }}>
          {paramsAtivos.map((p) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p.id}>
              <ParamCard label={p.label} tipo={p.tipo} data={precario[p.id]} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <SearchNotFoundSmall message="Nenhum parâmetro definido..." />
      )}
    </Stack>
  );
}

function ParamCard({ label, tipo, data }) {
  const hasRange = data?.min || data?.max;

  return (
    <Paper variant="outlined" sx={{ p: 1.5, height: '100%', borderRadius: 1.5, borderColor: 'divider' }}>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            {label}
          </Typography>
          {data?.obrigatorio && <Chip size="small" variant="outlined" color="warning" label="Obrigatório" />}
        </Stack>

        <Stack spacing={0.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography variant="caption" color="text.secondary">
              Padrão
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {data?.default ? `${fNumber(data?.default, 2)} ${tipo}` : noDados('(Não definido...)')}
            </Typography>
          </Stack>

          {hasRange && (
            <Stack
              spacing={1}
              direction="row"
              sx={{ pt: 0.5, mt: 0.25, borderTop: '1px dashed', borderColor: 'divider' }}
            >
              <Stack sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Mínimo
                </Typography>
                <Typography variant="caption">
                  {data?.min ? `${fNumber(data?.min, 2)} ${tipo}` : noDados('(Não definido...)')}
                </Typography>
              </Stack>
              <Stack sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Máximo
                </Typography>
                <Typography variant="caption">
                  {data?.max ? `${fNumber(data?.max, 2)} ${tipo}` : noDados('(Não definido...)')}
                </Typography>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Condicoes({ precario }) {
  const ativos = PARAMS_BOOLEANOS.filter(({ id }) => precario?.[id]?.default);

  if (!ativos.length) return noDados('(Sem condições especiais...)');

  return (
    <Stack useFlexGap flexWrap="wrap" direction="row" spacing={1}>
      {ativos.map(({ id, label }) => (
        <Chip key={id} size="small" label={label} color="success" icon={<CheckCircleOutlineIcon />} />
      ))}
    </Stack>
  );
}
