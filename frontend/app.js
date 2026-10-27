// Configuración de la URL de tu backend en Express
const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
  obtenerSitios();
  configurarFormularioReserva();
});

// ==========================================
// 1. OBTENER Y RENDERIZAR SITIOS TURÍSTICOS
// ==========================================
async function obtenerSitios() {
  const contenedor = document.getElementById('contenedor-sitios');

  // Mostrar mensaje de carga antes de la petición fetch
  contenedor.innerHTML = '<p class="loading-text" style="grid-column: 1 / -1; text-align: center; font-size: 1.1rem; color: #555; padding: 20px;">⏳ Cargando destinos turísticos de Garzón...</p>';

  try {
    const respuesta = await fetch(`${API_URL}/sitios`);
    const sitios = await respuesta.json();

    contenedor.innerHTML = ''; // Limpiar el indicador de carga

    if (sitios.length === 0) {
      contenedor.innerHTML = '<p class="loading-text" style="grid-column: 1 / -1; text-align: center;">No hay sitios turísticos disponibles en este momento.</p>';
      return;
    }

    sitios.forEach(sitio => {
      const tarjeta = document.createElement('div');
      tarjeta.classList.add('tarjeta-sitio');

      // Verificar si hay token de admin guardado en el navegador
      const token = localStorage.getItem('token');
      const botonEliminarHTML = token 
        ? `<button class="btn-eliminar" onclick="eliminarSitio('${sitio._id}')">🗑️ Eliminar</button>` 
        : ''; // Si no hay token, el botón de eliminar se oculta

      tarjeta.innerHTML = `
        <div class="card-body">
          <h3>${sitio.nombre}</h3>
          <span class="categoria">${sitio.categoria}</span>
          <p class="descripcion">${sitio.descripcion}</p>
          <p class="ubicacion">📍 <strong>Ubicación:</strong> ${sitio.ubicacion}</p>
          
          <div class="card-acciones" style="margin-top: 15px; display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn-detalles" onclick="abrirModalDetalle('${sitio._id}')">👁️ Ver Detalle</button>
            <button class="btn-reservar" onclick="abrirModalReserva('${sitio._id}', '${sitio.nombre}')">📅 Reservar</button>
            ${botonEliminarHTML}
          </div>
        </div>
      `;

      contenedor.appendChild(tarjeta);
    });
  } catch (error) {
    console.error('Error al conectar con el backend:', error);
    contenedor.innerHTML = '<p class="error" style="grid-column: 1 / -1; text-align: center; color: #dc3545;">❌ No se pudo conectar con el servidor backend. Revisa que esté activo en el puerto 3000.</p>';
  }
}

// ==========================================
// 2. GESTIÓN DEL MODAL DE DETALLES
// ==========================================
async function abrirModalDetalle(id) {
  const modal = document.getElementById('modal-detalle');
  const contenido = document.getElementById('detalle-sitio-contenido');

  try {
    const respuesta = await fetch(`${API_URL}/sitios`);
    const sitios = await respuesta.json();
    const sitio = sitios.find(s => s._id === id);

    if (sitio) {
      contenido.innerHTML = `
        <h2>${sitio.nombre}</h2>
        <p><strong>Categoría:</strong> ${sitio.categoria}</p>
        <p><strong>Descripción:</strong> ${sitio.descripcion}</p>
        <p><strong>Ubicación:</strong> ${sitio.ubicacion}</p>
        ${sitio.servicios ? `<p><strong>Servicios disponibles:</strong> ${Array.isArray(sitio.servicios) ? sitio.servicios.join(', ') : sitio.servicios}</p>` : ''}
      `;
      modal.style.display = 'block';
    }
  } catch (error) {
    console.error('Error al obtener el detalle del sitio:', error);
  }
}

function cerrarModalDetalle() {
  document.getElementById('modal-detalle').style.display = 'none';
}

// ==========================================
// 3. GESTIÓN DEL MODAL DE RESERVA
// ==========================================
function abrirModalReserva(id, nombre) {
  document.getElementById('lugar').value = id;
  document.getElementById('lugar-seleccionado-nombre').textContent = `Destino: ${nombre}`;
  document.getElementById('mensaje-reserva').textContent = '';
  document.getElementById('modal-reserva').style.display = 'block';
}

function cerrarModalReserva() {
  document.getElementById('modal-reserva').style.display = 'none';
}

// ==========================================
// 4. PROCESAR ENVÍO DE RESERVA (POST /api/reservas)
// ==========================================
function configurarFormularioReserva() {
  const formReserva = document.getElementById('form-reserva');
  if (!formReserva) return;

  formReserva.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const mensajeDiv = document.getElementById('mensaje-reserva');

    const reservaData = {
      lugar: document.getElementById('lugar').value,
      nombreUsuario: document.getElementById('nombreUsuario').value,
      correo: document.getElementById('correo').value,
      telefono: document.getElementById('telefono').value,
      fechaReserva: document.getElementById('fechaReserva').value,
      numeroPersonas: document.getElementById('numeroPersonas').value
    };

    try {
      const respuesta = await fetch(`${API_URL}/reservas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(reservaData)
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        mostrarNotificacion('✅ ¡Solicitud de reserva enviada con éxito!');
        formReserva.reset();
        setTimeout(() => cerrarModalReserva(), 1500);
      } else {
        mostrarNotificacion(`❌ ${resultado.error || 'Error al procesar la reserva'}`, true);
      }
    } catch (error) {
      console.error('Error al enviar la reserva:', error);
      mostrarNotificacion('❌ Error de conexión al enviar la reserva', true);
    }
  });
}

// ==========================================
// 5. ELIMINAR UN SITIO (DELETE /api/sitios/:id)
// ==========================================
async function eliminarSitio(id) {
  const token = localStorage.getItem('token');

  if (!confirm('¿Estás seguro de que deseas eliminar este sitio turístico?')) return;

  try {
    const respuesta = await fetch(`${API_URL}/sitios/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const resultado = await respuesta.json();

    if (respuesta.ok) {
      mostrarNotificacion('✅ Sitio turístico eliminado correctamente');
      obtenerSitios();
    } else {
      mostrarNotificacion(`❌ ${resultado.error || 'No tienes permisos para eliminar este sitio'}`, true);
    }
  } catch (error) {
    console.error('Error al eliminar:', error);
    mostrarNotificacion('❌ Ocurrió un error al intentar eliminar el sitio', true);
  }
}

// ==========================================
// 6. NOTIFICACIONES Y EVENTOS
// ==========================================
function mostrarNotificacion(mensaje, esError = false) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = mensaje;
  toast.style.backgroundColor = esError ? '#dc3545' : '#28a745';
  toast.classList.add('mostrar');

  setTimeout(() => {
    toast.classList.remove('mostrar');
  }, 3500);
}

// Cerrar modales si el usuario hace clic fuera de la ventana
window.onclick = function(event) {
  const modalDetalle = document.getElementById('modal-detalle');
  const modalReserva = document.getElementById('modal-reserva');
  if (event.target === modalDetalle) cerrarModalDetalle();
  if (event.target === modalReserva) cerrarModalReserva();
};