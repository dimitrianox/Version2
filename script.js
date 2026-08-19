// --- CONFIGURACIÓN Y VARIABLES GLOBALES ---
const urlParams = new URLSearchParams(window.location.search);
const galeriaActual = urlParams.get('galeria') || 'brujas-2025';

// Definir ruta según el parámetro URL
const rutaJson = `./${galeriaActual}/fotos.json`;
const rutaCarpeta = `./${galeriaActual}/`;

const contenedorGaleria = document.getElementById('galeria');
const modal = document.querySelector('.modal');
const modalImg = document.getElementById('modal-img');
const modalVideo = document.getElementById('modal-video');

const infoUbicacion = document.getElementById('info-ubicacion');
const infoFecha = document.getElementById('info-fecha');
const infoTitulo = document.getElementById('info-titulo');
const infoDescripcion = document.getElementById('info-descripcion');

// Clases CSS para la grilla Masonry estilo mosaico
const clasesTamano = ['', '', 'span-col-2', 'span-row-2', 'span-big'];

// --- FUNCIONES AUXILIARES ---
function esVideo(url, tipo) {
  if (tipo === 'video') return true;
  return /\.(mp4|webm|ogg|mov)$/i.test(url);
}

function obtenerUrlCompleta(url, carpeta) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return carpeta + url;
}

// --- CARGA DE DATOS (FETCH) ---
fetch(rutaJson)
  .then(res => {
    if (!res.ok) throw new Error("Galería no encontrada");
    return res.json();
  })
  .then(data => {
    let listaArchivos = [];
    if (Array.isArray(data)) {
      listaArchivos = data;
    } else if (data && Array.isArray(data.items)) {
      listaArchivos = data.items;
    } else if (data && typeof data === 'object') {
      listaArchivos = Object.keys(data).map(k => ({ url: k, ...data[k] }));
    }

    listaArchivos.forEach(item => {
      if (item.visible === false) return;

      const urlOrigen = item.url || item.file;
      if (!urlOrigen) return;

      const urlCompleta = obtenerUrlCompleta(urlOrigen, rutaCarpeta);
      const titulo = item.title || item.titulo || '';
      const ubicacion = item.ubicacion || item.location || '';
      const fecha = item.fecha || item.date || '';
      const descripcion = item.descripcion || item.description || '';
      const poster = item.poster ? obtenerUrlCompleta(item.poster, rutaCarpeta) : '';

      const esVid = esVideo(urlOrigen, item.type);

      const anchor = document.createElement('a');
      anchor.href = '#';

      const claseAzar = clasesTamano[Math.floor(Math.random() * clasesTamano.length)];
      if (claseAzar) anchor.classList.add(claseAzar);

      anchor.dataset.url = urlCompleta;
      anchor.dataset.titulo = titulo;
      anchor.dataset.ubicacion = ubicacion;
      anchor.dataset.fecha = fecha;
      anchor.dataset.descripcion = descripcion;
      anchor.dataset.esVideo = esVid;

      if (esVid) {
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

// --- MANEJO DEL MODAL ---
function inicializarEventos() {
  contenedorGaleria.querySelectorAll('a').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();

      const url = anchor.dataset.url;
      const esVid = anchor.dataset.esVideo === 'true';

      infoUbicacion.textContent = anchor.dataset.ubicacion;
      infoFecha.textContent = anchor.dataset.fecha;
      infoTitulo.textContent = anchor.dataset.titulo;
      infoDescripcion.textContent = anchor.dataset.descripcion;

      if (esVid) {
        modalImg.style.display = 'none';
        modalImg.src = '';
        modalVideo.src = url;
        modalVideo.style.display = 'block';
        modalVideo.play();
      } else {
        modalVideo.pause();
        modalVideo.style.display = 'none';
        modalVideo.src = '';
        modalImg.src = url;
        modalImg.style.display = 'block';
      }

      modal.classList.add('overlay');
    });
  });
}

// Cerrar modal al hacer clic en el fondo
modal.addEventListener('click', (e) => {
  if (e.target === modal || e.target === modalImg) {
    modal.classList.remove('overlay');
    modalVideo.pause();
    modalVideo.src = '';
    modalImg.src = '';
  }
});