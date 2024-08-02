export const updateFechaMes = (fecha) => {
  const options = { month: "long" };
  return new Date(fecha).toLocaleDateString("es-ES", options);
};
