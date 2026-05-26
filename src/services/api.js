// ====================================================================
// SERVICIO API - Conexión con backend Node.js
// Archivo: src/services/api.js
// ====================================================================

const API_BASE_URL = 'http://localhost:5000/api';

// ────────────────────────────────────────────────────────────────────
// 1. VERIFICAR CONEXIÓN CON SERVIDOR
// ────────────────────────────────────────────────────────────────────
export const verificarConexion = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ────────────────────────────────────────────────────────────────────
// 1.5. CARGAR PASO 1 COMPLETO (para edición)
// ────────────────────────────────────────────────────────────────────
export const cargarPaso1 = async (paso1ID) => {
  try {
    const response = await fetch(`${API_BASE_URL}/contenedores/${paso1ID}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error cargando Paso 1');
    }

    console.log('📥 Datos Paso 1 cargados:', data.datos);
    return data.datos;
  } catch (error) {
    console.error('❌ Error cargando Paso 1:', error);
    return null;
  }
};

// ────────────────────────────────────────────────────────────────────
// 2. GUARDAR PASO 1 (Datos Contenedor)
// ────────────────────────────────────────────────────────────────────
export const guardarPaso1 = async (formData, usuarioID = 1) => {
  try {
    const payload = {
      ...formData,
      usuarioID
    };

    console.log('📤 Enviando Paso 1:', payload);

    const response = await fetch(`${API_BASE_URL}/contenedores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    console.log('📥 Respuesta Paso 1:', data);

    if (!response.ok) {
      throw new Error(data.details || data.error || 'Error guardando Paso 1');
    }

    return { success: true, paso1ID: data.paso1ID };
  } catch (error) {
    console.error('❌ Error Paso 1:', error);
    return { success: false, error: error.message };
  }
};

// ────────────────────────────────────────────────────────────────────
// 3. GUARDAR PASO 2 (Inspección + Firma)
// ────────────────────────────────────────────────────────────────────
export const guardarPaso2 = async (inspeccionData, usuarioID = 1) => {
  try {
    const payload = {
      ...inspeccionData,
      usuarioID
    };

    const response = await fetch(`${API_BASE_URL}/inspeccion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error guardando Paso 2');
    }

    return { success: true, paso2ID: data.paso2ID };
  } catch (error) {
    console.error('Error Paso 2:', error);
    return { success: false, error: error.message };
  }
};

// ────────────────────────────────────────────────────────────────────
// 4. GUARDAR PASO 3 (Documentos)
// ────────────────────────────────────────────────────────────────────
export const guardarPaso3 = async (contenedorID, archivos, usuarioID = 1) => {
  try {
    // Convertir archivos a objeto para enviar al servidor
    const documentos = archivos.map(file => ({
      nombre: file.name,
      tipo: file.type,
      tamaño: file.size,
      ruta: `/uploads/${file.name}`
    }));

    const payload = {
      contenedorID,
      documentos,
      usuarioID
    };

    const response = await fetch(`${API_BASE_URL}/documentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error guardando Paso 3');
    }

    return data;
  } catch (error) {
    console.error('Error Paso 3:', error);
    return { success: false, error: error.message };
  }
};

// ────────────────────────────────────────────────────────────────────
// 5. OBTENER CONTENEDOR COMPLETO (por ID)
// ────────────────────────────────────────────────────────────────────
export const obtenerContenedor = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/contenedores/${id}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error obteniendo contenedor');
    }

    return data;
  } catch (error) {
    console.error('Error GET contenedor:', error);
    return { success: false, error: error.message };
  }
};

// ────────────────────────────────────────────────────────────────────
// 6. OBTENER TODOS LOS CONTENEDORES
// ────────────────────────────────────────────────────────────────────
export const obtenerTodosLosContenedores = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/contenedores`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error obteniendo contenedores');
    }

    return data.datos || [];
  } catch (error) {
    console.error('Error GET todos los contenedores:', error);
    return [];
  }
};

// ────────────────────────────────────────────────────────────────────
// 8. ARCHIVAR CONTENEDOR
// ────────────────────────────────────────────────────────────────────
export const archivarContenedor = async (contenedorID) => {
  try {
    const response = await fetch(`${API_BASE_URL}/contenedores/${contenedorID}/archivar`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error archivando contenedor');
    }

    return data;
  } catch (error) {
    console.error('Error archivando:', error);
    return { success: false, error: error.message };
  }
};

// ────────────────────────────────────────────────────────────────────
// 9. ELIMINAR CONTENEDOR
// ────────────────────────────────────────────────────────────────────
export const eliminarContenedor = async (contenedorID) => {
  try {
    const response = await fetch(`${API_BASE_URL}/contenedores/${contenedorID}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error eliminando contenedor');
    }

    return data;
  } catch (error) {
    console.error('Error eliminando:', error);
    return { success: false, error: error.message };
  }
};

