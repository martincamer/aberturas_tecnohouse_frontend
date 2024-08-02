export const formatearDinero = (dinero) => {
  return dinero?.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });
};
