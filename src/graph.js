import { graphConfig } from './config';

/**
 * Realiza uma chamada à API do Microsoft Graph, anexando o token de acesso fornecido.
 * Retorna os dados da resposta convertidos para JSON.
 *
 * @param {string} accessToken - Token de acesso válido para autenticação na API do MS Graph.
 * @returns {Promise<Object>} - Objeto com os dados retornados pela API.
 * @throws {Error} - Lança um erro caso a resposta não seja OK ou se ocorrer algum problema na requisição.
 */

export async function callMsGraph(accessToken) {
  const headers = new Headers();
  headers.append('Authorization', `Bearer ${accessToken}`);

  try {
    const response = await fetch(graphConfig.graphMeEndpoint, { method: 'GET', headers });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na chamada da API Graph: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao chamar a API do MS Graph:', error);
    throw error;
  }
}
