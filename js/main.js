document.addEventListener('DOMContentLoaded', function() {
  // ===== [1] Menu Hamburguer Atualizado =====
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('header nav ul');

  const isMobile = () => window.innerWidth <= 768; // Use o mesmo breakpoint do seu CSS

  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', navLinks.classList.contains('active'));
  });

  // Fechar menu ao clicar em links (apenas mobile)
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (isMobile() && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // ===== [2] Links Externos =====
  document.querySelectorAll('a[href^="http"]').forEach(link => {
    if (!link.href.includes(window.location.host)) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      link.innerHTML += ' <i class="fas fa-external-link-alt" style="font-size:0.8em;"></i>';
    }
  });

  // ===== [3] Lazy Loading =====
  const lazyLoadImages = (images) => {
    if ('IntersectionObserver' in window) {
      const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const lazyImage = entry.target;
            if (lazyImage.dataset.src) {
              lazyImage.src = lazyImage.dataset.src;
              lazyImage.onload = () => lazyImage.classList.add('loaded');
              lazyObserver.unobserve(lazyImage);
            }
          }
        });
      }, { rootMargin: '200px' });

      images.forEach(img => lazyObserver.observe(img));
    } else {
      images.forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.add('loaded');
        }
      });
    }
  };
  
  lazyLoadImages(document.querySelectorAll('.lazy-load'));
});

  // Lazy Load para imagens da galeria
function initLazyLoad() {
  const lazyImages = document.querySelectorAll('img.lazy-load');
  
  if ('IntersectionObserver' in window) {
    const lazyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.classList.remove('lazy-load');
          lazyObserver.unobserve(lazyImage);
        }
      });
    }, {
      rootMargin: '200px' // Carrega 200px antes de entrar na viewport
    });

    lazyImages.forEach(img => lazyObserver.observe(img));
  } else {
    // Fallback para navegadores antigos
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.classList.remove('lazy-load');
    });
  }
}

// Chame no DOMContentLoaded
document.addEventListener('DOMContentLoaded', initLazyLoad);

  // ===== [2.1] Animações Sob Demanda ===== 
const initScrollAnimations = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        observer.unobserve(entry.target); // Otimização: para de observar após animar
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
};

// Chama a função quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initScrollAnimations);

  // ===== [3] Vídeos - Versão Corrigida =====
document.addEventListener('DOMContentLoaded', function() {
  // Configura o IntersectionObserver para pré-carregar os vídeos quando estiverem próximos
  // Modifique o IntersectionObserver para vídeos
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const thumbnail = entry.target;
        if (!thumbnail.dataset.loaded) {
          thumbnail.dataset.loaded = true;
          const iframe = document.createElement('iframe');
          iframe.loading = "lazy";
          iframe.src = thumbnail.dataset.video + "&mute=1&background=1"; 
          iframe.setAttribute('aria-hidden', 'true');
          thumbnail.appendChild(iframe);
        }
      }
    });
  }, { threshold: 0.05, rootMargin: '25%' }); // Carrega mais cedo

  // Observa todos os thumbnails
  document.querySelectorAll('.video-thumbnail').forEach(video => {
    videoObserver.observe(video);
  });

  // Mantém o clique original para exibir o vídeo
  document.querySelectorAll('.video-thumbnail').forEach(thumbnail => {
    thumbnail.addEventListener('click', function() {
      if (!this.classList.contains('show-video')) {
        const iframe = this.querySelector('iframe') || document.createElement('iframe');
        iframe.style.display = 'block';
        iframe.src = `${this.getAttribute('data-video')}&autoplay=1`;
        iframe.setAttribute('allow', 'autoplay; fullscreen');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        this.innerHTML = '';
        this.appendChild(iframe);
        this.classList.add('show-video');
      }
    });
  });
});
  // ===== [4] Google Maps (Versão Final) =====
