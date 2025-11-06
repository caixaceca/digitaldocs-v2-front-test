import sumBy from 'lodash/sumBy';
// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
// utils
import { useSelector } from '../../../redux/store';
import { ptDate } from '../../../utils/formatTime';
import { fPercent, fNumber, fConto } from '../../../utils/formatNumber';

// ---------------------------------------------------------------------------------------------------------------------

const frSegmentoStyle = { pl: '12px !important', typography: 'subtitle2' };

// ---------------------------------------------------------------------------------------------------------------------

export function Segmento({ from, linha1, linha2, linha3, segmento, linha1Dados, linha2Dados, linha3Dados }) {
  const lengthLinha1 = linha1Dados?.length > 1 ? linha1Dados?.length : 0;
  const lengthLinha2 = linha2Dados?.length > 1 ? linha2Dados?.length : 0;
  const lengthLinha3 = linha3Dados?.length > 1 ? linha3Dados?.length : 0;
  return (
    <>
      <FirstRowSegmento
        from={from}
        linha={linha1}
        segmento={segmento}
        length1={lengthLinha1}
        dados={linha1Dados?.[0]}
        length={lengthLinha1 + lengthLinha2 + lengthLinha3 + 4}
      />
      {lengthLinha1 > 1 && (
        <>
          {linha1Dados.map(
            (row, index) =>
              index !== 0 && (
                <TableRow hover key={row?.id}>
                  <DadosCell dados={row} from={from} index={index + 1} />
                </TableRow>
              )
          )}
          <TableRowTotal
            nivel={1}
            from={from}
            total={sumBy(linha1Dados, from === 'contratado' ? 'montante_aprovado' : 'montantes')}
            total1={sumBy(linha1Dados, from === 'contratado' ? 'montante_contratado' : 'montante_aprovado')}
          />
        </>
      )}

      {/* LINHA 2 */}
      <FirstRowLinha linha={linha2} dados={linha2Dados?.[0]} length={lengthLinha2} from={from} />
      {lengthLinha2 > 1 && (
        <>
          {linha2Dados.map(
            (row, index) =>
              index !== 0 && (
                <TableRow hover key={row?.id}>
                  <DadosCell dados={row} from={from} index={index + 1} />
                </TableRow>
              )
          )}
          <TableRowTotal
            nivel={1}
            from={from}
            total={sumBy(linha2Dados, from === 'contratado' ? 'montante_aprovado' : 'montantes')}
            total1={sumBy(linha2Dados, from === 'contratado' ? 'montante_contratado' : 'montante_aprovado')}
          />
        </>
      )}

      {/* LINHA 3 */}
      <FirstRowLinha linha={linha3} dados={linha3Dados?.[0]} length={lengthLinha3} from={from} />
      {lengthLinha3 > 1 && (
        <>
          {linha3Dados.map(
            (row, index) =>
              index !== 0 && (
                <TableRow hover key={row?.id}>
                  <DadosCell dados={row} from={from} index={index + 1} />
                </TableRow>
              )
          )}
          <TableRowTotal
            nivel={1}
            from={from}
            total={sumBy(linha3Dados, from === 'contratado' ? 'montante_aprovado' : 'montantes')}
            total1={sumBy(linha3Dados, from === 'contratado' ? 'montante_contratado' : 'montante_aprovado')}
          />
        </>
      )}
      <TableRowTotal
        nivel={2}
        from={from}
        length={linha1Dados?.length + linha2Dados?.length + linha3Dados?.length}
        color={
          (segmento === 'Empresa' && 'grey.500_16') ||
          (segmento === 'Particular' && 'grey.500_24') ||
          (segmento === 'Produtor Individual' && 'grey.500_32') ||
          'background.neutral'
        }
        total={
          sumBy(linha1Dados, from === 'contratado' ? 'montante_aprovado' : 'montantes') +
          sumBy(linha2Dados, from === 'contratado' ? 'montante_aprovado' : 'montantes') +
          sumBy(linha3Dados, from === 'contratado' ? 'montante_aprovado' : 'montantes')
        }
        total1={
          sumBy(linha1Dados, from === 'contratado' ? 'montante_contratado' : 'montante_aprovado') +
          sumBy(linha2Dados, from === 'contratado' ? 'montante_contratado' : 'montante_aprovado') +
          sumBy(linha3Dados, from === 'contratado' ? 'montante_contratado' : 'montante_aprovado')
        }
      />
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function FirstRowSegmento({ segmento, linha, dados, total = false, length, from, length1 }) {
  const color =
    (segmento === 'Empresa' && 'grey.500_16') ||
    (segmento === 'Particular' && 'grey.500_24') ||
    (segmento === 'Produtor Individual' && 'grey.500_32') ||
    'background.neutral';
  return (
    <TableRow hover sx={{ borderColor: 'background.paper' }}>
      <TableCell rowSpan={length} sx={{ ...frSegmentoStyle, bgcolor: color }}>
        <b>{segmento}</b>
      </TableCell>
      {segmento === 'Entidades Públicas' || segmento === 'Garantias Bancárias' ? (
        <TableCell sx={{ backgroundColor: total && 'background.neutral' }}> </TableCell>
      ) : (
        <TableCell rowSpan={length1 > 1 ? length1 + 1 : 1} sx={{ ...frSegmentoStyle }}>
          <b>{linha}</b>
        </TableCell>
      )}
      <DadosCell dados={dados} from={from} total={total} />
    </TableRow>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function SegmentoStd({ from, segmento, dados }) {
  const length = dados?.length;
  return (
    <>
      <FirstRowSegmento
        from={from}
        dados={dados?.[0]}
        segmento={segmento}
        total={length === 0}
        length={length > 0 ? length + 1 : 1}
      />
      {length > 1 &&
        dados.map(
          (row, index) =>
            index !== 0 && (
              <TableRow hover key={row?.id}>
                <TableCell> </TableCell>
                <DadosCell dados={row} from={from} index={index + 1} />
              </TableRow>
            )
        )}
      {length > 0 && (
        <TableRowTotal
          nivel={2}
          from={from}
          total={sumBy(dados, from === 'contratado' ? 'montante_aprovado' : 'montantes')}
          total1={sumBy(dados, from === 'contratado' ? 'montante_contratado' : 'montante_aprovado')}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function TableRowTotal({ total, total1 = 0, nivel, from, color = '', empty = false, length = -1 }) {
  const { moeda } = useSelector((state) => state.indicadores);
  const cell =
    (from === 'entrada' && 7) ||
    (from === 'aprovado' && 5) ||
    (from === 'contratado' && 10) ||
    ((from === 'desistido' || from === 'indeferido') && 6);

  return empty ? (
    <>
      <TableCell colSpan={nivel === 1 ? cell : cell + 1} sx={{ backgroundColor: color }}>
        {}
      </TableCell>
      <TableCell align="right" sx={{ typography: 'subtitle2', backgroundColor: color }}>
        {nivel === 1 ? 0 : <b>{0}</b>}
      </TableCell>
      {(from === 'aprovado' || from === 'contratado') && (
        <TableCell align="right" sx={{ typography: 'subtitle2', backgroundColor: color }}>
          {nivel === 1 ? 0 : <b>{0}</b>}
        </TableCell>
      )}
    </>
  ) : (
    <TableRow hover sx={{ backgroundColor: (nivel === 1 && 'background.paper') || color }}>
      {length > -1 ? (
        <>
          <TableCell>{}</TableCell>
          <TableCell align="right" sx={{ typography: 'subtitle1' }}>
            {length}
          </TableCell>
          <TableCell colSpan={cell - 1}>{}</TableCell>
        </>
      ) : (
        <TableCell colSpan={nivel === 1 ? cell : cell + 1}>{}</TableCell>
      )}
      <TableCell align="right" sx={{ typography: (nivel === 1 && 'subtitle2') || 'subtitle1', whiteSpace: 'nowrap' }}>
        {nivel === 1 ? labelValue(total, moeda) : <b>{labelValue(total, moeda)}</b>}
      </TableCell>
      {(from === 'aprovado' || from === 'contratado') && (
        <TableCell align="right" sx={{ typography: (nivel === 1 && 'subtitle2') || 'subtitle1', whiteSpace: 'nowrap' }}>
          {nivel === 1 ? labelValue(total1, moeda) : <b>{labelValue(total1, moeda)}</b>}
        </TableCell>
      )}
    </TableRow>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function FirstRowLinha({ linha, dados, length, from }) {
  return (
    <TableRow hover>
      <TableCell rowSpan={length > 1 ? length + 1 : 1} sx={{ ...frSegmentoStyle }}>
        <b>{linha}</b>
      </TableCell>
      <DadosCell dados={dados} from={from} />
    </TableRow>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function DadosCell({ dados, from, index = 1, total }) {
  const { moeda } = useSelector((state) => state.indicadores);

  return dados ? (
    <>
      <TableCell align="right" sx={{ pl: '12px !important' }}>
        {fNumber(index)}
      </TableCell>
      <TableCell sx={{ minWidth: 200 }}>{dados?.titular}</TableCell>
      {(from === 'entrada' || from === 'desistido' || from === 'indeferido') && (
        <TableCell>{ptDate(dados?.data_entrada)}</TableCell>
      )}
      {from === 'aprovado' && <TableCell>{ptDate(dados?.data_aprovacao)}</TableCell>}
      {from === 'contratado' && <TableCell>{ptDate(dados?.data_contratacao)}</TableCell>}
      <TableCell>{dados?.setor_atividade}</TableCell>
      {from !== 'aprovado' && <TableCell>{dados?.finalidade}</TableCell>}
      {(from === 'entrada' || from === 'aprovado') && <TableCell>{dados?.situacao_final_mes}</TableCell>}
      {from === 'entrada' && <TableCell>{dados?.nproposta}</TableCell>}
      {from === 'contratado' && (
        <>
          <TableCell>{`${dados?.prazo_amortizacao ?? '--'}${dados?.prazo_amortizacao?.includes('meses') ? '' : ' meses'}`}</TableCell>
          <TableCell>{dados?.taxa_juro && fPercent(dados?.taxa_juro)}</TableCell>
          <TableCell>{dados?.garantia}</TableCell>
          <TableCell>{dados?.escalao_decisao}</TableCell>
          <TableCell>{dados?.cliente}</TableCell>
        </>
      )}
      {from === 'indeferido' && <TableCell>{ptDate(dados?.data_indeferido)}</TableCell>}
      {from === 'desistido' && <TableCell>{ptDate(dados?.data_desistido)}</TableCell>}
      {from !== 'contratado' && (
        <TableCell align="right" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {labelValue(dados?.montantes, moeda)}
        </TableCell>
      )}
      {(from === 'aprovado' || from === 'contratado') && (
        <TableCell align="right" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {labelValue(dados?.montante_aprovado, moeda)}
        </TableCell>
      )}
      {from === 'contratado' && (
        <TableCell align="right" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {labelValue(dados?.montante_contratado, moeda)}
        </TableCell>
      )}
    </>
  ) : (
    <TableRowTotal nivel={1} from={from} empty color={total ? 'background.neutral' : ''} />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export const labelValue = (value, moeda) => (moeda === 'Escudo' ? fNumber(value) : fConto(value));
