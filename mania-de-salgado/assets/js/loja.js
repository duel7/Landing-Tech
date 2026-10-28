/*
  Dados da loja usados pelos scripts. Preencha antes de publicar (ver README).
  Os mesmos horários aparecem em texto no rodapé das duas páginas: mantenha iguais.
*/
window.LOJA = {
  // Somente números, com DDI e DDD. Ex.: '5511912345678'. Vazio = envio desativado.
  whatsapp: '',

  // Link do Google Maps para "Como chegar". Vazio = o link leva ao endereço no rodapé.
  mapa: '',

  // Horário de cada dia da semana (0 = domingo … 6 = sábado), em 24 h.
  // null = fechado. Objeto vazio = horários ainda não confirmados (o site não mostra
  // "Aberto agora"). Exemplo: { 0: null, 1: ['09:00', '19:00'], …, 6: ['09:00', '14:00'] }
  horarios: {}
};