// ────────────────────────────────────────────────────────────────────
// 10. ACTUALIZAR ESTADO (cuando se completan pasos)
// ────────────────────────────────────────────────────────────────────
export const actualizarEstado = async (contenedorID, paso, completado) => {
  try {
    const response = await fetch(`${API_BASE_URL}/contenedores/${contenedorID}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paso,
        completado
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error actualizando estado');
    }

    return data;
  } catch (error) {
    console.error('Error actualizando estado:', error);
    return { success: false, error: error.message };
  }
};

// ────────────────────────────────────────────────────────────────────
// 8. ACTUALIZAR PASO 1 (Para edición de contenedores existentes)
// ────────────────────────────────────────────────────────────────────
export const actualizarPaso1 = async (contenedorID, formData, usuarioID = 1) => {
  try {
    const payload = {
      ...formData,
      usuarioID
    };

    const response = await fetch(`${API_BASE_URL}/contenedores/${contenedorID}/paso1`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error actualizando Paso 1');
    }

    return data;
  } catch (error) {
    console.error('Error actualizar Paso 1:', error);
    return { success: false, error: error.message };
  }
};

// ────────────────────────────────────────────────────────────────────
// 9. LOGIN - Autenticar usuario
// ────────────────────────────────────────────────────────────────────
export const loginUsuario = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error en autenticación');
    }

    // Guardar datos de usuario en localStorage
    if (data.success && data.usuario) {
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      localStorage.setItem('usuarioID', data.usuario.id);
    }

    return data;
  } catch (error) {
    console.error('Error login:', error);
    return { success: false, error: error.message };
  }
};

// ────────────────────────────────────────────────────────────────────
// 10. LOGOUT - Salir del sistema
// ────────────────────────────────────────────────────────────────────
export const logoutUsuario = () => {
  localStorage.removeItem('usuario');
  localStorage.removeItem('usuarioID');
  return { success: true };
};

// ────────────────────────────────────────────────────────────────────
// 11. OBTENER USUARIO ACTUAL
// ────────────────────────────────────────────────────────────────────
export const obtenerUsuarioActual = () => {
  const usuarioJSON = localStorage.getItem('usuario');
  if (usuarioJSON) {
    try {
      return JSON.parse(usuarioJSON);
    } catch (e) {
      return null;
    }
  }
  return null;
};

// ────────────────────────────────────────────────────────────────────
// 12. FUNCIÓN AUXILIAR - PROCESAR ERROR
// ────────────────────────────────────────────────────────────────────
export const procesarError = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  if (error.error) {
    return error.error;
  }
  return 'Error desconocido. Verifica la consola.';
};

// ────────────────────────────────────────────────────────────────────
// 7. FUNCIÓN AUXILIAR - MOSTRAR MENSAJE
// ────────────────────────────────────────────────────────────────────
export const mostrarMensaje = (titulo, mensaje, tipo = 'info') => {
  const icono = tipo === 'success' ? '✓' : tipo === 'error' ? '✗' : 'ℹ';
  console.log(`${icono} [${titulo}] ${mensaje}`);
  
  // Aquí puedes agregar una notificación visual (toast)
  // Por ahora solo mostramos en consola y alert
  if (tipo === 'success') {
    alert(`✓ ${titulo}\n${mensaje}`);
  } else if (tipo === 'error') {
    alert(`✗ ${titulo}\n${mensaje}`);
  }
};

export default {
  verificarConexion,
  guardarPaso1,
  guardarPaso2,
  guardarPaso3,
  obtenerContenedor,
  procesarError,
  mostrarMensaje
};
