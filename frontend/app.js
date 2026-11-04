const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
  obtenerSitios();
  configurarFormularioReserva();
  configurarBuscador();
});

// ==========================================
// 1. OBTENER Y RENDERIZAR SITIOS TURÍSTICOS
// ==========================================
async function obtenerSitios() {
  const contenedor = document.getElementById('contenedor-sitios');
  if (!contenedor) return;

  contenedor.innerHTML = '<p class="loading-text" style="grid-column: 1 / -1; text-align: center; font-size: 1.1rem; color: #555; padding: 20px;">⏳ Cargando destinos turísticos de Garzón...</p>';

  try {
    const respuesta = await fetch(`${API_URL}/sitios`);
    const sitios = await respuesta.json();

    contenedor.innerHTML = '';

    if (!Array.isArray(sitios) || sitios.length === 0) {
      contenedor.innerHTML = '<p class="loading-text" style="grid-column: 1 / -1; text-align: center;">No hay sitios turísticos disponibles en este momento.</p>';
      return;
    }

    sitios.forEach(sitio => {
      const tarjeta = document.createElement('div');
      tarjeta.classList.add('tarjeta-sitio');

      const token = localStorage.getItem('token');
      const botonEliminarHTML = token 
        ? `<button class="btn-eliminar" onclick="eliminarSitio('${sitio._id}')">🗑️ Eliminar</button>` 
        : '';

      const imagenUrl = sitio.imagen || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';

      tarjeta.innerHTML = `
        <div class="tarjeta-imagen-container">
          <img src="${imagenUrl}" alt="${sitio.nombre}">
        </div>
        <div class="tarjeta-contenido-interior">
          <div>
            <h3>${sitio.nombre}</h3>
            <span class="categoria">${sitio.categoria}</span>
            <p class="descripcion">${sitio.descripcion}</p>
          </div>
          <div>
            <p class="ubicacion">📍 <strong>Ubicación:</strong> ${sitio.ubicacion}</p>
            <div class="card-acciones">
              <button class="btn-detalles" onclick="abrirModalDetalle('${sitio._id}')">👁️ Explorar</button>
              <button class="btn-reservar" onclick="abrirModalReserva('${sitio._id}', '${sitio.nombre}', '${imagenUrl}')">📅 Reservar</button>
              ${botonEliminarHTML}
            </div>
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
// 2. BUSCADOR EN TIEMPO REAL
// ==========================================
function configurarBuscador() {
  const inputBuscar = document.getElementById('input-buscar');
  if (!inputBuscar) return;

  inputBuscar.addEventListener('input', (e) => {
    const texto = e.target.value.toLowerCase().trim();
    const tarjetas = document.querySelectorAll('.tarjeta-sitio');

    tarjetas.forEach(tarjeta => {
      const contenido = tarjeta.textContent.toLowerCase();
      tarjeta.style.display = contenido.includes(texto) ? 'flex' : 'none';
    });
  });
}

// ==========================================
// 3. GESTIÓN DEL MODAL DE DETALLES (MEJORADO CON FOTO Y PRECIO)
// ==========================================
async function abrirModalDetalle(id) {
  const modal = document.getElementById('modal-detalle');
  const contenido = document.getElementById('detalle-sitio-contenido');
  if (!modal || !contenido) return;

  try {
    const respuesta = await fetch(`${API_URL}/sitios`);
    const sitios = await respuesta.json();
    const sitio = sitios.find(s => s._id === id);

    if (sitio) {
      const imagenUrl = sitio.imagen || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';
      const precioTexto = sitio.precio ? sitio.precio : 'Consultar tarifa en el sitio';

      contenido.innerHTML = `
        <div class="modal-imagen-container" style="height: 250px; margin-bottom: 20px;">
          <img src="${imagenUrl}" alt="${sitio.nombre}" style="width:150%; height:100%; object-fit:cover; border-radius:12px;">
        </div>
        <h2 style="color: #1b4332; margin-top:0; font-size: 1.8rem;">${sitio.nombre}</h2>
        <span class="categoria" style="display:inline-block; margin-bottom: 15px;">${sitio.categoria}</span>
        
        <p style="color: #475569; font-size: 1rem; line-height: 1.6; margin-bottom: 15px;">
          <strong>Descripción:</strong> ${sitio.descripcion}
        </p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 15px; border-left: 4px solid #2d6a4f;">
          <p style="margin: 0 0 8px 0; color: #1b4332; font-size: 1.05rem;">
            💰 <strong>Precio / Entrada:</strong> <span style="color: #2d6a4f; font-weight: bold;">${precioTexto}</span>
          </p>
          <p style="margin: 0; color: #334155; font-size: 0.95rem;">
            📍 <strong>Ubicación:</strong> ${sitio.ubicacion}
          </p>
        </div>

        ${sitio.servicios ? `
          <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 20px;">
            🛠️ <strong>Servicios disponibles:</strong> ${Array.isArray(sitio.servicios) ? sitio.servicios.join(', ') : sitio.servicios}
          </p>` : ''}

        <button onclick="cerrarModalDetalle(); abrirModalReserva('${sitio._id}', '${sitio.nombre}', '${imagenUrl}')" class="btn-confirmar" style="width: 100%; padding: 12px; font-size: 1rem; cursor: pointer;">
          📅 Reservar este destino ahora
        </button>
      `;
      modal.style.display = 'flex';
    }
  } catch (error) {
    console.error('Error al obtener el detalle del sitio:', error);
  }
}

function cerrarModalDetalle() {
  const modal = document.getElementById('modal-detalle');
  if (modal) modal.style.display = 'none';
}

// ==========================================
// 4. GESTIÓN DEL MODAL DE RESERVA
// ==========================================
function abrirModalReserva(id, nombre, imagenUrl) {
  const inputLugar = document.getElementById('lugar');
  const labelNombre = document.getElementById('lugar-seleccionado-nombre');
  const imgModal = document.getElementById('modal-img-sitio');
  const mensajeDiv = document.getElementById('mensaje-reserva');
  const modal = document.getElementById('modal-reserva');

  if (inputLugar) inputLugar.value = id;
  if (labelNombre) labelNombre.textContent = `Destino: ${nombre}`;
  
  if (imgModal) {
    imgModal.src = imagenUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';
  }

  if (mensajeDiv) mensajeDiv.textContent = '';
  if (modal) modal.style.display = 'flex';
}

function cerrarModalReserva() {
  const modal = document.getElementById('modal-reserva');
  if (modal) modal.style.display = 'none';
}

// ==========================================
// 5. PROCESAR ENVÍO DE RESERVA
// ==========================================
function configurarFormularioReserva() {
  const formReserva = document.getElementById('form-reserva');
  if (!formReserva) return;

  formReserva.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    const reservaData = {
      lugar: document.getElementById('lugar').value,
      nombreUsuario: document.getElementById('nombreUsuario').value,
      correo: document.getElementById('correo').value,
      telefono: document.getElementById('telefono').value,
      fechaReserva: document.getElementById('fechaReserva').value,
      numeroPersonas: parseInt(document.getElementById('numeroPersonas').value, 10) || 1
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
// 6. ELIMINAR SITIO
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
// 7. NOTIFICACIONES TOAST Y EVENTOS
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

window.onclick = function(event) {
  const modalDetalle = document.getElementById('modal-detalle');
  const modalReserva = document.getElementById('modal-reserva');
  if (event.target === modalDetalle) cerrarModalDetalle();
  if (event.target === modalReserva) cerrarModalReserva();
};