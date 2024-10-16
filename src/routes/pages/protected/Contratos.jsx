import { useState } from "react";
import { useAberturasContext } from "../../../context/AberturasProvider";
import { FaSearch } from "react-icons/fa";
import { useAuth } from "../../../context/AuthProvider";

export const Contratos = () => {
  const { salidas } = useAberturasContext();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFabrica, setSelectedFabrica] = useState("");

  // Obtener todas las fábricas únicas
  const fabricas = [...new Set(salidas.map((item) => item.fabrica))];

  // Filtrar los datos según el término de búsqueda y la fábrica seleccionada
  const filteredData = salidas.filter((item) => {
    const contratos = JSON.parse(item.contratos); // Convierte el texto JSON a un objeto
    const matchesSearchTerm = contratos.some((contrato) =>
      contrato.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesFabrica = selectedFabrica
      ? item.fabrica === selectedFabrica
      : true;

    return matchesSearchTerm && matchesFabrica;
  });

  return (
    <section className="w-full h-full min-h-screen max-h-full">
      {user.fabrica === "aberturas" && (
        <>
          <div className=" bg-gray-100 py-10 px-10 flex justify-between items-center max-md:flex-col max-md:gap-3">
            <p className="font-extrabold text-2xl bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent ">
              Sector de contratos entregados.
            </p>
          </div>

          <div className="px-10 pt-10 max-md:px-5 flex gap-2 items-start">
            <div className="border border-gray-300 flex items-center gap-2 w-1/5 px-2 py-1.5 text-sm rounded-md max-md:w-auto">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
                className="outline-none font-medium w-full"
                placeholder="Buscar por fabrica.."
              />
              <FaSearch className="text-gray-700" />
            </div>

            <div className="border border-gray-300 flex items-center gap-2 w-1/5 px-2 py-1.5 text-sm rounded-md max-md:w-auto mb-4">
              <select
                value={selectedFabrica}
                onChange={(e) => setSelectedFabrica(e.target.value)}
                className="outline-none w-full font-bold capitalize"
              >
                <option className="font-bold text-primary" value="">
                  Todas las fábricas
                </option>
                {fabricas.map((fabrica) => (
                  <option
                    className="font-semibold"
                    key={fabrica}
                    value={fabrica}
                  >
                    {fabrica}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="px-10 max-md:overflow-x-auto scrollbar-hidden pb-12 pt-5 max-md:px-5">
            <table className="table bg-gray-200 rounded-t-xl">
              <thead className="text-sm font-bold text-gray-800">
                <tr>
                  <th className="border-b p-2">Refer.</th>
                  <th className="border-b p-2">Fábrica</th>
                  <th className="border-b p-2">Nombre del Contrato</th>
                  <th className="border-b p-2">Fecha de Salida</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium capitalize bg-white ">
                {filteredData.map((item) => {
                  const contratos = JSON.parse(item.contratos); // Convierte el texto JSON a un objeto
                  return contratos.map((contrato) => (
                    <tr
                      className="hover:bg-gray-100/40 transition-all cursor-pointer"
                      key={contrato.idRandom}
                    >
                      <td>{item.id}</td>
                      <td>{item.fabrica}</td>
                      <td>
                        <div className="flex">
                          <p className="font-bold bg-gray-800 py-2 px-4 rounded-md text-white">
                            {contrato.nombre}
                          </p>
                        </div>
                      </td>
                      <td>
                        {new Date(item.fecha_salida).toLocaleDateString()}
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
};
