import { useState } from "react";
import { useAberturasContext } from "../../../context/AberturasProvider";
import { useAuth } from "../../../context/AuthProvider";

export const Home = () => {
  const { aberturas, salidas } = useAberturasContext();
  const { user } = useAuth();

  let filteredData;
  let filteredDataSalidas;

  // Obtener el primer día del mes actual
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  // Convertir las fechas en formato YYYY-MM-DD para los inputs tipo date
  const fechaInicioPorDefecto = firstDayOfMonth.toISOString().split("T")[0];
  const fechaFinPorDefecto = lastDayOfMonth.toISOString().split("T")[0];

  const [fechaInicio, setFechaInicio] = useState(fechaInicioPorDefecto);
  const [fechaFin, setFechaFin] = useState(fechaFinPorDefecto);

  const handleFechaInicioChange = (e) => {
    setFechaInicio(e.target.value);
  };

  const handleFechaFinChange = (e) => {
    setFechaFin(e.target.value);
  };

  // Filtrar por rango de fechas
  if (fechaInicio && fechaFin) {
    const fechaInicioObj = new Date(fechaInicio);
    const fechaFinObj = new Date(fechaFin);
    filteredData = aberturas.filter((item) => {
      const fechaOrden = new Date(item.created_at);
      return fechaOrden >= fechaInicioObj && fechaOrden <= fechaFinObj;
    });

    filteredDataSalidas = salidas.filter((item) => {
      const fechaOrden = new Date(item.created_at);
      return fechaOrden >= fechaInicioObj && fechaOrden <= fechaFinObj;
    });
  }

  // Calcular el total del stock
  const totalStock = aberturas.reduce((total, abertura) => {
    // Convertir stock a número si es una cadena
    const stockNumerico =
      typeof abertura.stock === "string"
        ? parseInt(abertura.stock, 10)
        : abertura.stock;

    // Sumar al total
    return total + (isNaN(stockNumerico) ? 0 : stockNumerico);
  }, 0);

  // Función para calcular el total de cantidades
  const calcularTotalCantidad = (salidas) => {
    return salidas.reduce((total, salida) => {
      // Parsear el campo 'aberturas'
      const aberturas = JSON.parse(salida.aberturas);

      // Calcular el total de cantidades en esta salida
      const totalCantidadSalida = aberturas.reduce((subtotal, abertura) => {
        // Verificar que 'cantidad' es un array
        if (Array.isArray(abertura.cantidad)) {
          // Reducir la cantidad en cada abertura
          const cantidadTotalAbertura = abertura.cantidad.reduce(
            (sum, cantidad) => {
              const cantidadNumerica = parseInt(cantidad, 10);
              return sum + (isNaN(cantidadNumerica) ? 0 : cantidadNumerica);
            },
            0
          );

          // Sumar al subtotal
          return subtotal + cantidadTotalAbertura;
        } else {
          // Si 'cantidad' no es un array, tratar como un valor único
          const cantidadNumerica = parseInt(abertura.cantidad, 10);
          return subtotal + (isNaN(cantidadNumerica) ? 0 : cantidadNumerica);
        }
      }, 0);

      // Sumar al total general
      return total + totalCantidadSalida;
    }, 0);
  };

  // Calcular y mostrar el total
  const totalCantidad = calcularTotalCantidad(filteredDataSalidas);

  // Función para calcular la cantidad de aberturas entregadas por fábrica
  const calcularCantidadPorFabrica = (salidas) => {
    return salidas.reduce((acc, salida) => {
      const aberturas = JSON.parse(salida.aberturas);

      // Agrupar por fábrica
      if (!acc[salida.fabrica]) {
        acc[salida.fabrica] = 0;
      }

      // Sumar las cantidades de aberturas para esta fábrica
      const totalCantidadSalida = aberturas.reduce((subtotal, abertura) => {
        const cantidadNumerica = parseInt(abertura.cantidad, 10);
        return subtotal + (isNaN(cantidadNumerica) ? 0 : cantidadNumerica);
      }, 0);

      acc[salida.fabrica] += totalCantidadSalida;
      return acc;
    }, {});
  };

  const cantidadPorFabrica = calcularCantidadPorFabrica(filteredDataSalidas);

  return (
    <section className="w-full h-full min-h-screen max-h-full max-w-full">
      {user.fabrica === "aberturas" && (
        <>
          <div className=" bg-gray-100 py-10 px-6 max-md:py-10 max-md:px-4 flex justify-between items-center">
            <p className="font-bold text-gray-800 text-xl max-md:text-base">
              Estadísticas de las aberturas, salidas y stock.
            </p>
            <p className="font-bold max-md:hidden">Fecha actual {}</p>
          </div>
          <div className="flex pt-10 px-10 max-md:px-5">
            <div className="flex gap-3">
              <div className="border border-gray-300 flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md outline-none font-semibold">
                <input
                  value={fechaInicio}
                  onChange={handleFechaInicioChange}
                  type="date"
                  className="outline-none text-slate-600 w-full max-md:text-sm uppercase bg-white"
                  placeholder="Fecha de inicio"
                />
              </div>
              <div className="border border-gray-300 flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md outline-none font-semibold">
                <input
                  value={fechaFin}
                  onChange={handleFechaFinChange}
                  type="date"
                  className="outline-none text-slate-600 w-full max-md:text-sm uppercase bg-white"
                  placeholder="Fecha fin"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-5 px-10 py-5 gap-3 max-md:px-5 max-md:grid-cols-1">
            <div className="border border-gray-300 rounded-md py-5 px-5">
              <div>
                <p className="font-medium text-blue-500 text-lg">
                  Total de aberturas en fábrica.
                </p>
              </div>
              <div>
                <p className="font-extrabold text-gray-800 text-lg">
                  {totalStock}
                </p>
              </div>
            </div>{" "}
            <div className="border border-gray-300 rounded-md py-5 px-5">
              <div>
                <p className="font-medium text-blue-500 text-lg">
                  Total de salidas - entregas.
                </p>
              </div>
              <div>
                <p className="font-extrabold text-gray-800 text-lg">
                  {totalCantidad}
                </p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-md py-5 px-5">
              <div>
                <p className="font-medium text-gray-200 text-lg">
                  Total stock + salidas/entregas.
                </p>
              </div>
              <div>
                <p className="font-extrabold text-white text-lg">
                  {totalCantidad + totalStock}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 py-5 px-5 mx-10 my-5 rounded-md max-md:mx-5">
            <p className="font-bold text-gray-200 text-xl mb-4">
              Aberturas Entregadas por Fábrica
            </p>
            <div className="bg-white rounded-md">
              <table className="table text-gray-800 text-sm">
                <thead className="text-sm font-bold text-gray-800">
                  <tr>
                    <th className="">Fábrica</th>
                    <th className="">Cantidad Entregada</th>
                  </tr>
                </thead>
                <tbody className="font-medium capitalize border-none">
                  {Object.entries(cantidadPorFabrica).map(
                    ([fabrica, cantidad]) => (
                      <tr key={fabrica}>
                        <td className="border-none font-bold">
                          Fabrica - {fabrica}
                        </td>
                        <td className="">
                          <div className="flex">
                            <p className="font-extrabold bg-green-100/90 py-2 px-3 rounded-md text-green-700">
                              {cantidad}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {user.fabrica !== "aberturas" && (
        <div className="h-screen flex justify-center items-center">
          <p className="font-bold text-3xl">
            Generar nuevos pedidos a la fabrica de aberturas.
          </p>
        </div>
      )}
    </section>
  );
};
