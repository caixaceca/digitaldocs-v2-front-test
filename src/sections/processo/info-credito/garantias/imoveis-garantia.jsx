// @mui
import { Stack, Typography, Box, Paper, Grid } from '@mui/material';
// utils
import { ptDate } from '../../../../utils/formatTime';
import { fNumber, fCurrency, fPercent } from '../../../../utils/formatNumber';
// components
import TableInfoGarantias from './table-info-garantias';
import { noDados } from '../../../../components/Panel';

// ---------------------------------------------------------------------------------------------------------------------

const LABEL_MAP = {
  contas: 'DP',
  predios: 'prédio',
  titulos: 'título',
  terrenos: 'terreno',
  veiculos: 'veículo',
  apartamentos: 'apartamento',
};

export default function ImoveisGarantia({ dados = [], item }) {
  if (!dados?.length) return null;

  return (
    <Stack spacing={3}>
      {item === 'livrancas' && <Livrancas dados={dados} />}
      {item !== 'livrancas' &&
        dados.map((row, index) => (
          <GarantiaLayout
            donos={row?.donos}
            seguros={row?.seguros}
            key={row?.id ?? `${item}_${index}`}
            donosTitle={`Dono(s) do ${LABEL_MAP[item] || 'item'}`}
          >
            {renderColumns(item, row)}
          </GarantiaLayout>
        ))}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function renderColumns(item, row) {
  const specs = {
    contas: {
      kpis: [
        ['Cobertura', fPercent(row?.percentagem_cobertura)],
        ['Valor', fCurrency(row?.valor)],
        ['Saldo', fCurrency(row?.saldo)],
      ],
      details: [
        ['Nº de conta', row?.numero_conta],
        ['Constituição', ptDate(row?.data_constituicao)],
        ['Início', ptDate(row?.data_inicio)],
        ['Vencimento', ptDate(row?.data_vencimento)],
        ['Prazo', row?.prazo ? `${row?.prazo} dias` : ''],
        ['Balcão', row?.balcao],
      ],
    },
    veiculos: {
      kpis: [
        ['Cobertura', fPercent(row?.percentagem_cobertura)],
        ['Valor', fCurrency(row?.valor)],
        ['Valor PVT', fCurrency(row?.valor_pvt)],
      ],
      details: [
        ['Marca', row?.marca],
        ['Modelo', row?.modelo],
        ['Matrícula', row?.matricula],
        ['NURA', row?.nura],
        ['Ano fabricação', row?.ano_fabrico],
      ],
    },
    imoveis: {
      kpis: [
        ['Cobertura', fPercent(row?.percentagem_cobertura)],
        ['Valor', fCurrency(row?.valor)],
        ['Valor PVT', fCurrency(row?.valor_pvt)],
      ],
      details: [
        ['Área', row?.area],
        ['Tipo de matriz', row?.tipo_matriz],
        ['Matriz predial', row?.matriz_predial],
        ['Nº de matriz', row?.numero_matriz],
        ['Nº de descrição predial', row?.numero_descricao_predial],
        ['NIP', row?.nip],
        ['Nº de andar', row?.numero_andar],
        ['Identificação fração', row?.identificacao_fracao],
      ],
      address: [
        ['Ilha', row?.morada?.ilha],
        ['Concelho', row?.morada?.concelho],
        ['Freguesia', row?.morada?.freguesia],
        ['Zona', row?.morada?.zona],
        ['Rua', row?.morada?.rua || undefined],
        ['Nº de porta', row?.morada?.numero_porta || undefined],
        ['Descritivo', row?.morada?.descritivo || undefined],
      ],
    },
    titulos: {
      kpis: [
        ['Cobertura', fPercent(row?.percentagem_cobertura)],
        ['Valor', fCurrency(row?.valor)],
        ['Valor do título', fCurrency(row?.valor_titulo)],
      ],
      details: [
        ['Nº de títulos', fNumber(row?.numero_titulos)],
        ['Tipo de título', row?.tipo_titulo],
        ['Entidade emissora', row?.nome_entidade_emissora],
        ['Entidade registadora', row?.nome_instituicao_registo],
        ['Cliente', row?.numero_cliente],
      ],
    },
  };

  const isImovel = ['terrenos', 'predios', 'apartamentos'].includes(item);
  const current = isImovel ? specs.imoveis : specs[item];

  if (!current) return null;

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Stack spacing={1.5}>
          {current.kpis.map(([label, value]) =>
            label && value ? (
              <Box key={label}>
                <Typography variant="overline" sx={{ color: 'text.disabled', display: 'block' }}>
                  {label}
                </Typography>
                <Typography variant="subtitle1" color={label === 'Cobertura' ? 'primary.main' : 'text.primary'}>
                  {value || '—'}
                </Typography>
              </Box>
            ) : null
          )}
        </Stack>
      </Grid>

      <Grid item xs={12} md={isImovel ? 6 : 12}>
        <Typography variant="overline" sx={{ color: 'text.secondary', mb: 1.5, display: 'block' }}>
          Informações Técnicas
        </Typography>
        <Box display="grid" gap={1}>
          {current.details.map(([label, value]) => (
            <Item key={label} title={label} value={value} />
          ))}
        </Box>
      </Grid>

      {isImovel && (
        <Grid item xs={12} md={6}>
          <Typography variant="overline" sx={{ color: 'text.secondary', mb: 1.5, display: 'block' }}>
            Localização
          </Typography>
          <Box display="grid" gridTemplateColumns="1fr" gap={1}>
            {current.address.map(([label, value]) => (
              <Item key={label} title={label} value={value} />
            ))}
          </Box>
        </Grid>
      )}
    </Grid>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function GarantiaLayout({ children, donos, seguros, donosTitle }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 1.5,
        position: 'relative',
        transition: 'all 0.3s',
        '&:hover': { boxShadow: (theme) => theme.customShadows.z12 },
      }}
    >
      <Stack spacing={3}>
        {children}

        {donos?.length > 0 && (
          <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
            <Donos dados={donos} title={donosTitle} />
          </Box>
        )}
        {seguros?.length > 0 && <TableInfoGarantias dados={seguros} item="seguros" />}
      </Stack>
    </Paper>
  );
}

function Item({ title, value }) {
  const hasValue = value !== null && value !== undefined && value !== '';
  if (value === undefined) return null;

  return (
    <Stack direction="row" spacing={1} alignItems="flex-end">
      <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
        {title}:
      </Typography>
      {hasValue ? <Typography variant="body2">{value}</Typography> : noDados('(Não defenido...)')}
    </Stack>
  );
}

function Livrancas({ dados }) {
  return (
    <Paper sx={{ p: 2, bgcolor: 'background.neutral' }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Número(s) de livrança(s)
      </Typography>
      <Stack direction="row" flexWrap="wrap" spacing={1.5}>
        {dados.map((row, index) => (
          <Box
            key={row?.numero_livranca ?? index}
            sx={{ px: 1.5, py: 0.5, bgcolor: 'background.paper', borderRadius: 1 }}
          >
            <Typography variant="subtitle2">{row?.numero_livranca}</Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

function Donos({ title, dados }) {
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
        {title}
      </Typography>
      {dados.map((row, index) => (
        <Stack key={row?.numero || row?.numero_entidade || index} direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
          <Typography variant="body2">
            <Box component="span" sx={{ fontWeight: 'bold' }}>
              {row?.numero || row?.numero_entidade || '—'}
            </Box>
            {' - '}
            {row?.nome || row?.nome_entidade || '—'}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
