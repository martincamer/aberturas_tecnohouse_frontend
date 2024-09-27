import { set, useForm } from "react-hook-form";
import { useAberturasContext } from "../../../context/AberturasProvider";
import { useEffect, useState } from "react";
import { useObtenerId } from "../../../helpers/obtenerId";
import { FaDownload, FaSearch } from "react-icons/fa";
import { showSuccessToast } from "../../../helpers/toast";
import { formatearFecha } from "../../../helpers/formatearFecha";
import client from "../../../api/axios";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { ImprimirPedido } from "../../../components/pdf/ImprimirPedido";
import { ImprimirHojaProduccion } from "../../../components/pdf/ImprimirHojaProduccion";
import { useAuth } from "../../../context/AuthProvider";

export const PedidosFabricas = () => {
  const [pedidos, setPedidos] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const res = await client.get("/pedidos-todos");
        setPedidos(res.data);
      } catch (error) {
        console.error("Error al obtener los pedidos:", error);
      }
    };

    obtenerDatos();
  }, []);

  const { handleObtenerId, idObtenida } = useObtenerId();

  const getMonthName = (monthIndex) => {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return months[monthIndex];
  };

  const [selectedFactory, setSelectedFactory] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  // Obtener fábricas únicas para el filtro
  const factories = [...new Set(pedidos.map((pedido) => pedido.fabrica))];

  // Obtener años únicos para el filtro
  const years = [
    ...new Set(
      pedidos.map((pedido) => new Date(pedido.created_at).getFullYear())
    ),
  ];

  // Obtener meses únicos para el filtro
  const months = [
    ...new Set(pedidos.map((pedido) => new Date(pedido.created_at).getMonth())),
  ];

  // Filtrar pedidos según selección
  const filteredPedidos = pedidos
    .filter((pedido) => !selectedFactory || pedido.fabrica === selectedFactory)
    .filter(
      (pedido) =>
        !selectedYear ||
        new Date(pedido.created_at).getFullYear() === parseInt(selectedYear)
    )
    .filter(
      (pedido) =>
        !selectedMonth ||
        new Date(pedido.created_at).getMonth() === parseInt(selectedMonth) - 1
    )
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Ordena de mayor a menor

  return (
    <section className="w-full h-full min-h-screen max-h-full max-w-full">
      {user.fabrica === "aberturas" && (
        <>
          <div className="bg-gray-100 py-10 px-10 flex justify-between items-center max-md:flex-col max-md:gap-3">
            <p className="font-bold text-gray-900 text-xl">
              Sector pedidos, generar nuevo.
            </p>
          </div>

          <div className="mb-4 flex gap-2 px-10 py-5">
            <div className="">
              <label className="block text-sm font-medium text-gray-700">
                Fábrica:
              </label>
              <select
                value={selectedFactory}
                onChange={(e) => setSelectedFactory(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              >
                <option value="">Todas</option>
                {factories.map((factory, index) => (
                  <option key={index} value={factory}>
                    {factory}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <div>
                <label
                  htmlFor="mes"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mes
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  id="mes"
                  name="mes"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                >
                  <option value="">Seleccione un mes</option>
                  <option value="01">Enero</option>
                  <option value="02">Febrero</option>
                  <option value="03">Marzo</option>
                  <option value="04">Abril</option>
                  <option value="05">Mayo</option>
                  <option value="06">Junio</option>
                  <option value="07">Julio</option>
                  <option value="08">Agosto</option>
                  <option value="09">Septiembre</option>
                  <option value="10">Octubre</option>
                  <option value="11">Noviembre</option>
                  <option value="12">Diciembre</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="ano"
                  className="block text-sm font-medium text-gray-700"
                >
                  Año
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  id="ano"
                  name="ano"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                >
                  <option value="">Seleccione un año</option>
                  {Array.from(
                    { length: 2050 - 2024 + 1 },
                    (_, index) => 2024 + index
                  ).map((ano) => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="px-10">
            <table className="table">
              <thead className="text-sm font-bold text-gray-800">
                <tr>
                  <th>Refer.</th>
                  <th>Fabrica</th>
                  <th>Ver pedido completo</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium capitalize">
                {filteredPedidos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td>{pedido.id}</td>
                    <td>{pedido.fabrica}</td>
                    <td>
                      <button
                        onClick={() => {
                          handleObtenerId(pedido.id),
                            document
                              .getElementById("my_modal_pedido_completo")
                              .showModal();
                        }}
                        type="button"
                        className="bg-primary py-2 px-4 rounded-md text-white font-bold"
                      >
                        Ver pedido
                      </button>
                    </td>
                    <td>{formatearFecha(pedido.created_at)}</td>
                    <td>
                      <div className="flex">
                        <p
                          className={`${
                            (pedido.estado === "pendiente" &&
                              "bg-orange-500 text-white") ||
                            (pedido.estado === "finalizado" &&
                              "bg-green-500 text-white") ||
                            (pedido.estado === "incompleto" &&
                              "bg-red-500 text-white")
                          } py-2 px-4 rounded-md font-bold`}
                        >
                          {pedido.estado}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="flex">
                        <button
                          onClick={() => {
                            handleObtenerId(pedido.id),
                              document
                                .getElementById("my_modal_estado")
                                .showModal();
                          }}
                          type="button"
                          className="bg-blue-500 text-white font-bold text-center py-2 px-4 rounded-md"
                        >
                          Editar estado
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ModalPedidoCompleto idObtenida={idObtenida} />
          <ModalEstado idObtenida={idObtenida} setPedidos={setPedidos} />
        </>
      )}
    </section>
  );
};

const ModalPedidoCompleto = ({ idObtenida }) => {
  const [pedido, setPedido] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const obtenerDatos = async () => {
      const respuesta = await client.get(`/pedido/${idObtenida}`);
      setPedido(respuesta.data);
    };

    obtenerDatos();
  }, [idObtenida]);

  const aberturas = pedido?.aberturas ? JSON.parse(pedido.aberturas) : [];

  // Filtrado de datos
  let filteredData = aberturas.filter((item) => {
    // Buscar en detalle y ancho_alto
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearchTerm = item.cliente
      .toLowerCase()
      .includes(searchTermLower);

    return matchesSearchTerm;
  });

  // Agrupar y sumar cantidades
  const groupedAberturas = filteredData.reduce((acc, cliente) => {
    cliente.aberturas.forEach((abertura) => {
      // Crear una clave única para agrupar
      const key = `${abertura.tipo}-${abertura.detalle}-${abertura.medida}-${abertura.color}-${abertura.categoria}`;

      if (!acc[key]) {
        acc[key] = {
          tipo: abertura.tipo,
          detalle: abertura.detalle,
          medida: abertura.medida,
          color: abertura.color,
          categoria: abertura.categoria,
          cantidad: 0,
        };
      }

      acc[key].cantidad += parseInt(abertura.cantidad, 10);
    });
    return acc;
  }, {});

  // Convertir el objeto agrupado a una lista
  const groupedList = Object.values(groupedAberturas);

  // Calcular la cantidad total de todas las aberturas
  const totalCantidad = groupedList.reduce(
    (sum, item) => sum + item.cantidad,
    0
  );

  return (
    <dialog id="my_modal_pedido_completo" className="modal">
      <div className="modal-box rounded-md max-w-6xl scroll-bar">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg">
          Pedido de la fabrica{" "}
          <span className="text-primary font-bold uppercase underline">
            {pedido?.fabrica}
          </span>
          , numero del pedido{" "}
          <span className="text-primary font-bold uppercase underline">
            {pedido.id}
          </span>
          .
        </h3>
        <div>
          <span className="font-medium">Fecha del pedido:</span>{" "}
          <span className="font-bold">{formatearFecha(pedido.created_at)}</span>
        </div>

        <div className="my-3">
          <div className="border border-gray-300  max-md:w-auto  flex items-center gap-2 w-1/3 px-2 py-1.5 text-sm rounded-md">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="text"
              className="outline-none font-medium w-full"
              placeholder="Buscar por cliente...."
            />
            <FaSearch className="text-gray-700" />
          </div>
        </div>

        <div className="mt-4">
          {filteredData.map((cliente, index) => (
            <div key={index} className="mb-4">
              <h4 className="font-bold text-md mb-2">
                Cliente/Contrato{" "}
                <span className="text-blue-500 capitalize">
                  {cliente.cliente}
                </span>
              </h4>
              <table className="table-auto w-full text-left text-sm uppercase">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Detalle</th>
                    <th className="px-4 py-2">Medida</th>
                    <th className="px-4 py-2">Color</th>
                    <th className="px-4 py-2">Categoría</th>
                    {/* <th className="px-4 py-2">Tipo</th> */}
                    <th className="px-4 py-2">Cantidad</th>
                  </tr>
                </thead>
                <tbody className="font-medium text-xs">
                  {cliente.aberturas.map((abertura, idx) => (
                    <tr key={idx}>
                      <td className="border px-4 py-2">{abertura.detalle}</td>
                      <td className="border px-4 py-2">{abertura.medida}</td>
                      <td className="border px-4 py-2">{abertura.color}</td>
                      <td className="border px-4 py-2">{abertura.categoria}</td>
                      {/* <td className="border px-4 py-2">{abertura.tipo}</td> */}
                      <td className="border px-4 py-2 font-bold">
                        {abertura.cantidad}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
        <div>
          <p className="font-medium pb-4">
            Total aberturas del pedido:{" "}
            <span className="font-bold">{totalCantidad}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <PDFDownloadLink
            className="bg-primary px-4 py-2 rounded-md text-white font-bold text-sm hover:shadow-md flex gap-2 items-center"
            fileName={`PEDIDO ${pedido?.fabrica}, Numero ${pedido?.id}`}
            document={<ImprimirPedido pedido={pedido} />}
          >
            Descargar pedido de clientes/contratos{" "}
            <FaDownload className="text-xl" />
          </PDFDownloadLink>{" "}
          <PDFDownloadLink
            className="bg-primary px-4 py-2 rounded-md text-white font-bold text-sm hover:shadow-md flex gap-2 items-center"
            fileName={`Hoja de producción ${pedido?.fabrica}, Numero ${pedido?.id}`}
            document={<ImprimirHojaProduccion pedido={pedido} />}
          >
            Descargar hoja de producción <FaDownload className="text-xl" />
          </PDFDownloadLink>
        </div>

        {/* <PDFViewer className="w-full h-screen">
          <ImprimirHojaProduccion pedido={pedido} />
        </PDFViewer> */}
      </div>
    </dialog>
  );
};

const ModalEstado = ({ idObtenida, setPedidos }) => {
  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    const obtenerDatos = async () => {
      const respuesta = await client.get(`/pedido/${idObtenida}`);
      setValue("estado", respuesta.data.estado);
    };

    obtenerDatos();
  }, [idObtenida]);

  const onSubmit = async (formData) => {
    try {
      const aberturaData = {
        ...formData,
      };

      const res = await client.put(
        `/pedido-estado/${idObtenida}`,
        aberturaData
      );

      setPedidos(res.data.pedidos);

      document.getElementById("my_modal_estado").close();
      showSuccessToast("Actualizado correctamente");
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };
  return (
    <dialog id="my_modal_estado" className="modal">
      <div className="modal-box rounded-md max-w-md">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg">Estado del pedido</h3>
        <form className="mt-2" onSubmit={handleSubmit(onSubmit)}>
          <select
            {...register("estado")}
            className="border border-gray-300 py-2 px-2 rounded-md w-full font-bold text-sm"
          >
            <option className="font-bold">Seleccionar estado del pedido</option>
            <option value={"pendiente"} className="font-semibold">
              Pendiente
            </option>
            <option value={"finalizado"} className="font-semibold">
              Finalizado
            </option>{" "}
            <option value={"incompleto"} className="font-semibold">
              Pedido incompleto
            </option>
          </select>

          <div>
            <button
              type="submit"
              className="bg-primary py-2 px-4 rounded-md text-white font-semibold  text-sm mt-3"
            >
              Actualizar estado
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};
