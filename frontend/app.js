const API_URL = 'http://localhost:3000/api';

// 1. Cargar Sitios Turísticos desde el Backend
async function cargarSitios() {
  const contenedor = document.getElementById('contenedor-sitios');
  try {
    const respuesta = await fetch(`${API_URL}/sitios`);
    const sitios = await respuesta.json();

    if (sitios.length === 0) {
      contenedor.innerHTML = '<p>No hay sitios turísticos registrados aún.</p>';
      return;
    }

    contenedor.innerHTML = '';
    sitios.forEach(sitio => {
      contenedor.innerHTML += `
        <div class="card">
          <img src="${sitio.imagen || 'https://via.placeholder.com/300x180?text=TurisPlaY'}" alt="${sitio.nombre}">
          <div class="card-body">
            <h3>${sitio.nombre}</h3>
            <p><strong>Categoría:</strong> ${sitio.categoria}</p>
            <p>${sitio.descripcion}</p>
            <p>📍 <em>${sitio.ubicacion}</em></p>
          </div>
        </div>
      `;
    });
  } catch (error) {
    console.error('Error al obtener los sitios:', error);
    contenedor.innerHTML = '<p style="color:red;">Error de conexión con el servidor backend.</p>';
  }
}

// 2. Enviar Reserva al Backend
const formReserva = document.getElementById('form-reserva');
const mensajeReserva = document.getElementById('mensaje-reserva');

formReserva.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nuevaReserva = {
    nombreUsuario: document.getElementById('nombreUsuario').value,
    correo: document.getElementById('correo').value,
    telefono: document.getElementById('telefono').value,
    lugar: document.getElementById('lugar').value,
    fechaReserva: document.getElementById('fechaReserva').value,
    numeroPersonas: parseInt(document.getElementById('numeroPersonas').value)
  };

  try {
    const respuesta = await fetch(`${API_URL}/reservas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nuevaReserva)
    });

    if (respuesta.ok) {
      mensajeReserva.style.color = 'green';
      mensajeReserva.textContent = '¡Reserva creada exitosamente en TurisPlaY! 🎉';
      formReserva.reset();
    } else {
      const data = await respuesta.json();
      mensajeReserva.style.color = 'red';
      mensajeReserva.textContent = `Error: ${data.error || 'No se pudo crear la reserva.'}`;
    }
  } catch (error) {
    console.error('Error al enviar la reserva:', error);
    mensajeReserva.style.color = 'red';
    mensajeReserva.textContent = 'Error de conexión con el servidor.';
  }
});

// Cargar sitios al abrir la página
document.addEventListener('DOMContentLoaded', cargarSitios);