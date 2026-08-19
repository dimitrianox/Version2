// Función para dar formato elegante a la fecha (Ej: 12 MAY 2025)
function formatearFecha(fechaStr) {
  if (!fechaStr) return '';
  // Si viene en formato EXIF "2025:05:12 13:25:30"
  const partes = fechaStr.split(' ')[0].split(':');
  if (partes.length === 3) {
    const [anio, mes, dia] = partes;
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const idxMes = parseInt(mes, 10) - 1;
    if (idxMes >= 0 && idxMes < 12) {
      return `${parseInt(dia, 10)} ${meses[idxMes]} ${anio}`;
    }
  }
  return fechaStr;
}

// Dentro del fetch en script.js, reemplaza la asignación de variables:
listaArchivos.forEach(item => {
  if (item.visible === false) return;

  const urlOrigen = item.url || item.file;
  if (!urlOrigen) return;

  const urlCompleta = obtenerUrlCompleta(urlOrigen, rutaCarpeta);
  
  // Limpia el título: Si el título es el nombre de archivo GUID o UUID, no muestra texto feo
  let titulo = item.title || item.titulo || '';
  const esNombreArchivoFeo = /^[0-9A-F]{8}-[0-9A-F]{4}/i.test(titulo) || titulo === item.file;
  if (esNombreArchivoFeo) {
    titulo = ''; // O asigna un título por defecto si lo prefieres
  }

  const ubicacion = item.location || item.ubicacion || (galeriaActual.charAt(0).toUpperCase() + galeriaActual.slice(1));
  const fechaFormateada = formatearFecha(item.date || item.fecha || '');
  const descripcion = item.description || item.descripcion || '';
  const poster = item.poster ? obtenerUrlCompleta(item.poster, rutaCarpeta) : '';

  const esVid = esVideo(urlOrigen, item.type);

  const anchor = document.createElement('a');
  anchor.href = '#';
  
  const claseAzar = clasesTamano[Math.floor(Math.random() * clasesTamano.length)];
  if (claseAzar) anchor.classList.add(claseAzar);

  anchor.dataset.url = urlCompleta;
  anchor.dataset.titulo = titulo;
  anchor.dataset.ubicacion = ubicacion;
  anchor.dataset.fecha = fechaFormateada;
  anchor.dataset.descripcion = descripcion;
  anchor.dataset.esVideo = esVid;

  // Renderizado del elemento...
  if (esVid) {
    if (poster) {
      const img = document.createElement('img');
      img.src = poster;
      img.alt = titulo;
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
    img.alt = titulo;
    img.setAttribute('referrerpolicy', 'no-referrer');
    anchor.appendChild(img);
  }

  contenedorGaleria.appendChild(anchor);
});