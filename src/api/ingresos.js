import axios from "./axios";

export const crearNuevaSalida = (data) => axios.post("/salidas", data);

export const crearNuevaRemuneracion = (data) =>
  axios.post("/crear-remuneracion", data);

export const crearRendicion = (data) => axios.post("/crear-rendicion", data);

export const crearNuevoLegal = (data) => axios.post("/crear-legal", data);

// export const obtenerIngresoRangoFechas = (fechaInicio, fechaFin) =>
//   axios.post("/ingresos/rango-fechas", fechaInicio, fechaFin);

export const obtenerSalidaMensual = () => axios.get("/salidas-mes");

// export const editarIngreso = (obtenerParams, data) =>
//   axios.put(`/ingresos/${obtenerParams}`, data);

export const obtenerUnicaSalida = (id) => axios.get(`/salidas/${id}`);

export const obtenerUnicaRemuneracion = (id) =>
  axios.get(`/remuneraciones/${id}`);

export const obtenerUnicaRendicion = (id) => axios.get(`/rendiciones/${id}`);

export const obtenerUnicaOrdenLegal = (id) => axios.get(`/legales/${id}`);

// export const eliminarIngreso = (id) => axios.delete(`/ingresos/${id}`);
