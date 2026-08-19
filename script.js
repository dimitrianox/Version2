const contenedorGaleria = document.getElementById('galeria');
const overlay = document.querySelector('.modal');
const modalImg = document.getElementById('modal-img');
const modalVideo = document.getElementById('modal-video');

const elemTitulo = document.getElementById('info-titulo');
const elemUbicacion = document.getElementById('info-ubicacion');
const elemFecha = document.getElementById('info-fecha');
const elemDesc = document.getElementById('info-descripcion');

const clasesTamano = ['', 'span-col-2', 'span-row-2', 'span-big'];
const extensionesVideo = ['.mp4', '.webm', '.ogg', '.mov'];

let ultimoToque = 0;

// Obtener la galería seleccionada de la URL (por defecto carga 'londres')
const urlParams = new URLSearchParams(window.location.search);
const galeriaActual = urlParams.get('galeria') || 'londres';

// Rutas dinámicas
const rutaCarpeta = `galerias/${galeriaActual}/`;
const rutaJson = `${rutaCarpeta}fotos.json`;

// Prevenir el menú contextual al dejar presionado sobre imágenes o videos
document.addEventListener('contextmenu', function(e) {
  if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
    e.preventDefault();
  }
});

function esVideo(url) {
  return extensionesVideo.some(ext => url.toLowerCase().includes(ext));
}

// Carga de metadatos desde fotos.json
fetch(rutaJson)
  .then(res => {
    if (!res.ok) throw new Error("Galería no encontrada");
    return res.json();
  })
  .then(data => {
    let listaArchivos = [];

    // Manejo flexible: acepta tanto objeto key-value como array de objetos
    if (Array.isArray(data)) {
      listaArchivos = data.map(item => typeof item === 'string' ? { url: item } : item);
    } else {
      listaArchivos = Object.keys(data).map(nombreArchivo => ({
        url: nombreArchivo,
        ...data[nombreArchivo]
      }));
    }

    listaArchivos.forEach(item => {
      if (item.visible === false) return; // Omitir ocultos

      const urlRelativa = item.url;
      const urlCompleta = `${rutaCarpeta}${urlRelativa}`;
      const titulo = item.title || item.titulo || '';
      const ubicacion = item.location || item.ubicacion || '';
      const fecha = item.date || item.fecha || '';
      const descripcion = item.description || item.descripcion || '';
      const poster = item.poster ? `${rutaCarpeta}${item.poster}` : '';

      const anchor = document.createElement('a');
      anchor.href = '#';
      
      const claseAzar = clasesTamano[Math.floor(Math.random() * clasesTamano.length)];
      if (claseAzar) anchor.classList.add(claseAzar);

      anchor.dataset.url = urlCompleta;
      anchor.dataset.titulo = titulo;
      anchor.dataset.ubicacion = ubicacion;
      anchor.dataset.fecha = fecha;
      anchor.dataset.descripcion = descripcion;
      anchor.dataset.esVideo = esVideo(urlRelativa);

      if (esVideo(urlRelativa)) {
        if (poster) {
          const img = document.createElement('img');
          img.src = poster;
          img.alt = titulo || 'Video';
          img.setAttribute('referrerpolicy', 'no-referrer');
          anchor.appendChild(img);
        } else {
          const video = document.createElement('video');
          video.src = urlCompleta;
          video.muted = true;
          video.preload = "metadata";
          video.playsInline = true;
          video.setAttribute('referrerpolicy', 'no-referrer');
          anchor.appendChild(video);
        }
      } else {
        const img = document.createElement('img');
        img.src = urlCompleta;
        img.alt = titulo || 'Fotografía';
        img.setAttribute('referrerpolicy', 'no-referrer');
        anchor.appendChild(img);
      }

      contenedorGaleria.appendChild(anchor);
    });

    inicializarEventos();
  })
  .catch(err => {
    console.error("Error al cargar fotos.json:", err);
    contenedorGaleria.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #94a3b8; margin-top: 2rem;">No se pudo cargar la galería "${galeriaActual}".</p>`;
  });

function manejarDobleTap() {
  const tiempoActual = new Date().getTime();
  const diferenciaTiempo = tiempoActual - ultimoToque;

  if (diferenciaTiempo < 350 && diferenciaTiempo > 0) {
    const links = contenedorGaleria.querySelectorAll('a');
    cerrarModal(links);
  }
  
  ultimoToque = tiempoActual;
}

function inicializarEventos() {
  const links = contenedorGaleria.querySelectorAll('a');

  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const url = this.dataset.url;
      const esVid = this.dataset.esVideo === 'true';

      if (esVid) {
        modalImg.style.display = 'none';
        modalImg.src = '';
        
        modalVideo.src = url;
        modalVideo.style.display = 'block';
        modalVideo.play().catch(() => {});
      } else {
        modalVideo.style.display = 'none';
        modalVideo.pause();
        modalVideo.src = '';
        
        modalImg.src = url;
        modalImg.style.display = 'block';
      }
      
      // Inyección de metadatos en la Propuesta 3
      elemTitulo.textContent = this.dataset.titulo;
      elemUbicacion.textContent = this.dataset.ubicacion ? `📍 ${this.dataset.ubicacion}` : '';
      elemFecha.textContent = this.dataset.fecha ? `📅 ${this.dataset.fecha}` : '';
      elemDesc.textContent = this.dataset.descripcion;

      overlay.classList.add('overlay');
      links.forEach(l => l.setAttribute('tabindex', -1));
    });
  });

  // Control de toque doble para cerrar
  modalVideo.addEventListener('touchstart', manejarDobleTap, { passive: true });
  modalVideo.addEventListener('click', manejarDobleTap);

  overlay.addEventListener('click', function(e) {
    const esModalVideo = modalVideo.style.display === 'block';

    if (e.target === overlay) {
      if (esModalVideo) {
        manejarDobleTap();
      } else {
        cerrarModal(links);
      }
    } else if (!esModalVideo && e.target !== modalImg) {
      cerrarModal(links);
    }
  });
}

function cerrarModal(links) {
  overlay.classList.remove('overlay');
  modalVideo.pause();
  modalVideo.src = '';
  modalImg.src = '';
  links.forEach(l => l.setAttribute('tabindex', 0));
}