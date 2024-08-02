import axios from "./axios";

export const crearNuevaOrden = (data) => axios.post("/ordenes", data);

export const obtenerOrdenMensual = () => axios.get("/ordenes-mes");

// export const obtenerIngresoRangoFechas = (fechaInicio, fechaFin) =>
//   axios.post("/ingresos/rango-fechas", fechaInicio, fechaFin);

// // export const editarIngreso = (obtenerParams, data) =>
// //   axios.put(`/ingresos/${obtenerParams}`, data);

// export const obtenerUnicaSalida = (id) => axios.get(`/salidas/${id}`);

// export const obtenerUnicaRemuneracion = (id) =>
//   axios.get(`/remuneraciones/${id}`);

// // export const eliminarIngreso = (id) => axios.delete(`/ingresos/${id}`);
