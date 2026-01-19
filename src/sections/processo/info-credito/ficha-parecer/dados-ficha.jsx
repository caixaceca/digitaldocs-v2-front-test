// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
// utils
import { ptDate, getIdade } from '../../../../utils/formatTime';
import { fNumber, fPercent, fCurrency } from '../../../../utils/formatNumber';
//
import Label from '../../../../components/Label';
import { noDados } from '../../../../components/Panel';
import { responsabilidadesInfo, dataNascimento, estadoCivil, docInfo, colorDoc } from './calculos';

// ---------------------------------------------------------------------------------------------------------------------

export function Identificcao({ entidade }) {
  return (
    <TableBody>
      {rowInfo('Nº de entidade', entidade?.numero, false)}
      {rowInfo('Nome', entidade?.nome)}
      {rowInfo(
        'Doc. Identificação',
        docInfo(entidade?.documento, entidade?.tipo_documento),
        false,
        entidade?.data_validade ? (
          <Typography component="span" variant="body2" sx={{ color: colorDoc(entidade?.data_validade) }}>
            &nbsp;(Validade: {ptDate(entidade?.data_validade)})
          </Typography>
        ) : null
      )}
      {rowInfo('NIF', entidade?.nif || ' ', false)}
      {rowInfo('Telefone', entidade?.telefone || '', false)}
      {rowInfo('Email', entidade?.email || '', false)}
      {rowInfo('Sexo', entidade?.sexo || '', false)}
      {rowInfo('Data de nascimento', dataNascimento(entidade?.data_nascimento), false)}
      {rowInfo('Filiação', [entidade?.nome_pai, entidade?.nome_mae].filter(Boolean).join(' e ') || '', false)}
      {rowInfo('Morada', entidade?.morada || '', false)}
      {rowInfo('Código de risco', entidade?.codigo_risco || 'Não definido...', false)}
      {rowInfo('Nível de risco', entidade?.nivel_risco || 'Não definido...', false)}
      {rowInfo('Estado civil', estadoCivil(entidade?.estado_civil, entidade?.regime_casamento), false)}
      {entidade?.conjuge && (
        <>
          {rowInfo('Cônjuge', entidade?.nome_conjuge, false)}
          {rowInfo('Data nascimento cônjuge', dataNascimento(entidade?.data_nascimento_conjuge), false)}
        </>
      )}
    </TableBody>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Clientes({ dados }) {
  const rowInfo = ({ cliente, balcao, titularidade, relacao, data_abertura: da, titular }) => (
    <TableRow hover>
      <TableCell align="center">{cliente}</TableCell>
      <TableCell align="center">{balcao}</TableCell>
      <TableCell align="center" sx={{ color: titularidade !== 'Individual' && 'warning.main' }}>
        {titularidade || noDados()}
      </TableCell>
      <TableCell align="center">{relacao}</TableCell>
      <TableCell align="center">{da ? `${ptDate(da)} - ${getIdade(da, new Date())}` : ' '}</TableCell>
      <TableCell>{titular}</TableCell>
    </TableRow>
  );

  return dados?.length > 0 ? (
    <>
      <Cabecalho
        item="clientes"
        headLabel={[
          { label: 'Nº do cliente', align: 'center' },
          { label: 'Balcão', align: 'center' },
          { label: 'Titularidade', align: 'center' },
          { label: 'Relação', align: 'center' },
          { label: 'Data abertura', align: 'center' },
          { label: 'Nome 1º titular' },
        ]}
      />
      <TableBody>{dados?.map((row) => rowInfo(row))}</TableBody>
    </>
  ) : (
    <NadaConsta />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Saldos({ dados, titulos, totalMoedas }) {
  const rowInfo = ({ classe, conta, moeda, saldo, saldo_medio: sm }, total) => (
    <TableRow hover sx={{ '& > *': { fontWeight: total ? 'bold' : 'normal' } }}>
      <TableCell>{total ? 'Total' : classe}</TableCell>
      <TableCell align="center">{conta}</TableCell>
      <TableCell align="right">
        {total
          ? total?.map(({ saldo, moeda }) => (
              <>
                {fNumber(saldo, 2)} {moeda}
                <br />
              </>
            ))
          : `${fNumber(saldo, 2)} ${moeda}`}
      </TableCell>
      <TableCell align="right">{total ? '' : `${fNumber(sm, 2)} ${moeda}`}</TableCell>
    </TableRow>
  );

  const rowTitulo = ({ total, ativo, cliente, data_cotado: dc, valor_compra: v, valor_cotado: c, valor_cativo: a }) => (
    <TableRow hover>
      <TableCell align="right">{fNumber(total)}</TableCell>
      <TableCell>{ativo}</TableCell>
      <TableCell align="center">{cliente}</TableCell>
      <TableCell align="right">{fCurrency(v)}</TableCell>
      <TableCell align="right">{fCurrency(c)}</TableCell>
      <TableCell align="right">{fCurrency(a)}</TableCell>
      <TableCell align="center">{dc || ' '}</TableCell>
    </TableRow>
  );

  return dados?.length > 0 || titulos?.length > 0 ? (
    <>
      {dados?.length > 0 && (
        <>
          <Cabecalho
            item="saldos"
            headLabel={[
              { label: 'Classe' },
              { label: 'Conta', align: 'center' },
              { label: 'Saldo', align: 'right' },
              { label: 'Saldo médio', align: 'right' },
            ]}
          />
          <TableBody>
            {dados?.map((row) => rowInfo(row))}
            {dados?.length > 1 && rowInfo({}, totalMoedas)}
          </TableBody>
        </>
      )}
      {titulos?.length > 0 && (
        <>
          <Cabecalho
            item="titulos"
            headLabel={[
              { label: 'Qtd', align: 'right' },
              { label: 'Ativo' },
              { label: 'Cliente', align: 'center' },
              { label: 'Valor compra', align: 'right' },
              { label: 'Valor cotado', align: 'right' },
              { label: 'Valor cativo', align: 'right' },
              { label: 'Data cot.', align: 'center' },
            ]}
          />
          <TableBody>{titulos?.map((row) => rowTitulo(row))}</TableBody>
        </>
      )}
    </>
  ) : (
    <NadaConsta />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Movimentos({ dados, totaisConta }) {
  const rowInfo = ({ tipo, conta, moeda, valor, inicio, termino, totais }) => (
    <TableRow hover sx={{ '& > *': { fontWeight: totais ? 'bold' : 'normal' } }}>
      <TableCell>{tipo}</TableCell>
      <TableCell align="center">{conta}</TableCell>
      <CellValor valor={valor} moeda={moeda} total={totais} />
      <TableCell align="right">{totais || !inicio ? '' : `${ptDate(inicio)} - ${ptDate(termino)}`}</TableCell>
    </TableRow>
  );

  return dados?.length > 0 ? (
    <>
      <Cabecalho
        item="movimentos"
        headLabel={[
          { label: 'Descrição' },
          { label: 'Conta', align: 'center' },
          { label: 'Valor', align: 'right' },
          { label: 'Data referência', align: 'right' },
        ]}
      />
      <TableBody>
        {dados?.map((row) => rowInfo(row))}
        {rowInfo({ tipo: 'Total', totais: true, valor: dados.reduce((soma, row) => soma + row.valor, 0) })}
      </TableBody>
      {totaisConta?.length > 1 && (
        <TableBody>
          <EmptyRow cells={4} message="Total por conta" variant="head" />
          {totaisConta?.map((row) => rowInfo({ totais: true, ...row }))}
        </TableBody>
      )}
    </>
  ) : (
    <NadaConsta />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Responsabilidades({ responsabilidades }) {
  const { dividas, garantiasPrestadas, garantiasRecebidas, irregularidades, dividasExternas } = responsabilidades;

  const rowInfo = (row, incidente) => (
    <TableRow hover sx={{ '& > *': { fontWeight: row?.totais ? 'bold' : 'normal' } }}>
      <TableCell>{(row?.totais && '') || row?.tipo || row?.classe || ' '}</TableCell>
      <TableCell align="center">{row?.conta || ' '}</TableCell>
      <CellValor valor={row?.valor} moeda={row?.moeda} total={row?.totais} />
      <CellValor valor={row?.saldo_divida} moeda={row?.moeda} total={row?.totais} />
      <CellValor valor={row?.valor_prestacao} moeda={row?.moeda} total={row?.totais} />
      <TableCell align="right">{row?.taxa_juros ? fPercent(row?.taxa_juros, 2) : ' '}</TableCell>
      <TableCell align="center">
        {row?.data_abertura_credito === row?.data_vencimento || !row?.data_vencimento
          ? ptDate(row?.data_abertura_credito)
          : `${ptDate(row?.data_abertura_credito)} - ${ptDate(row?.data_vencimento)}`}
      </TableCell>
      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
        {row?.situacao && (
          <Label color={(incidente && 'warning') || (row?.situacao === 'Normal' && 'success') || 'error'}>
            {(incidente && row?.maior_irregularidade) || row?.situacao || ' '}
          </Label>
        )}
      </TableCell>
    </TableRow>
  );

  return dividas?.length > 0 ? (
    <>
      <Cabecalho
        item="responsabilidades"
        headLabel={[
          { label: 'Dívidas na caixa', color: 'success.main' },
          { label: 'Conta', align: 'center' },
          { label: 'Capital inicial', align: 'right' },
          { label: 'Saldo em dívida', align: 'right' },
          { label: 'Prestação', align: 'right' },
          { label: 'Taxa', align: 'right' },
          { label: 'Data', align: 'center' },
          { label: 'Situação', align: 'center' },
        ]}
      />
      <TableBody>
        {dividas?.map((row) => rowInfo(row))}
        {dividas?.length > 1 && rowInfo(responsabilidadesInfo(dividas))}
        {dividas?.length === 0 && <EmptyRow empty cells={7} message="Nenhum registo encontrado..." />}

        {/* Dívidas externas  */}
        {dividasExternas?.length > 0 && (
          <>
            <EmptyRow cells={8} message="Dívidas externas" variant="head" />
            {dividasExternas?.map((row) => rowInfo(row))}
            {dividasExternas?.length > 1 && rowInfo(responsabilidadesInfo(dividasExternas))}
          </>
        )}

        {dividas?.length > 0 && dividasExternas?.length > 0 && (
          <>
            <EmptyRow cells={8} message="Dívidas consolidadas" variant="head" />
            {rowInfo(responsabilidadesInfo([...dividas, ...dividasExternas]))}
          </>
        )}

        {/* Outras responsabilidades */}
        {(garantiasRecebidas?.length > 0 || garantiasPrestadas?.length > 0) && (
          <>
            <EmptyRow cells={8} message="Outras responsabilidades" variant="head" />
            {garantiasRecebidas?.map((row) => rowInfo(row))}
            {garantiasRecebidas?.length > 1 && rowInfo(responsabilidadesInfo(garantiasRecebidas))}
            {garantiasPrestadas?.map((row) => rowInfo(row))}
            {garantiasPrestadas?.length > 1 && rowInfo(responsabilidadesInfo(garantiasPrestadas))}
          </>
        )}

        {/* Irregularidades */}
        {irregularidades?.length > 0 && (
          <>
            <EmptyRow cells={8} message="Histórico de incidentes" variant="head" war />
            {irregularidades?.map((row) => rowInfo(row, true))}
          </>
        )}
      </TableBody>
    </>
  ) : (
    <NadaConsta />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function AvalesFiancas({ dados }) {
  const { fiancas, avalesExternos } = dados;

  const rowInfo = (row) => (
    <TableRow hover sx={{ '& > *': { fontWeight: row?.totais ? 'bold' : 'normal' } }}>
      <TableCell>{(row?.totais && 'Total') || row?.tipo_credito || ' '}</TableCell>
      <TableCell align="center">{row?.cliente || ' '}</TableCell>
      <TableCell align="center">{row?.tipo_interveniente}</TableCell>
      <CellValor valor={row?.valor} moeda={row?.moeda} total={row?.totais} />
      <CellValor valor={row?.saldo_divida} moeda={row?.moeda} total={row?.totais} />
      <CellValor valor={row?.valor_prestacao} moeda={row?.moeda} total={row?.totais} />
      <TableCell align="center">
        {row?.situacao && <Label color={(row?.situacao === 'Normal' && 'success') || 'error'}>{row?.situacao}</Label>}
      </TableCell>
    </TableRow>
  );

  return fiancas?.length > 0 || avalesExternos?.length > 0 ? (
    <>
      <Cabecalho
        item="avales-fiancas"
        headLabel={[
          { label: 'Avales/Fianças na caixa', color: 'success.main' },
          { label: 'Nº cliente', align: 'center' },
          { label: 'Resp.', align: 'center' },
          { label: 'Capital inicial', align: 'right' },
          { label: 'Saldo em dívida', align: 'right' },
          { label: 'Prestação', align: 'right' },
          { label: 'Situação', align: 'center' },
        ]}
      />
      <TableBody>
        {fiancas?.map((row) => rowInfo(row))}
        {fiancas?.length > 1 && rowInfo(responsabilidadesInfo(fiancas))}
        {fiancas?.length === 0 && <EmptyRow empty cells={7} message="Nenhum registo encontrado..." />}

        {/* Avales/Fianças externas  */}
        {avalesExternos?.length > 0 && (
          <>
            <EmptyRow cells={8} message="Avales/Fianças externas" variant="head" />
            {avalesExternos?.map((row) => rowInfo(row))}
            {avalesExternos?.length > 1 && rowInfo(responsabilidadesInfo(avalesExternos))}
          </>
        )}
        {fiancas?.length > 0 && avalesExternos?.length > 0 && (
          <>
            <EmptyRow cells={8} message="Avales/Fianças consolidadas" variant="head" />
            {rowInfo(responsabilidadesInfo([...fiancas, ...avalesExternos]))}
          </>
        )}
      </TableBody>
    </>
  ) : (
    <NadaConsta />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function CentralRisco({ cr }) {
  const dif = cr?.saldo_centralizado - cr?.saldo_comunicado > 1000;
  const rowInfo = (title, saldo, data, mora, dif) => (
    <TableRow hover>
      <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
        {title}:
      </TableCell>
      <TableCell sx={{ width: '100%' }}>
        <Typography variant="body2">
          <Typography component="span" variant="subtitle2" sx={{ color: dif && 'warning.main' }}>
            {fCurrency(saldo)}
          </Typography>
          <Typography component="span" variant="body2">
            &nbsp;em {ptDate(data)}
          </Typography>
          {mora && (
            <Typography component="span" variant="subtitle2" sx={{ color: 'error.main' }}>
              &nbsp;*Com mora
            </Typography>
          )}
        </Typography>
      </TableCell>
    </TableRow>
  );

  return cr ? (
    <TableBody>
      {rowInfo('Saldo comunicado', cr?.saldo_comunicado, cr?.comunicado_em, cr?.comunicado_com_mora)}
      {rowInfo('Saldo centralizado', cr?.saldo_centralizado, cr?.centralizado_em, cr?.centralizado_com_mora, dif)}
    </TableBody>
  ) : (
    <NadaConsta />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Mensagens({ dados }) {
  const rowInfo = ({ sigla, cliente, mensagem }) => (
    <TableRow hover>
      <TableCell>{sigla}</TableCell>
      <TableCell align="center">{cliente}</TableCell>
      <TableCell>{mensagem}</TableCell>
    </TableRow>
  );

  return dados?.length > 0 ? (
    <>
      <Cabecalho
        item="mensagens"
        headLabel={[{ label: 'Sigla' }, { label: 'Cliente', align: 'center' }, { label: 'Mensagem' }]}
      />
      <TableBody>{dados?.map((row) => rowInfo(row))}</TableBody>
    </>
  ) : (
    <NadaConsta />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Restruturacoes({ dados }) {
  const rowInfo = ({ cliente, data }) => (
    <TableRow hover>
      <TableCell>{cliente}</TableCell>
      <TableCell>{ptDate(data)}</TableCell>
    </TableRow>
  );

  return dados?.length > 0 ? (
    <>
      <Cabecalho item="restruturações" headLabel={[{ label: 'Cliente' }, { label: 'Data' }]} />
      <TableBody>{dados?.map((row) => rowInfo(row))}</TableBody>
    </>
  ) : (
    <NadaConsta />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Cabecalho({ item, headLabel }) {
  return (
    <TableHead>
      <TableRow>
        {headLabel.map((row, index) => (
          <TableCell align={row?.align || 'left'} key={`${row?.label}_${item}_${index}`} sx={{ color: row?.color }}>
            {row?.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export const rowInfo = (title, value, total, extra = null) => {
  const isTitle = value === '*title*';
  return value ? (
    <TableRow hover={!isTitle} sx={{ whiteSpace: 'nowrap' }}>
      <TableCell
        colSpan={1}
        align="right"
        sx={{ color: (total && 'success.main') || (!isTitle && 'text.secondary'), fontWeight: 'bold' }}
      >
        {title}:
      </TableCell>
      {!isTitle ? (
        <TableCell sx={{ width: '100%' }}>
          <Typography component="span" variant="body2" sx={{ fontWeight: total ? 'bold' : 'normal' }}>
            {value}
          </Typography>
          {extra}
        </TableCell>
      ) : (
        <TableCell sx={{ width: '100%' }}> </TableCell>
      )}
    </TableRow>
  ) : null;
};

function CellValor({ valor = 0, moeda = 'CVE', total = false }) {
  return (
    <TableCell align="right">
      <Typography noWrap variant="body2" sx={{ fontWeight: total ? 'bold' : 'normal' }}>{`${fNumber(
        Math.abs(valor),
        2
      )} ${moeda}`}</Typography>
    </TableCell>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function EmptyRow({ cells = 4, message = ' ', variant = '', empty }) {
  return (
    <TableRow>
      <TableCell
        colSpan={cells}
        variant={variant}
        sx={{
          border: 'none',
          color: (message === 'Histórico de incidentes' && 'warning.main') || (variant && 'success.main'),
          ...(empty && { fontStyle: 'italic', color: 'text.secondary' }),
        }}
      >
        {message}
      </TableCell>
    </TableRow>
  );
}

function NadaConsta() {
  return (
    <Typography variant="body2" sx={{ p: 1.5, fontStyle: 'italic', color: 'text.secondary' }}>
      Nada consta
    </Typography>
  );
}