if (document.getElementById('map')) {
  fetch('../config/config.json')
    .then(response => {
      if (!response.ok) throw new Error('Erro ao carregar configurações');
      return response.json();
    })
    .then(data => {
      // Verificação robusta (incluindo debug)
      const apiKey = data?.apiKey || 'default-key';
      const debugMode = data?.debug ?? true; // Default true se não existir
      
      if (!apiKey) throw new Error('Chave não encontrada no arquivo');

      // Debug opcional (não afeta funcionalidade)
      if (debugMode) {
        console.log("Configurações:", { 
          apiKey: apiKey.substring(0, 5) + '...', // Exibe só parte da chave
          debugMode 
        });
      }

      // Carrega o mapa (mesmo se debug=false)
      const gmapScript = document.createElement('script');
      gmapScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&loading=async`;
      gmapScript.async = true;
      gmapScript.defer = true;
      gmapScript.onerror = () => showMapError();
      document.body.appendChild(gmapScript);
    })
    .catch(error => {
      console.error("Erro ao carregar configurações do mapa:", error);
      showMapError();
    });
}
// ===== [5] Função do Mapa (Versão Robustecida) =====
window.initMap = function() {
  const mapDiv = document.getElementById('map');
  
  if (!mapDiv || !window.google) {
    console.error('Elemento #map ou API não disponível');
    return;
  }

  try {
    const location = { lat: -23.54245, lng: -46.64663 };
    const map = new google.maps.Map(mapDiv, {
      zoom: 15,
      center: location,
      styles: [{
        featureType: "poi",
        stylers: [{ visibility: "off" }]
      }],
      gestureHandling: "cooperative" // Melhora UX em mobile
    });
    
    new google.maps.Circle({
      strokeColor: '#003580',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#003580',
      fillOpacity: 0.2,
      map: map,
      center: location,
      radius: 300
    });

    // Forçar redimensionamento se necessário
    setTimeout(() => google.maps.event.trigger(map, 'resize'), 100);
  } catch (e) {
    console.error("Erro na criação do mapa:", e);
    showMapError();
  }
};

// ===== [6] Função de Fallback =====
function showMapError() {
  const mapDiv = document.getElementById('map');
  if (mapDiv) {
    mapDiv.innerHTML = `
      <div class="map-fallback" style="
        padding: 20px;
        background: #f8f8f8;
        border-radius: 8px;
        text-align: center;
      ">
        <p>📍 Av. Paulista, 907 - Bela Vista, São Paulo/SP</p>
        <a href="https://www.google.com/maps?q=Av.+Paulista,907,São+Paulo" 
           target="_blank"
           style="color: #003580; font-weight: bold;">
          Abrir no Google Maps
        </a>
      </div>
    `;
  }
}



// Botão de Reserva
document.querySelector('.floating-cta').addEventListener('click', function(e) {
  e.preventDefault();
  
  const reservasSection = document.getElementById('reservas');
  if (reservasSection) {
    reservasSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    // Feedback visual (opcional)
    reservasSection.style.boxShadow = '0 0 0 3px var(--accent-color)';
    setTimeout(() => {
      reservasSection.style.boxShadow = 'none';
    }, 2000);
  } else {
    console.error('Seção de reservas não encontrada');
  }
});

// Dark Mode Toggle
function loadInitialTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('darkMode');
  
  if (savedTheme === 'true' || (prefersDark && savedTheme !== 'false')) {
    document.body.classList.add('dark-mode');
    icon.className = 'fas fa-sun';
  }
}

const icon = document.querySelector('.theme-toggle i') || document.createElement('i');

document.querySelector('.theme-toggle')?.addEventListener('click', function() {
  const isDark = document.body.classList.toggle('dark-mode');
  icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  localStorage.setItem('darkMode', isDark);
});

loadInitialTheme();

//Dark Mode Automatico por Horário:
const hour = new Date().getHours();
if (hour >= 18 || hour <= 6) document.body.classList.add('dark-mode');


// ===== [8] Feedback de Loading em Botões (VERSÃO CORRIGIDA) =====
document.querySelectorAll('.btn-platform').forEach(button => {
  button.addEventListener('click', function(e) {
    if (this.classList.contains('loading')) {
      e.preventDefault(); // Só impede se já estiver carregando
      return;
    }

    // Se for um link externo (plataforma), DEIXA ABRIR NORMALMENTE
    if (this.target === "_blank") {
      return; 
    }

    // Adiciona spinner (apenas para links internos)
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    this.classList.add('loading');
    this.appendChild(spinner);
  });
});

// Exemplo simples
window.addEventListener('beforeunload', () => {
  document.body.classList.add('fade-out');
});

// Configuração do Lightbox - Versão Robustecida

document.addEventListener('DOMContentLoaded', function() {
  // Verifica se o Lightbox foi carregado
  if (typeof lightbox !== 'undefined' && lightbox.option) {
    lightbox.option({
      'resizeDuration': 200,
      'wrapAround': true,
      'alwaysShowNavOnTouchDevices': true,
      'albumLabel': 'Imagem %1 de %2',
      'fadeDuration': 300,
      'imageFadeDuration': 300
    });
    
  } else {
    console.error('Erro: Lightbox não está disponível. Verifique:');
    console.log('- jQuery está carregado antes do Lightbox?');
    console.log('- O script lightbox.min.js foi importado?');
  }
});

// ===== [10] Filtros da Galeria =====
function initGalleryFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove a classe 'active' de todos os botões
      filterButtons.forEach(btn => btn.classList.remove('active'));
      // Adiciona 'active' apenas no botão clicado
      button.classList.add('active');
      
      const filter = button.dataset.filter;
      const environments = document.querySelectorAll('.gallery-environment');
      
      environments.forEach(env => {
        if (filter === 'all' || env.dataset.category === filter) {
          env.style.display = 'block';
          
          // Scroll suave para a seção
          if (filter !== 'all') {
            setTimeout(() => {
              env.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }
        } else {
          env.style.display = 'none';
        }
      });
    });
  });
}

// Chame esta função no DOMContentLoaded
document.addEventListener('DOMContentLoaded', initGalleryFilters);


// ===== [11] Comportamento diferenciado para link de Fotos =====
function adjustPhotoLinkBehavior() {
  const photosLink = document.querySelector('a[href="fotos.html"]');
  
  if (photosLink) {
    // Verifica se a tela é grande (>= 768px)
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    
    function handleScreenChange(e) {
      if (e.matches) {
        // Tela grande - abre em nova aba
        photosLink.setAttribute('target', '_blank');
        photosLink.setAttribute('rel', 'noopener noreferrer');
      } else {
        // Tela pequena - abre na mesma aba
        photosLink.removeAttribute('target');
        photosLink.removeAttribute('rel');
      }
    }
    
    // Executa na carga inicial
    handleScreenChange(mediaQuery);
    
    // Monitora mudanças de tamanho de tela
    mediaQuery.addListener(handleScreenChange);
  }
}

// Adicione esta chamada no DOMContentLoaded
document.addEventListener('DOMContentLoaded', adjustPhotoLinkBehavior);

// ===== [12] Comportamento Inteligente do Link de Localização =====
function handleLocationLinks() {
  const locationLinks = document.querySelectorAll('.location-link');
  
  locationLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Se já está no index.html
      if (window.location.pathname.endsWith('index.html') || 
          window.location.pathname === '/') {
        e.preventDefault();
        document.querySelector('#localizacao')?.scrollIntoView({ 
          behavior: 'smooth' 
        });
        
        // Efeito visual de destaque
        highlightLocationSection();
      } 
      // Se está em outra página (como fotos.html)
      else {
        const isLargeScreen = window.matchMedia('(min-width: 768px)').matches;
        
        if (isLargeScreen) {
          // Tela grande: abre em nova aba já na seção
          this.setAttribute('target', '_blank');
          this.setAttribute('rel', 'noopener noreferrer');
        } else {
          // Mobile: abre na mesma aba
          e.preventDefault();
          window.location.href = 'index.html#localizacao';
        }
      }
    });
  });
}

function highlightLocationSection() {
  const section = document.getElementById('localizacao');
  if (section) {
    section.style.transition = 'box-shadow 0.5s ease';
    section.style.boxShadow = '0 0 0 3px var(--accent-color)';
    
    setTimeout(() => {
      section.style.boxShadow = 'none';
    }, 2000);
  }
}

// Adicione ao DOMContentLoaded
document.addEventListener('DOMContentLoaded', handleLocationLinks);




