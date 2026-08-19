fetch(rutaJson)
  .then(res => {
    if (!res.ok) throw new Error("Galería no encontrada");
    return res.json();
  })
  .then(data => {
    // Soporta tanto array directo [...] como wrapper con { items: [...] } u objetos
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