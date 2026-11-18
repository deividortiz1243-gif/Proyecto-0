import api from './api';

export const obtenerSitios = async () => {
  const respuesta = await api.get('/turisplay/sitios');
  return respuesta.data;
};
