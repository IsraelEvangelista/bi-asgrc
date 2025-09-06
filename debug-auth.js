// Script de debug temporário para identificar loops infinitos
// Execute no console do browser para monitorar chamadas

// Contador de chamadas para detectar loops
window.authDebug = {
  initializeCalls: 0,
  loadProfileCalls: 0,
  visibilityChanges: 0,
  lastInitialize: null,
  lastLoadProfile: null
};

// Interceptar console.log para capturar logs do authStore
const originalLog = console.log;
console.log = function(...args) {
  const message = args.join(' ');
  
  // Detectar chamadas de initialize
  if (message.includes('loadUserProfile: Iniciando carregamento')) {
    window.authDebug.loadProfileCalls++;
    window.authDebug.lastLoadProfile = new Date();
    
    if (window.authDebug.loadProfileCalls > 5) {
      console.error('🚨 LOOP DETECTADO: loadUserProfile chamado', window.authDebug.loadProfileCalls, 'vezes!');
      console.trace('Stack trace do loop:');
    }
  }
  
  // Detectar mudanças de visibilidade
  if (message.includes('Visibilidade: Sessão válida detectada')) {
    window.authDebug.visibilityChanges++;
    
    if (window.authDebug.visibilityChanges > 3) {
      console.error('🚨 LOOP DETECTADO: Muitas mudanças de visibilidade!', window.authDebug.visibilityChanges);
    }
  }
  
  // Chamar o console.log original
  originalLog.apply(console, args);
};

// Função para resetar contadores
window.resetAuthDebug = function() {
  window.authDebug = {
    initializeCalls: 0,
    loadProfileCalls: 0,
    visibilityChanges: 0,
    lastInitialize: null,
    lastLoadProfile: null
  };
  console.log('🔄 Contadores de debug resetados');
};

// Função para mostrar estatísticas
window.showAuthStats = function() {
  console.log('📊 Estatísticas de Auth:', window.authDebug);
};

console.log('🔍 Debug de autenticação ativado! Use resetAuthDebug() e showAuthStats() para monitorar.');