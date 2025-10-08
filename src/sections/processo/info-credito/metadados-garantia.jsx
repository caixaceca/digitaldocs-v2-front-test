// @mui
import Stack from '@mui/material/Stack';
// utils
import { ptDate } from '../../../utils/formatTime';
import { fNumber } from '../../../utils/formatNumber';
// components
import { TableRowItem } from '../../parametrizacao/Detalhes';
import { SearchNotFoundSmall } from '../../../components/table/SearchNotFound';

// ---------------------------------------------------------------------------------------------------------------------

export default function MetadadosGarantia({ dados }) {
  return (
    <>
      {!dados ? (
        <Stack alignItems="center" sx={{ width: 1, pt: 3 }}>
          <SearchNotFoundSmall message="Nenhuma informação adicionada..." />
        </Stack>
      ) : (
        <>
          {/* DP */}
          <TableRowItem title="Conta DO:" text={dados?.conta_dp} />
          <TableRowItem
            title="Saldo DP:"
            text={dados?.saldo_dp ? `${fNumber(dados?.saldo_dp)} ${dados?.moeda_dp ?? ''}` : ''}
          />
          <TableRowItem title="Balcão DP:" text={dados?.balcao_dp} />
          <TableRowItem title="Prazo DP:" text={dados?.prazo_dp} />
          <TableRowItem title="Data início DP:" text={ptDate(dados?.data_inicio_dp)} />
          <TableRowItem title="Data vencimento DP:" text={ptDate(dados?.data_vencimento_dp)} />
          <TableRowItem title="Data constituição DP:" text={ptDate(dados?.data_constituicao_dp)} />
          {/* TÍTULO */}
          <TableRowItem title="Título:" text={dados?.tipo_titulo || dados?.titulo || dados?.tipo_titulo_id} />
          <TableRowItem title="Total título:" text={dados?.total_titulo ? fNumber(dados?.total_titulo) : ''} />
          <TableRowItem title="Instituição emissora:" text={dados?.instituicao_emissora_titulo} />
          <TableRowItem title="Instituição registo:" text={dados?.instituicao_registo_titulo} />
          <TableRowItem title="Cliente registo:" text={dados?.cliente_registo_titulo} />
          {/* IMÓVEL */}
          <TableRowItem title="Tipo de imóvel:" text={dados?.tipo_imovel} />
          <TableRowItem title="Conservatória:" text={dados?.conservatoria} />
          <TableRowItem title="Identificação fração:" text={dados?.identificacao_fracao} />
          <TableRowItem title="Tipo matriz:" text={dados?.tipo_matriz} />
          <TableRowItem title="Nº matriz predial:" text={dados?.num_matriz_predial} />
          <TableRowItem title="Nº registo predial:" text={dados?.num_registo_predial} />
          <TableRowItem title="Nº descrição predial:" text={dados?.num_descricao_predial} />
          <TableRowItem title="Ilha:" text={dados?.ilha} />
          <TableRowItem title="Freguesia:" text={dados?.freguesia} />
          <TableRowItem title="Concelho:" text={dados?.concelho} />
          <TableRowItem title="Cidade:" text={dados?.cidade} />
          <TableRowItem title="Zona:" text={dados?.zona} />
          <TableRowItem title="Piso:" text={dados?.piso} />
          <TableRowItem title="Área do terreno:" text={dados?.area_terreno ? `${dados?.area_terreno} m²` : ''} />
          {/* VIATURA */}
          <TableRowItem title="Marca da viatura:" text={dados?.marca_viatura} />
          <TableRowItem title="Modelo da viatura:" text={dados?.modelo_viatura} />
          <TableRowItem title="Matrícula da viatura:" text={dados?.matricula_viatura} />
          <TableRowItem title="Nura da viatura:" text={dados?.nura_viatura} />
          <TableRowItem title="Ano de fabricação:" text={dados?.ano_fabrico} />
          {/*  */}
          <TableRowItem
            title="Dono(s) da garantia:"
            text={dados?.donos?.map((d) => d.numero_entidade).join(', ') || ''}
          />
        </>
      )}
    </>
  );
}
