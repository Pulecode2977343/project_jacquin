
    // --- BUSCADOR INTERNO ---
    const input = document.getElementById('buscar');
    const contenido = document.getElementById('contenido');

    input.addEventListener('input', () => {
      const texto = input.value.toLowerCase();
      const inner = contenido.innerHTML.replace(/<mark>|<\/mark>/g, '');
      if (texto.trim() === '') {
        contenido.innerHTML = inner;
        return;
      }
      const regex = new RegExp(`(${texto})`, 'gi');
      contenido.innerHTML = inner.replace(regex, '<mark>$1</mark>');
    });

    // --- DESCARGA PDF ---
    document.getElementById('descargar').addEventListener('click', () => {
      if (!document.getElementById('aceptar').checked) {
        alert('Debes aceptar los términos antes de descargar.');
        return;
      }
      const element = document.getElementById('contenido');
      const opt = {
        margin: 10,
        filename: 'Terminos_Jacquin_Academia_Musical.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
    });