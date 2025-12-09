// script.js

// Espera a que el contenido de la página esté cargado
document.addEventListener("DOMContentLoaded", function () {
  console.log("Página cargada correctamente.");
  
  // Mensaje de bienvenida ficticio (Se puede quitar)
  alert("Bienvenido al sistema de gestión de la Academia Musical JACQUIN.");
}); 

function accesoModulo(modulo) {
  if (modulo === "interesados") {
    const contacto = prompt("Por favor, ingrese su correo o número de contacto:");
    if (contacto) {
      alert("Gracias. Pronto nos comunicaremos contigo a " + contacto);
    } else {
      alert("Debes ingresar un correo o número para continuar.");
    }
  } else {
    const usuario = prompt("Ingrese su usuario para el módulo de " + modulo);
    const clave = prompt("Ingrese su clave");
    
    if (usuario && clave) {
      // Aquí puedes agregar lógica real de validación en el futuro
      alert("Bienvenido al módulo de " + modulo + ", " + usuario + ".");
    } else {
      alert("Debes ingresar usuario y clave para acceder.");
    }
  }
}