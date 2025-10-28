export default function useDashboardMockData() {
  const kpis = {
    satisfaction: 4.2,
    avgResponse: 3.75,
    ticketsOpened: 248,
    ticketsResolved: 201,
    firstContactResolution: 90,

    satisfactionPrev: 4.5,
    avgResponsePrev: 2.55,
    ticketsOpenedPrev: 230,
    ticketsResolvedPrev: 220,
    firstContactResolutionPrev: 72,
  };

  const bySubject = [
    { subject: 'Patrocínios', count: 5, resolved: 10, rating: 3, avgResponse: 2.4 },
    { subject: 'Cartão Vinti4', count: 25, resolved: 20, rating: 4, avgResponse: 3.75 },
    { subject: 'Desbloqueio de CaixaNet', count: 120, resolved: 102, rating: 5, avgResponse: 1 },
    { subject: 'Pedido de informação', count: 35, resolved: 20, rating: 4.2, avgResponse: 2 },
    { subject: 'Reclamação', count: 15, resolved: 17, rating: 2, avgResponse: 5.5 },
    { subject: 'Candidatura espontânea', count: 3, resolved: 8, rating: 1, avgResponse: 10 },
  ];

  // daily counts for current month
  const daily = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    opened: Math.max(2, Math.round(9 + Math.sin(i / 3) * 5 + Math.random() * 3)),
    resolved: Math.max(3, Math.round(8 + Math.cos(i / 4) * 4 + Math.random() * 2)),
  }));

  const byDepartment = [
    { department: 'DOP - CE', count: 125 },
    { department: 'DARH', count: 18 },
    { department: 'DICS', count: 36 },
    { department: 'GMKT', count: 5 },
    { department: 'GOEP', count: 23 },
    { department: 'Comercial', count: 44 },
  ];

  const byEmployee = [
    { employee: 'Kleiton Andrade', resolved: 78, rating: 4.5 },
    { employee: 'Jaquelino Semedo', resolved: 52, rating: 4.2 },
    { employee: 'Ivandro Évora', resolved: 34, rating: 3.3 },
    { employee: 'Jaqueline Pereira', resolved: 37, rating: 4.0 },
  ];

  // LAST 5
  const recentTickets = [
    {
      id: 'TK-2025-0145',
      subject: 'Acesso Caixanet',
      status: 'IN_PROGRESS',
      customer: 'Bryan Fortes',
      created_at: '2025-10-15T22:36:19.600108',
    },
    {
      id: 'TK-2025-0146',
      subject: 'Cartão bloqueado',
      status: 'OPEN',
      customer: 'Maria Santos',
      created_at: '2025-10-25T11:36:19.600108',
    },
    {
      id: 'TK-2025-0147',
      subject: 'Informação sobre crédito',
      status: 'CLOSED',
      customer: 'Joel Évora',
      created_at: '2025-10-25T09:36:19.600108',
    },
  ];

  const recentEvaluations = [
    {
      id: 1,
      rating: 5,
      subject: 'Cartão bloqueado',
      comment: 'Excelente atendimento',
      created_at: '2025-10-02T11:36:19.600108',
    },
    {
      id: 2,
      rating: 3,
      subject: 'Acesso Caixanet',
      comment: 'Resolvido, mas demorou',
      created_at: '2025-10-01T10:25:19.600108',
    },
  ];

  return { kpis, daily, byDepartment, bySubject, byEmployee, recentTickets, recentEvaluations };
}
