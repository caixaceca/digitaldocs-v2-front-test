const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config) {
  // Verifica se o navegador suporta Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${window.location.origin}/service-worker.js?v=2`;

      // Verifica se é localhost para fins de desenvolvimento
      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'Este aplicativo está sendo servido por um Service Worker no modo cache-first. Para mais informações, visite https://cra.link/PWA'
          );
        });
      } else {
        // Registra o Service Worker em produção
        registerValidSW(swUrl, config);
      }
    });
  }
}

// Função para registrar Service Worker em produção
function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      // Detecta se há uma atualização do SW
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        // Acompanha o estado do worker em instalação
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            // Verifica se há controle de um SW anterior (indica uma atualização)
            if (navigator.serviceWorker.controller) {
              console.log('Novo conteúdo disponível; atualize as abas para utilizar a nova versão.');

              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              console.log('O conteúdo está disponível para uso offline.');

              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Erro ao registrar o Service Worker:', error);
    });
}

// Verifica se o SW está instalado corretamente no modo localhost
function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      // Verifica se o arquivo de SW é válido (não foi removido ou corrompido)
      if (response.status === 404 || (contentType != null && contentType.indexOf('javascript') === -1)) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Registra o Service Worker se for válido
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('Sem conexão à internet. O app está sendo executado em modo offline.');
    });
}

// Função para desregistrar o SW (caso necessário)
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
