export async function callMsGraph(accessToken) {
  const headers = new Headers();
  headers.append('Authorization', `Bearer ${accessToken}`);

  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', { method: 'GET', headers });

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
