document.addEventListener("DOMContentLoaded", () => {
  // Configuración del observador de scroll
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 // Se activa cuando el 15% de la foto entra en la pantalla
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Añade la clase que activa el Fade-in Up en CSS
        entry.target.classList.add('is-visible');
        
        // Dejamos de observar la imagen una vez que ya apareció (para no repetir la animación)
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Seleccionamos todos los items de la galería y los observamos
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach(item => {
    observer.observe(item);
  });
});