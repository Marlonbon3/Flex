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

    console.log('[INFO] Datos Paso 1 cargados:', data.datos);
    return data.datos;
  } catch (error) {
    console.error('[ERROR] Error cargando Paso 1:', error);
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

    console.log('[INFO] Respuesta Paso 1:', data);

    if (!response.ok) {
      throw new Error(data.details || data.error || 'Error guardando Paso 1');
    }

    return { success: true, paso1ID: data.paso1ID };
  } catch (error) {
    console.error('[ERROR] Error Paso 1:', error);
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
    console.log('[PASO 3] INICIADO - Archivos recibidos:', archivos.length);
    console.log('[INFO] Leyendo archivos como Base64...');

    // Convertir archivos a Base64 antes de enviar
    const documentos = await Promise.all(
      archivos.map(file => 
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            // reader.result es: "data:image/png;base64,iVBORw0K..."
            // Extraer solo la parte Base64 (después del prefijo)
            let base64Content = reader.result;
            if (base64Content.includes(',')) {
              base64Content = base64Content.split(',')[1];
            }
            
            const doc = {
              nombre: file.name,
              tipo: file.type,
              tamaño: file.size,
              ruta: `/uploads/${file.name}`,
              contenido: base64Content // Solo Base64
            };
            console.log(`[OK] Archivo leído: ${file.name} (${file.size} bytes)`);
            resolve(doc);
          };
          reader.onerror = () => {
            console.error(`[ERROR] Error leyendo ${file.name}`);
            reject(new Error(`Error leyendo ${file.name}`));
          };
          reader.readAsDataURL(file);
        })
      )
    );

    console.log('[INFO] Todos los archivos leídos:', documentos.length);

    const payload = {
      paso1ID: contenedorID,
      documentos,
      usuarioID
    };

    console.log('[INFO] Enviando payload a /api/documentos:', {
      paso1ID: contenedorID,
      cantidadDocumentos: documentos.length,
      usuarioID
    });

    const response = await fetch(`${API_BASE_URL}/documentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('[INFO] Respuesta del servidor:', data);

    if (!response.ok) {
      console.error('[ERROR] Error en respuesta:', response.status, data);
      throw new Error(data.error || 'Error guardando Paso 3');
    }

    console.log('[OK] PASO 3 COMPLETADO - Status debe cambiar a Completado');
    return data;
  } catch (error) {
    console.error('[ERROR] Error Paso 3:', error);
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
  
  // Usar el sistema de toast de AlertProvider desde el componente que llame esta función
};

// ────────────────────────────────────────────────────────────────────
// 13. CATÁLOGOS - Listas configurables por admin
// ────────────────────────────────────────────────────────────────────
export const obtenerCatalogo = async (nombreLista) => {
  try {
    const response = await fetch(`${API_BASE_URL}/catalogos/${nombreLista}`);
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error GET catálogo:', error);
    return [];
  }
};

export const agregarItemCatalogo = async (nombreLista, valor, etiqueta, usuarioRol) => {
  try {
    const response = await fetch(`${API_BASE_URL}/catalogos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombreLista, valor, etiqueta, usuarioRol })
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const eliminarItemCatalogo = async (id, usuarioRol) => {
  try {
    const response = await fetch(`${API_BASE_URL}/catalogos/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioRol })
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ────────────────────────────────────────────────────────────────────
// 14. USUARIOS - Gestión de cuentas
// ────────────────────────────────────────────────────────────────────
export const obtenerUsuarios = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios`);
    const data = await response.json();
    return data.usuarios || [];
  } catch (error) {
    return [];
  }
};

export const crearUsuario = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const toggleActivoUsuario = async (id, activo) => {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}/activo`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo })
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ────────────────────────────────────────────────────────────────────
// 16. ARCHIVOS - Obtener y eliminar documentos de un contenedor
// ────────────────────────────────────────────────────────────────────
export const obtenerArchivos = async (paso1ID) => {
  try {
    const response = await fetch(`${API_BASE_URL}/archivos/${paso1ID}`);
    const data = await response.json();
    return data.archivos || [];
  } catch (error) {
    console.error('Error GET archivos:', error);
    return [];
  }
};

export const eliminarArchivo = async (archivoID) => {
  try {
    const response = await fetch(`${API_BASE_URL}/archivos/${archivoID}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      return { success: false, error: `Error ${response.status}: ${response.statusText}` };
    }
    return await response.json();
  } catch (error) {
    console.error('Error DELETE archivo:', error);
    return { success: false, error: error.message };
  }
};

// ────────────────────────────────────────────────────────────────────
// 15. REPORTES - Datos agregados
// ────────────────────────────────────────────────────────────────────
export const obtenerReportes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/reportes`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('Error GET reportes:', error);
    return null;
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
