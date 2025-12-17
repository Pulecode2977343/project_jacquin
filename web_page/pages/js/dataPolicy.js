

  // Scripts: búsqueda, marcado y descarga PDF 

    // Función buscador y resaltado (simple)
    const input = document.getElementById('buscar');
    const contenido = document.getElementById('contenido');

    input.addEventListener('input', () => {
      const texto = input.value.trim();
      // Restaurar contenido original eliminando <mark>
      const innerClean = contenido.innerHTML.replace(/<mark>|<\/mark>/g, '');
      if (texto === '') {
        contenido.innerHTML = innerClean;
        return;
      }
      // Evitar inyección: escapamos la búsqueda
      const escaped = texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp('(' + escaped + ')', 'gi');
      contenido.innerHTML = innerClean.replace(regex, '<mark>$1</mark>');
    });

    // Descargar PDF (requiere html2pdf)
    document.getElementById('descargar').addEventListener('click', () => {
      if (!document.getElementById('aceptar').checked) {
        alert('Debe aceptar la Política de Tratamiento de Datos antes de descargar.');
        return;
      }
      const element = document.getElementById('contenido');
      const opt = {
        margin: 10,
        filename: 'Política_Tratamiento_Datos_Jacquin_Academia_Musical.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
    });
  

  // Librería CDN para html2pdf 
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js"></script>