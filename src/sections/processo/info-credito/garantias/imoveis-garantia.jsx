// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
// utils
import { ptDate } from '@/utils/formatTime';
import { useSelector } from '@/redux/store';
import { periodicidadesList } from '@/_mock';
import { fNumber, fCurrency } from '@/utils/formatNumber';
// components
import Label from '@/components/Label';
import GridItem from '@/components/GridItem';
import { noDados } from '@/components/Panel';
import { TipoSeguro } from './table-seguros';
import { DefaultAction } from '@/components/Actions';
//
import Entidades from './entidades';

// ---------------------------------------------------------------------------------------------------------------------

const LABEL_MAP = {
  dp: 'DP',
  predio: 'prédio',
  titulo: 'título',
  terreno: 'terreno',
  veiculo: 'veículo',
  apartamento: 'apartamento',
};

export default function ImoveisGarantia({ dados, id, openForm }) {
  const item = dados?.tipo;
  if (!dados) return null;

  return (
    <GarantiaLayout
      id={id}
      openForm={openForm}
      donos={dados?.donos}
      donosTitle={`Dono(s) do ${LABEL_MAP[item] || 'item'}`}
    >
      {renderColumns(item, dados)}
    </GarantiaLayout>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function renderColumns(item, dados) {
  const sec = item === 'seguro' ? <TipoSeguro tipoId={dados?.tipo_seguro_id} /> : '';
  const specs = {
    dp: {
      kpis: [
        ['Nº de conta', dados?.numero_conta, true],
        ['Saldo', `${fNumber(dados?.saldo)} ${dados?.moeda}`],
        ['Montante empenhado', dados?.montante_empenhado ? `${fNumber(dados.montante_empenhado)} ${dados?.moeda}` : ''],
      ],
      details: [
        ['Constituição', ptDate(dados?.data_constituicao)],
        ['Início', ptDate(dados?.data_inicio)],
        ['Vencimento', ptDate(dados?.data_vencimento)],
        ['Prazo', dados?.prazo ? `${dados?.prazo} dias` : ''],
        ['Balcão', dados?.balcao],
      ],
    },
    veiculo: {
      kpis: [
        ['Matrícula', dados?.matricula, true],
        ['Fatura proforma', dados?.numero_fatura_proforma, true],
        ['Valor', fCurrency(dados?.valor)],
        ['Valor avaliação', fCurrency(dados?.valor_avaliacao)],
      ],
      details: [
        ['Marca', dados?.marca],
        ['Modelo', dados?.modelo],
        ['NURA', dados?.nura || undefined],
        ['Ano fabricação', dados?.ano_fabrico],
        ['Data da fatura proforma', ptDate(dados?.data_emissao_fatura_proforma) || undefined],
        ['Entidade emissora da fatura', dados?.emissora_fatura_proforma || undefined],
        ['Conservatória', dados?.localizacao_conservatoria || undefined],
      ],
    },
    imovel: {
      kpis: [
        ['NIP', dados?.nip, true],
        ['Nº de matriz', dados?.numero_matriz],
        ['Valor avaliação', fCurrency(dados?.valor_avaliacao)],
      ],
      details: [
        ['Tipo de matriz', dados?.tipo_matriz],
        ['Nº de descrição predial', dados?.numero_descricao_predial || undefined],
        ['Nº inscrição da hipotéca', dados?.numero_inscricao_hipoteca],
        ['Área', dados?.area || undefined],
        ['Nº de andar', dados?.numero_andar || undefined],
        ['Identificação fração', dados?.identificacao_fracao || undefined],
        ['Conservatória', dados?.localizacao_conservatoria],
      ],
      address: [
        ['Ilha', dados?.ilha],
        ['Concelho', dados?.concelho],
        ['Freguesia', dados?.freguesia],
        ['Zona', dados?.zona],
        ['Rua', dados?.rua || undefined],
        ['Nº de porta', dados?.numero_porta || undefined],
        ['Descritivo', dados?.descritivo || undefined],
      ],
    },
    titulo: {
      kpis: [
        ['Nº de títulos', fNumber(dados?.numero_titulos)],
        ['Valor do título', fCurrency(dados?.valor_titulo)],
      ],
      details: [
        ['Código', dados?.codigo],
        ['Tipo', dados?.tipo_titulo],
        ['Cliente', dados?.numero_cliente],
        ['Entidade emissora', dados?.nome_entidade_emissora],
        ['Entidade registadora', dados?.nome_instituicao_registo],
      ],
    },
    seguro: {
      kpis: [
        ['Apólice', dados?.apolice, true],
        ['Valor', fCurrency(dados?.valor)],
      ],
      details: [
        ['Tipo', sec],
        ['Seguradora', dados?.seguradora],
        ['Prémio', fCurrency(dados?.premio)],
        [
          'Periodicidade',
          periodicidadesList.find(({ id }) => id === dados?.periodicidade)?.label || dados?.periodicidade,
        ],
      ],
    },
  };

  const isImovel = ['terreno', 'predio', 'apartamento'].includes(item);
  const current = isImovel ? specs.imovel : specs[item];

  if (!current) return null;

  return (
    <Grid container spacing={3}>
      {current.kpis.some(([, value]) => value) && (
        <GridItem md={isImovel ? 12 : 4}>
          <Paper variant="outlined" sx={{ p: 1.5, height: 1 }}>
            <Stack useFlexGap flexWrap="wrap" direction={isImovel ? 'row' : 'column'} spacing={isImovel ? 3 : 1.5}>
              {current.kpis.map(([label, value, realce]) =>
                value ? (
                  <Box key={label}>
                    <Typography variant="overline" sx={{ color: 'text.disabled', display: 'block' }}>
                      {label}
                    </Typography>
                    <Typography variant="subtitle1" color={realce ? 'primary.main' : 'text.primary'}>
                      {value || '—'}
                    </Typography>
                  </Box>
                ) : null
              )}
            </Stack>
          </Paper>
        </GridItem>
      )}

      <GridItem md={isImovel ? 6 : 8}>
        <Paper variant="outlined" sx={{ p: 1.5, height: 1 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', mb: 1.5, display: 'block' }}>
            Informações Técnicas
          </Typography>
          <Box display="grid" gap={1}>
            {(dados?.bem_financiado || dados?.bem_sem_registo) && (
              <Stack direction="row" spacing={1}>
                {dados?.bem_financiado && <Label color="info">Bem financiado</Label>}
                {dados?.bem_sem_registo && <Label color="info">Bem ainda não registado</Label>}
              </Stack>
            )}
            {current.details.map(([label, value]) => (
              <Item key={label} title={label} value={value} />
            ))}
          </Box>
        </Paper>
      </GridItem>

      {isImovel && (
        <GridItem md={6}>
          <Paper variant="outlined" sx={{ p: 1.5, height: 1 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', mb: 1.5, display: 'block' }}>
              Localização
            </Typography>
            <Box display="grid" gridTemplateColumns="1fr" gap={1}>
              {current.address.map(([label, value]) => (
                <Item key={label} title={label} value={value} />
              ))}
            </Box>
          </Paper>
        </GridItem>
      )}
    </Grid>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function GarantiaLayout({ children, donos, donosTitle, multi, openForm, id }) {
  return (
    <Paper
      variant={multi ? 'outlined' : ''}
      sx={{
        p: multi ? 2 : 0,
        position: 'relative',
        transition: 'all 0.3s',
        borderRadius: multi ? 1.5 : 0,
        '&:hover': multi ? { boxShadow: (theme) => theme.customShadows.z12 } : null,
      }}
    >
      <Stack spacing={3}>
        {children}
        {donos?.length > 0 && <Entidades dados={donos} title={donosTitle} />}

        {openForm && (
          <Stack direction="column" alignItems="center">
            <DefaultAction
              button
              icon="adicionar"
              label="Entidade/Dono"
              onClick={() => openForm('form-interveniente', { garantiaId: id })}
            />
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Item({ title, value }) {
  const hasValue = value !== null && value !== undefined && value !== '';
  if (value === undefined) return null;

  return (
    <Stack direction="row" spacing={1} alignItems="flex-end">
      <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
        {title}:
      </Typography>
      {hasValue ? (
        <Typography variant="body2">{title === 'Balcão' ? <Balcao balcao={value} /> : value}</Typography>
      ) : (
        noDados('(Não defenido)')
      )}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Balcao({ balcao }) {
  const { uos } = useSelector((state) => state.intranet);
  const balcaoLabel = uos?.find(({ balcao: balc }) => balc === balcao)?.label;
  return balcaoLabel ? `${balcao} - ${balcaoLabel}` : balcao;
}

// ---------------------------------------------------------------------------------------------------------------------

export function Livranca({ livranca, donos }) {
  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 1, color: 'primary.main', typography: 'subtitle1', textAlign: 'center' }}>
        {livranca}
      </Paper>
      {donos?.length > 0 && <Entidades dados={donos} title="Avalista(s)" />}
    </Stack>
  );
}
