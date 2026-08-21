// --- CONFIGURACIÓN Y VARIABLES GLOBALES ---
const urlParams = new URLSearchParams(window.location.search);
const galeriaActual = urlParams.get('galeria') || 'francia';

const rutaJson = `./${galeriaActual}/fotos.json`;
const rutaCarpeta = `./${galeriaActual}/`;

const tituloPais = document.getElementById('titulo-pais');
const contenedorGaleria = document.getElementById('galeria');
const modal = document.querySelector('.modal');
const modalImg = document.getElementById('modal-img');
const modalVideo = document.getElementById('modal-video');

const infoUbicacion = document.getElementById('info-ubicacion');
const infoFecha = document.getElementById('info-fecha');
const infoTitulo = document.getElementById('info-titulo');
const infoDescripcion = document.getElementById('info-descripcion');

const clasesTamano = ['', '', 'span-col-2', 'span-row-2', 'span-big'];

document.addEventListener('contextmenu', function(e) {
  if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO' || e.target.closest('.modal')) {
    e.preventDefault();
  }
}, false);

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

function formatearFecha(fechaOriginal) {
  if (!fechaOriginal) return '';
  const parteFecha = fechaOriginal.split(' ')[0];
  const partes = parteFecha.split(/[:\/-]/);
  if (partes.length === 3) {
    const [anio, mes, dia] = partes;
    return `${dia}/${mes}/${anio}`;
  }
  return fechaOriginal;
}

function mezclarArray(array) {
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function cerrarModal() {
  modal.classList.remove('overlay');
  modalVideo.pause();
  modalVideo.src = '';
  modalImg.src = '';
}

// --- CARGA DE DATOS (FETCH) ---
fetch(rutaJson)
  .then(res => {
    if (!res.ok) throw new Error("Galería no encontrada");
    return res.json();
  })
  .then(data => {
    let listaArchivos = [];
    
    // Asignación dinámica del título del país
    if (data && data.pais) {
      tituloPais.textContent = data.pais;
    } else {
      tituloPais.textContent = galeriaActual.replace('-', ' ');
    }

    if (Array.isArray(data)) {
      listaArchivos = data;
    } else if (data && Array.isArray(data.items)) {
      listaArchivos = data.items;
    } else if (data && typeof data === 'object') {
      listaArchivos = Object.keys(data).map(k => ({ url: k, ...data[k] }));
    }

    const listaAleatoria = mezclarArray(listaArchivos);

    listaAleatoria.forEach(item => {
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
          video.src = `${urlCompleta}#t=0.1`;
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
        img.loading = 'lazy';
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

function inicializarEventos() {
  contenedorGaleria.querySelectorAll('a').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();

      const url = anchor.dataset.url;
      const esVid = anchor.dataset.esVideo === 'true';

      const ubicacionLimpia = anchor.dataset.ubicacion ? `📍 ${anchor.dataset.ubicacion}` : '';
      infoUbicacion.textContent = ubicacionLimpia;
      infoFecha.textContent = formatearFecha(anchor.dataset.fecha);
      infoTitulo.textContent = anchor.dataset.titulo;

      const desc = anchor.dataset.descripcion;
      if (desc) {
        infoDescripcion.textContent = desc;
        infoDescripcion.style.display = 'block';
      } else {
        infoDescripcion.textContent = '';
        infoDescripcion.style.display = 'none';
      }

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

modalImg.addEventListener('click', (e) => {
  e.stopPropagation();
  cerrarModal();
});

modal.addEventListener('click', (e) => {
  if (e.target === modal || e.target.classList.contains('modal-media-wrapper')) {
    cerrarModal();
  }
});

let ultimoToqueVideo = 0;
modalVideo.addEventListener('touchend', function(e) {
  const tiempoActual = new Date().getTime();
  const diferenciaToques = tiempoActual - ultimoToqueVideo;

  if (diferenciaToques < 300 && diferenciaToques > 0) {
    e.preventDefault();
    cerrarModal();
  }
  ultimoToqueVideo = tiempoActual;
});