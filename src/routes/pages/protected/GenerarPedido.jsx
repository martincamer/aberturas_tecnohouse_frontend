import { useForm } from "react-hook-form";
import { useAberturasContext } from "../../../context/AberturasProvider";
import { useEffect, useState } from "react";
import { useObtenerId } from "../../../helpers/obtenerId";
import { FaSearch } from "react-icons/fa";
import { formatearFecha } from "../../../helpers/formatearFecha";
import { showSuccessToast } from "../../../helpers/toast";
import { FaDeleteLeft } from "react-icons/fa6";
import client from "../../../api/axios";

export const GenerarPedido = () => {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const res = await client.get("/pedidos");
        setPedidos(res.data);
      } catch (error) {
        console.error("Error al obtener los pedidos:", error);
      }
    };

    obtenerDatos();
  }, []);

  const { handleObtenerId, idObtenida } = useObtenerId();
  return (
    <section className="w-full h-full min-h-screen max-h-full max-w-full">
      <div className="bg-gray-100 py-10 px-10 flex justify-between items-center max-md:flex-col max-md:gap-3">
        <p className="font-bold text-gray-900 text-xl">
          Sector pedidos, generar nuevo.
        </p>
        <button
          onClick={() =>
            document.getElementById("my_modal_generar_pedido").showModal()
          }
          type="button"
          className="bg-primary py-1 px-4 rounded-md text-white font-semibold text-sm"
        >
          Generar pedido nuevo
        </button>
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
            {pedidos
              .slice()
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Ordena de mayor a menor
              .map((pedido) => (
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
                      <p className="bg-orange-500 py-2 px-4 rounded-md text-white font-bold">
                        Pendiente
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <ModalNuevoPedido setPedidos={setPedidos} />
      <ModalPedidoCompleto idObtenida={idObtenida} />
    </section>
  );
};

export const ModalNuevoPedido = ({ setPedidos }) => {
  const { handleSubmit, reset } = useForm();
  const [aberturasPedido, setAberturasPedido] = useState([]);
  const [cliente, setCliente] = useState("");
  const [aberturas, setAberturas] = useState([]);

  const onSubmit = async (formData) => {
    try {
      const aberturaData = {
        ...formData,
        aberturas: aberturasPedido,
      };

      const res = await client.post("/crear-pedido", aberturaData);
      console.log(res);

      setPedidos(res.data.pedidos);

      setAberturasPedido([]);
      showSuccessToast("Pedido enviado y cargado correctamente");

      document.getElementById("my_modal_generar_pedido").close();

      reset();
    } catch (error) {}
  };

  const addPedidoContratoAbertura = (id, cliente, aberturas) => {
    const data = { id, cliente, aberturas };
    setAberturasPedido([...aberturasPedido, data]);

    setAberturas([]);
    setCliente("");
  };

  const { handleObtenerId, idObtenida } = useObtenerId();
  console.log("pedidos", aberturasPedido);

  const removePedido = (id) => {
    setAberturasPedido((prevAberturas) =>
      prevAberturas.filter((abertura) => abertura.id !== id)
    );
  };

  return (
    <dialog id="my_modal_generar_pedido" className="modal">
      <div className="modal-box rounded-md max-w-full h-full max-md:max-h-full max-md:w-full max-md:rounded-none">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg">Cargar nuevo pedido de aberturas.</h3>
        <p className="py-0 text-sm font-medium">
          Rellena los siguientes campos para generar el pedido de aberturas.
        </p>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 flex flex-col items-start gap-2"
        >
          <div className="mt-4 flex gap-2 max-md:flex-col max-md:w-full">
            <button
              onClick={() =>
                document
                  .getElementById("my_modal_seleccionar_aberturas_cliente")
                  .showModal()
              }
              type="button"
              className="text-sm font-bold bg-blue-500 py-2 px-2 rounded-md text-white"
            >
              Cargar nuevo cliente, abertura.
            </button>
          </div>

          <div className="px-0 max-md:overflow-x-auto max-md:h-[30vh] scrollbar-hidden w-full">
            <table className="table">
              <thead className="text-sm font-bold text-gray-800">
                <tr>
                  <th>Refer.</th>
                  <th>Cliente</th>
                </tr>
              </thead>

              <tbody className="text-xs font-medium capitalize">
                {aberturasPedido
                  .slice() // Crear una copia del array para no modificar el original
                  .sort((a, b) => b.id - a.id) // Ordenar por id de mayor a menor
                  .map((abertura, index) => (
                    <tr key={abertura.id}>
                      <td>{abertura.id}</td>
                      <td>{abertura.cliente}</td>
                      <td>
                        <button
                          onClick={() => {
                            handleObtenerId(abertura.id);
                            document
                              .getElementById("my_modal_ver_aberturas")
                              .showModal();
                          }}
                          type="button"
                          className="font-bold text-white bg-primary py-1 px-4 rounded-md capitalize"
                        >
                          ver aberturas
                        </button>
                      </td>
                      <td>
                        <FaDeleteLeft
                          onClick={() => removePedido(abertura.id)}
                          className="text-xl text-red-500 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="mt-2">
            <button
              type="submit"
              className="py-1.5 px-6 bg-primary hover:shadow-md text-white transition-all rounded-md font-semibold text-sm"
            >
              Enviar pedido..
            </button>
          </div>
        </form>

        <ModalSeleccionarAberturaCliente
          cliente={cliente}
          setCliente={setCliente}
          aberturas={aberturas}
          setAberturas={setAberturas}
          addPedidoContratoAbertura={addPedidoContratoAbertura}
        />
        <ModalVerAberturas
          idObtenida={idObtenida}
          aberturasPedido={aberturasPedido}
        />
      </div>
    </dialog>
  );
};

const ModalPedidoCompleto = ({ idObtenida }) => {
  const [pedido, setPedido] = useState([]);

  useEffect(() => {
    const obtenerDatos = async () => {
      const respuesta = await client.get(`/pedido/${idObtenida}`);
      setPedido(respuesta.data);
    };

    obtenerDatos();
  }, [idObtenida]);

  const aberturas = pedido?.aberturas ? JSON.parse(pedido.aberturas) : [];

  // Agrupar y sumar cantidades
  const groupedAberturas = aberturas.reduce((acc, cliente) => {
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
          Observar el pedido , numero del pedido{" "}
          <span className="text-primary font-bold uppercase underline">
            {pedido.id}
          </span>
          .
        </h3>
        <div>
          <span className="font-medium">Fecha del pedido:</span>{" "}
          <span className="font-bold">{formatearFecha(pedido.created_at)}</span>
        </div>

        <div className="mt-4">
          {aberturas.map((cliente, index) => (
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
      </div>
    </dialog>
  );
};

const ModalVerAberturas = ({ idObtenida, aberturasPedido }) => {
  console.log("abertura,cliente", aberturasPedido);
  console.log(idObtenida);

  const pedidoFiltrado = aberturasPedido.find(
    (pedido) => pedido.id === idObtenida
  );

  return (
    <dialog id="my_modal_ver_aberturas" className="modal">
      <div className="modal-box rounded-md max-w-4xl">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg">
          Aberturas del cliente{" "}
          <span className="font-bold capitalize text-primary">
            {pedidoFiltrado?.cliente}
          </span>
          .
        </h3>
        <div>
          <table className="table">
            <thead className="text-sm font-bold text-gray-800">
              <tr>
                <th>Detalle</th>
                <th>Medida</th>
                <th>Color</th>
                <th>Linea</th>
                <th>Tipo</th>
                <th>Cantidad</th>
              </tr>
            </thead>

            <tbody className="text-xs font-medium capitalize">
              {pedidoFiltrado?.aberturas?.map((abertura) => (
                <tr key={abertura.id}>
                  <td>{abertura.detalle}</td>
                  <td>{abertura.medida}</td>
                  <td>{abertura.color}</td>
                  <td>{abertura.categoria}</td>
                  <td>{abertura.tipo}</td>
                  <th>{abertura.cantidad}</th>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* {pedidoFiltrado ? (
          <div>
            <p className="mt-2 font-semibold">
              Cliente: {pedidoFiltrado.cliente}
            </p>
            <ul className="mt-4">
              {pedidoFiltrado.aberturas.map((abertura) => (
                <li key={abertura.id} className="mb-2">
                  <p>
                    <strong>Detalle:</strong> {abertura.detalle}
                  </p>
                  <p>
                    <strong>Medida:</strong> {abertura.medida}
                  </p>
                  <p>
                    <strong>Color:</strong> {abertura.color}
                  </p>
                  <p>
                    <strong>Categoría:</strong> {abertura.categoria}
                  </p>
                  <p>
                    <strong>Tipo:</strong> {abertura.tipo}
                  </p>
                  <p>
                    <strong>Cantidad:</strong> {abertura.cantidad}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No se encontraron aberturas para este cliente.</p>
        )} */}
      </div>
    </dialog>
  );
};

const ModalSeleccionarAberturaCliente = ({
  addPedidoContratoAbertura,
  cliente,
  setCliente,
  setAberturas,
  aberturas,
}) => {
  const generateRandomId = () => Math.floor(Math.random() * 1000000);
  const idRandom = generateRandomId(); // Genera un ID aleatorio

  const addToAberturas = (
    id,
    detalle,
    medida,
    color,
    categoria,
    tipo,
    cantidad
  ) => {
    const data = { id, detalle, medida, color, categoria, tipo, cantidad };
    setAberturas([...aberturas, data]);
  };

  const removeFromAberturas = (id) => {
    setAberturas((prevAberturas) =>
      prevAberturas.filter((abertura) => abertura.id !== id)
    );
  };

  return (
    <dialog id="my_modal_seleccionar_aberturas_cliente" className="modal">
      <div className="modal-box rounded-md max-w-7xl h-auto">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg">Cargar nuevo cliente, aberturas.</h3>
        <div className="flex flex-col gap-2 mt-5">
          <label className="font-bold text-sm">
            Nombre,apellido y contrato del cliente
          </label>
          <input
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            className="border border-gray-300 py-2 px-2 rounded-md font-medium text-sm outline-none w-1/4"
          />
        </div>

        <div className="mt-4">
          <div>
            {" "}
            <button
              onClick={() =>
                document
                  .getElementById("my_modal_seleccionar_abertura")
                  .showModal()
              }
              type="button"
              className="text-sm font-bold bg-blue-500 py-2 px-2 rounded-md text-white"
            >
              Cargar nueva abertura al cliente
            </button>
          </div>

          <div className="max-md:overflow-x-auto scrollbar-hidden">
            <table className="table">
              <thead className="text-sm font-bold text-gray-800">
                <tr>
                  <th>Numero</th>
                  <th>Detalle</th>
                  <th>Medida</th>
                  <th>Color</th>
                  <th>Linea</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                </tr>
              </thead>

              <tbody className="text-xs font-medium capitalize">
                {aberturas.map((abertura) => (
                  <tr key={abertura.id}>
                    <td>{abertura.id}</td>
                    <td>{abertura.detalle}</td>
                    <td>{abertura.medida}</td>
                    <td>{abertura.color}</td>
                    <td>{abertura.categoria}</td>
                    <td>{abertura.tipo}</td>
                    <th>{abertura.cantidad}</th>
                    <td>
                      <FaDeleteLeft
                        onClick={() => removeFromAberturas(abertura.id)}
                        className={"text-xl text-red-500 cursor-pointer"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => {
              addPedidoContratoAbertura(idRandom, cliente, aberturas),
                document
                  .getElementById("my_modal_seleccionar_aberturas_cliente")
                  .close();
            }}
            className="py-1.5 px-6 bg-primary hover:shadow-md text-white transition-all rounded-md font-semibold text-sm"
            type="button"
          >
            Cargar cliente, aberturas
          </button>
        </div>

        <SeleccionarAbertura addToAberturas={addToAberturas} />
      </div>
    </dialog>
  );
};

const SeleccionarAbertura = ({ addToAberturas }) => {
  const { aberturas } = useAberturasContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedLinea, setSelectedLinea] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("");

  const generateRandomId = () => Math.floor(Math.random() * 1000000);

  const idRandom = generateRandomId(); // Genera un ID aleatorio

  // Filtrado de datos
  let filteredData = aberturas.filter((item) => {
    // Buscar en detalle y ancho_alto
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearchTerm =
      item.detalle.toLowerCase().includes(searchTermLower) ||
      item.ancho_alto.toLowerCase().includes(searchTermLower);

    // Aplicar filtros adicionales
    const matchesColor = !selectedColor || item.color === selectedColor;
    const matchesLinea = !selectedLinea || item.linea === selectedLinea;
    const matchesTipo = !selectedTipo || item.tipo === selectedTipo;

    return matchesSearchTerm && matchesColor && matchesLinea && matchesTipo;
  });

  filteredData.sort((a, b) => b.stock - a.stock);

  const { handleObtenerId, idObtenida } = useObtenerId();

  return (
    <dialog id="my_modal_seleccionar_abertura" className="modal">
      <div className="modal-box rounded-md max-w-6xl">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg">Seleccionar la abertura</h3>
        <div className="flex gap-2 mb-4 max-md:flex-col max-md:w-auto max-md:py-5">
          <div className="border border-gray-300 flex items-center gap-2 w-1/3 px-2 max-md:w-auto py-1.5 text-sm rounded-md">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="text"
              className="outline-none font-medium w-full"
              placeholder="Buscar por abertura por el detalle.."
            />
            <FaSearch className="text-gray-700" />
          </div>

          <div>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="border border-gray-300 flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md outline-none font-semibold capitalize"
            >
              <option className="font-bold capitalize text-primary" value="">
                Seleccionar el tipo...
              </option>
              <option value={"mosquiteros"} className="font-semibold">
                Mosquiteros
              </option>
              <option value={"ventana corrediza"} className="font-semibold">
                Ventana corrediza
              </option>
              <option value={"raja de abrir"} className="font-semibold">
                Raja de abrir
              </option>
              <option value={"porton de abrir"} className="font-semibold">
                Porton de abrir
              </option>
              <option value={"puerta de abrir"} className="font-semibold">
                Puerta de abrir
              </option>
              <option value={"celosia de abrir"} className="font-semibold">
                Celosia de abrir
              </option>
              <option value={"celosia corrediza"} className="font-semibold">
                Celosia corrediza
              </option>
              <option value={"paño fijo"} className="font-semibold">
                Paño fijo
              </option>
            </select>
          </div>
          <div>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="border border-gray-300 flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md outline-none font-semibold capitalize"
            >
              <option className="font-bold capitalize text-primary" value="">
                Seleccionar el color...
              </option>{" "}
              <option className="font-semibold capitalize" value="blanco">
                Blanco
              </option>
              <option className="font-semibold capitalize" value="negro">
                Negro
              </option>
            </select>
          </div>
          <div>
            <select
              value={selectedLinea}
              onChange={(e) => setSelectedLinea(e.target.value)}
              className="border border-gray-300 flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md outline-none font-semibold capitalize"
            >
              <option className="font-bold capitalize text-primary" value="">
                Seleccionar la linea...
              </option>{" "}
              <option className="font-semibold capitalize" value="herrero">
                herrero
              </option>
              <option className="font-semibold capitalize" value="modena">
                modena
              </option>
              <option className="font-semibold capitalize" value="modena a30">
                modena a30
              </option>
            </select>
          </div>
        </div>

        <div className="max-md:overflow-x-auto scrollbar-hidden">
          <table className="table">
            <thead className="text-sm font-bold text-gray-800">
              <tr>
                <th>Numero</th>
                <th>Detalle</th>
                <th>Color</th>
                <th>Linea</th>
                <th>Tipo</th>
                <th>Anchoxalto</th>
                <th>Seleccionar cantidad</th>
              </tr>
            </thead>

            <tbody className="text-xs font-medium capitalize">
              {filteredData.map((abertura, index) => (
                <tr key={abertura.id}>
                  <td>{abertura.id}</td>
                  <td>{abertura.detalle}</td>
                  <td>{abertura.color}</td>
                  <td>{abertura.linea}</td>
                  <td>{abertura.tipo}</td>
                  <td>{abertura.ancho_alto}</td>
                  <td>
                    <div className="flex">
                      <button
                        onClick={() => {
                          {
                            handleObtenerId(abertura.id),
                              document
                                .getElementById("my_modal_cantidad")
                                .showModal();
                          }
                        }}
                        type="button"
                        className="bg-primary py-1 px-2 rounded-md text-white font-bold"
                      >
                        Seleccionar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ModalSeleccionarCantidad
          idObtenida={idObtenida}
          addToAberturas={addToAberturas}
        />
      </div>
    </dialog>
  );
};

const ModalSeleccionarCantidad = ({ idObtenida, addToAberturas }) => {
  const [abertura, setAbertura] = useState([]);
  const [cantidades, setCantidades] = useState(0);

  const generateRandomId = () => Math.floor(Math.random() * 1000000);
  const idRandom = generateRandomId(); // Genera un ID aleatorio

  useEffect(() => {
    const obtenerDatos = async () => {
      const res = await client.get(`/abertura/${idObtenida}`);

      setAbertura(res.data);
      console.log("asdasd", res.data);
    };
    obtenerDatos();
  }, [idObtenida]);

  return (
    <dialog id="my_modal_cantidad" className="modal">
      <div className="modal-box rounded-md">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>

        <form>
          <div className="mb-2">
            <p className="text-lg font-bold">
              Datos de la abertura seleccionada.
            </p>
            <div className="font-bold text-sm text-blue-500">
              Detalle :{" "}
              <span className="text-gray-800 capitalize">
                {abertura.detalle} - {abertura.ancho_alto}
              </span>
            </div>
            <div className="font-bold text-sm text-blue-500">
              Linea, color, tipo :{" "}
              <span className="text-gray-800 capitalize">
                {" "}
                {abertura.linea}, {abertura.color}, {abertura.tipo}
              </span>
            </div>{" "}
          </div>

          <div className="flex flex-col gap-1 items-start">
            <label className="font-bold">Escribir cantidad.</label>
            <input
              className="border border-gray-300 rounded-md py-2 px-2 mb-3 font-bold text-sm outline-none"
              onChange={(e) => setCantidades(e.target.value)}
              value={cantidades}
              type="text"
            />
          </div>

          <div className="flex">
            <button
              onClick={() => {
                addToAberturas(
                  abertura.id + idRandom,
                  abertura.detalle,
                  abertura.ancho_alto,
                  abertura.color,
                  abertura.linea,
                  abertura.tipo,
                  cantidades
                ),
                  setCantidades(0),
                  document.getElementById("my_modal_cantidad").close(),
                  document
                    .getElementById("my_modal_seleccionar_abertura")
                    .close();
              }}
              type="button"
              className="bg-primary py-1 px-2 rounded-md text-white font-bold text-sm"
            >
              Seleccionar cantidad
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};
