import { useMemo } from 'react';
// utils
import {
  limiteDsti,
  idadeCliente,
  getRiskLevel,
  extractClientes,
  limiteAvalFianca,
  antiguidadeRelacao,
} from '../calculos';

// ---------------------------------------------------------------------------------------------------------------------

export default function useFiadorCalculos(row, financiamento, rend) {
  return useMemo(() => {
    const ficha = row?.ficha || {};
    const fiancas = ficha?.fiancas || [];
    const liquido = row?.renda_liquido_mensal;
    const avalesExternos = row?.avales_externas || [];
    const dividasExternas = row?.dividas_externas || [];
    const idade = ficha?.entidade?.data_nascimento ? idadeCliente(ficha?.entidade.data_nascimento) : null;

    const { dividas, irregularidades } = extractClientes(ficha?.clientes || []);

    const totalPres = [financiamento, ...fiancas].reduce(
      (acc, item) => acc + Math.abs(Number(item?.valor_prestacao || 0)),
      0
    );

    const dividasProprias = [...dividas, ...dividasExternas];
    const totalDividaPropria = dividasProprias.reduce(
      (acc, item) => acc + Math.abs(Number(item?.saldo_divida || 0)),
      0
    );
    const totalPrestacaoPropria = dividasProprias.reduce(
      (acc, item) => acc + Math.abs(Number(item?.valor_prestacao || 0)),
      0
    );

    const dstiPropria = limiteDsti({ renda_liquido_mensal: liquido });
    const limiteFianca = limiteAvalFianca({ renda_liquido_mensal: liquido });
    const violacoes = getRiskLevel({ totalPres, limiteFianca, liquido, rend, dstiPropria });

    return {
      liquido,
      fiancas,
      dividas,
      avalesExternos,
      dividasExternas,
      irregularidades,

      idade: idade ? `${idade} anos` : null,
      nome: row?.nome || row?.nome_entidade || '—',
      estadoCivil: ficha?.entidade?.estado_civil,
      numero: row?.numero || row?.numero_entidade || '—',
      antiguidade: antiguidadeRelacao(ficha?.clientes, ficha?.entidade?.nome),

      totalPres,
      limiteFianca,
      excedeLimite: violacoes.includes('excede_limite_fianca'),
      pctLimite: limiteFianca ? Math.round((totalPres / limiteFianca) * 100) : 0,

      dstiPropria,
      totalDividaPropria,
      totalPrestacaoPropria,
      excedeLimiteDsti: violacoes.includes('excede_limite_dsti'),

      pctProponente: rend ? Math.round((liquido / rend) * 100) : null,
      rendimentoInsuficiente: violacoes.includes('rendimento_insuficiente'),

      numDividasInternas: dividas.length,
      numAvalFiancaInternas: fiancas.length,
      numDividasExternas: dividasExternas.length,
      numAvalFiancaExternas: avalesExternos.length,

      temAvalFianca: fiancas.length > 0 || avalesExternos.length > 0,
      temDividasAtivas: dividas.length > 0 || dividasExternas.length > 0,
    };
  }, [row, financiamento, rend]);
}
