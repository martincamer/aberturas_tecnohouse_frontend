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
  let firstDayOfRange;
  let lastDayOfRange;

  if (today.getDate() < 10) {
    // If the current day is before the 10th, the range is from the 10th of the previous month to the 10th of the current month.
    firstDayOfRange = new Date(today.getFullYear(), today.getMonth() - 1, 10);
    lastDayOfRange = new Date(today.getFullYear(), today.getMonth(), 10);
  } else {
    // If the current day is on or after the 10th, the range is from the 10th of the current month to the 10th of the next month.
    firstDayOfRange = new Date(today.getFullYear(), today.getMonth(), 10);
    lastDayOfRange = new Date(today.getFullYear(), today.getMonth() + 1, 10);
  }

  // Convertir las fechas en formato YYYY-MM-DD para los inputs tipo date
  const fechaInicioPorDefecto = firstDayOfRange.toISOString().split("T")[0];
  const fechaFinPorDefecto = lastDayOfRange.toISOString().split("T")[0];

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
    const stockNumerico =
      typeof abertura.stock === "string"
        ? parseInt(abertura.stock, 10)
        : abertura.stock;

    return total + (isNaN(stockNumerico) ? 0 : stockNumerico);
  }, 0);

  const calcularTotalCantidad = (salidas) => {
    return salidas.reduce((total, salida) => {
      const aberturas = JSON.parse(salida.aberturas);
      const totalCantidadSalida = aberturas.reduce((subtotal, abertura) => {
        if (Array.isArray(abertura.cantidad)) {
          const cantidadTotalAbertura = abertura.cantidad.reduce(
            (sum, cantidad) => {
              const cantidadNumerica = parseInt(cantidad, 10);
              return sum + (isNaN(cantidadNumerica) ? 0 : cantidadNumerica);
            },
            0
          );
          return subtotal + cantidadTotalAbertura;
        } else {
          const cantidadNumerica = parseInt(abertura.cantidad, 10);
          return subtotal + (isNaN(cantidadNumerica) ? 0 : cantidadNumerica);
        }
      }, 0);

      return total + totalCantidadSalida;
    }, 0);
  };

  const totalCantidad = calcularTotalCantidad(filteredDataSalidas);

  const calcularCantidadPorFabrica = (salidas) => {
    return salidas.reduce((acc, salida) => {
      const aberturas = JSON.parse(salida.aberturas);
      if (!acc[salida.fabrica]) {
        acc[salida.fabrica] = 0;
      }

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
          <div className=" bg-gray-100 py-10 px-10 flex justify-between items-center max-md:flex-col max-md:gap-3">
            <p className="font-extrabold text-2xl bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent ">
              Panel de estadísticas aberturas.
            </p>
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
            <div className="bg-gray-800 py-5 px-5 rounded-2xl">
              <div>
                <p className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent text-lg font-bold">
                  Total de aberturas en fábrica.
                </p>
              </div>
              <div>
                <p className="bg-gradient-to-r from-green-300 to-blue-400 bg-clip-text text-transparent text-2xl font-bold">
                  {totalStock}
                </p>
              </div>
            </div>
            <div className="bg-gray-800 py-5 px-5 rounded-2xl">
              <div>
                <p className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent text-lg font-bold">
                  Total de salidas - entregas.
                </p>
              </div>
              <div>
                <p className="bg-gradient-to-r from-green-300 to-blue-400 bg-clip-text text-transparent text-2xl font-bold">
                  {totalCantidad}
                </p>
              </div>
            </div>
            <div className="bg-white border border-gray-300 rounded-2xl py-5 px-5">
              <div>
                <p className="bg-gradient-to-r from-blue-500 to-primary bg-clip-text text-transparent text-lg font-bold">
                  Resumen total de entregas + stock.
                </p>
              </div>
              <div>
                <p className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent text-2xl font-bold">
                  {totalCantidad + totalStock}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 py-5 px-5 mx-10 my-5 rounded-2xl max-md:mx-5 max-md:max-w-full">
            <p className="bg-gradient-to-r from-green-300 to-primary bg-clip-text text-transparent text-2xl mb-4 font-bold">
              Aberturas Entregadas por Fábrica.
            </p>
            <div className="bg-white rounded-md border-none">
              <table className="table bg-gray-200 rounded-t-xl">
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
                        <td className=" border-none ">
                          <div className="flex">
                            <p className="font-extrabold bg-gradient-to-r from-green-500 to-blue-400 text-white px-3 py-1 rounded-md">
                              {cantidad} aberturas.
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
    </section>
  );
};
