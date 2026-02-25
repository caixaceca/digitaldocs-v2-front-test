import { TextRun } from 'docx';

export const extrairDescricaoGarantias = (garantias = []) => {
  if (!garantias || garantias.length === 0) {
    return [new TextRun({ text: 'Garantia constituída por livrança subscrita pelo proponente.' })];
  }

  const runs = [];

  garantias.forEach((g) => {
    const meta = g.metadados || {};
    const { fiadores, seguros, livrancas, contas, imoveis } = meta || {};

    const adicionarQuebraSeNecessario = () => {
      if (runs.length > 0) return { break: 1 };
      return {};
    };

    // 1. FIANÇA
    if (fiadores?.length > 0) {
      runs.push(new TextRun({ text: '• Fiança solidária prestada por: ', ...adicionarQuebraSeNecessario() }));
      fiadores.forEach((f, i) => {
        runs.push(new TextRun({ text: `${f.nome_entidade}${i < fiadores.length - 1 ? ', ' : ';'}`, bold: true }));
      });
    }

    // 2. LIVRANÇAS
    if (livrancas?.length > 0) {
      runs.push(new TextRun({ text: '• Livranças: ', ...adicionarQuebraSeNecessario() }));
      livrancas.forEach((s, i) => {
        runs.push(new TextRun({ text: `${s.numero_livranca}${i < livrancas.length - 1 ? ', ' : ';'}`, bold: true }));
      });
    }

    // 3. SEGUROS
    if (seguros?.length > 0) {
      runs.push(new TextRun({ text: '• Seguros: ', ...adicionarQuebraSeNecessario() }));
      seguros.forEach((s, i) => {
        runs.push(new TextRun({ text: `${s.apolice}${i < seguros.length - 1 ? ', ' : ';'}`, bold: true }));
      });
    }

    // 4. CONTAS / DEPÓSITOS
    if (contas?.length > 0) {
      runs.push(new TextRun({ text: '• Penhor de Depósito a Prazo na conta: ', ...adicionarQuebraSeNecessario() }));
      contas.forEach((c, i) => {
        runs.push(new TextRun({ text: `${c.numero_conta}${i < contas.length - 1 ? ', ' : ';'}`, bold: true }));
      });
    }

    // 5. IMÓVEIS
    if (imoveis) {
      const predios = imoveis.predios || [];
      const terrenos = imoveis.terrenos || [];
      const veiculos = imoveis.veiculos || [];
      const apartamentos = imoveis.apartamentos || [];

      const imoveisList = [...predios, ...apartamentos, ...terrenos];

      if (imoveisList.length > 0) {
        runs.push(new TextRun({ text: '• Hipoteca sobre imóvel: ', ...adicionarQuebraSeNecessario() }));
        imoveisList.forEach((p, i) => {
          const desc = `Matriz nº ${p.numero_matriz || p.matriz_predial || '---'}, Descritivo: ${p.numero_descricao_predial || '---'}`;
          runs.push(new TextRun({ text: `${desc}${i < imoveisList.length - 1 ? '; ' : ';'}`, bold: true }));
        });
      }

      if (veiculos.length > 0) {
        runs.push(new TextRun({ text: '• Hipoteca de veículo: ', ...adicionarQuebraSeNecessario() }));
        veiculos.forEach((v, i) => {
          const desc = `${v.marca} ${v.modelo} (${v.matricula || 'S/M'})}`;
          runs.push(new TextRun({ text: `${desc}${i < veiculos.length - 1 ? ', ' : ';'}`, bold: true }));
        });
      }
    }
  });

  return runs.length > 0 ? runs : [new TextRun({ text: 'Garantia conforme condições contratuais.' })];
};
