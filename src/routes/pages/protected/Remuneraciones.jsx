import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { crearNuevaRemuneracion } from "../../../api/ingresos";
import { useRemuneracionContext } from "../../../context/RemuneracionesProvider";
import { FaDeleteLeft, FaEye, FaHouseChimneyUser } from "react-icons/fa6";
import { FaArrowAltCircleRight, FaEdit, FaSearch } from "react-icons/fa";
import { formatearFecha } from "../../../helpers/formatearFecha";
import { useAuth } from "../../../context/AuthProvider";
import { useObtenerId } from "../../../helpers/obtenerId";
import { formatearDinero } from "../../../helpers/FormatearDinero";
import {
  showSuccessToast,
  showSuccessToastError,
} from "../../../helpers/toast";
import client from "../../../api/axios";
import io from "socket.io-client";
import { useForm } from "react-hook-form";

export const Remuneraciones = () => {
  const { remuneraciones } = useRemuneracionContext();

  const [searchTermCliente, setSearchTermCliente] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  const { user } = useAuth();
  // Obtener el primer día del mes actual
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  // Convertir las fechas en formato YYYY-MM-DD para los inputs tipo date
  const fechaInicioPorDefecto = firstDayOfMonth.toISOString().split("T")[0];
  const fechaFinPorDefecto = lastDayOfMonth.toISOString().split("T")[0];

  const [fechaInicio, setFechaInicio] = useState(fechaInicioPorDefecto);
  const [fechaFin, setFechaFin] = useState(fechaFinPorDefecto);

  // Obtener lista de usuarios únicos
  const uniqueUsers = Array.from(
    new Set(
      remuneraciones.map((remuneracion) => remuneracion.usuario.toLowerCase())
    )
  );
  const { handleObtenerId, idObtenida } = useObtenerId();

  const handleSearchClienteChange = (e) => {
    setSearchTermCliente(e.target.value);
  };

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
  };

  const handleFechaInicioChange = (e) => {
    setFechaInicio(e.target.value);
  };

  const handleFechaFinChange = (e) => {
    setFechaFin(e.target.value);
  };

  // Filtrar por término de búsqueda y usuario seleccionado
  let filteredData = remuneraciones.filter((item) => {
    const matchesSearchTerm = item.datos_cliente.datosCliente.some((cliente) =>
      cliente.cliente.toLowerCase().includes(searchTermCliente.toLowerCase())
    );

    const matchesUser =
      selectedUser === "" ||
      item.usuario.toLowerCase() === selectedUser.toLowerCase();

    return matchesSearchTerm && matchesUser;
  });

  // Filtrar por rango de fechas
  if (fechaInicio && fechaFin) {
    const fechaInicioObj = new Date(fechaInicio);
    const fechaFinObj = new Date(fechaFin);
    filteredData = filteredData.filter((item) => {
      const fechaOrden = new Date(item.created_at);
      return fechaOrden >= fechaInicioObj && fechaOrden <= fechaFinObj;
    });
  }

  // Ordenar por fecha de mayor a menor
  filteredData.sort((a, b) => {
    const fechaA = new Date(a.created_at);
    const fechaB = new Date(b.created_at);
    return fechaB - fechaA; // Ordena de mayor a menor (fecha más reciente primero)
  });

  // Filtrar pedidos del mes actual
  const currentMonth = new Date().getMonth() + 1;

  const filteredByMonth = remuneraciones.filter((salida) => {
    const createdAtMonth = new Date(salida.created_at).getMonth() + 1;
    return createdAtMonth === currentMonth;
  });

  // Obtener la fecha actual
  const currentDate = new Date();

  // Obtener el número del día de la semana (0 para domingo, 1 para lunes, etc.)
  const currentDayOfWeek = currentDate.getDay();

  // Calcular la fecha del primer día de la semana (lunes)
  const firstDayOfWeek = new Date(currentDate);
  firstDayOfWeek.setDate(
    currentDate.getDate() - currentDayOfWeek + (currentDayOfWeek === 0 ? -6 : 1)
  );

  // Calcular la fecha del último día de la semana (domingo)
  const lastDayOfWeek = new Date(currentDate);
  lastDayOfWeek.setDate(currentDate.getDate() - currentDayOfWeek + 7);

  // Filtrar las salidas por la semana actual
  const filteredByWeek = remuneraciones.filter((salida) => {
    const createdAtDate = new Date(salida.created_at);
    return createdAtDate >= firstDayOfWeek && createdAtDate <= lastDayOfWeek;
  });

  //MODALES
  const [eliminarModal, setEliminarModal] = useState(false);
  const [obtenerId, setObtenerId] = useState(null);

  const openEliminar = () => {
    setEliminarModal(true);
  };

  const closeEliminar = () => {
    setEliminarModal(false);
  };

  const handleId = (id) => setObtenerId(id);

  const [obtenerID, setObtenerID] = useState(null);

  const handleID = (id) => setObtenerID(id);

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenModalEditar, setIsOpenModalEditar] = useState(false);

  const openModal = () => {
    setIsOpenModal(true);
  };

  const closeModal = () => {
    setIsOpenModal(false);
  };

  const openModalDos = () => {
    setIsOpenModalEditar(true);
  };

  const closeModalDos = () => {
    setIsOpenModalEditar(false);
  };

  const [isOpenVerCliente, setIsOpenVerCliente] = useState(false);

  const openVerCliente = () => {
    setIsOpenVerCliente(true);
  };

  const closeVerCliente = () => {
    setIsOpenVerCliente(false);
  };

  //reduces de totales.
  const totalRecaudacionMensual = filteredByMonth.reduce((acc, current) => {
    // Convert the recaudacion value from string to number (assuming it's always a number in string format)
    const recaudacion = parseFloat(current.recaudacion);
    return acc + recaudacion;
  }, 0);

  const totalRecaudacionSemanal = filteredByWeek.reduce((acc, current) => {
    // Convert the recaudacion value from string to number (assuming it's always a number in string format)
    const recaudacion = parseFloat(current.recaudacion);
    return acc + recaudacion;
  }, 0);

  const totalRemuneracionesAnualmente = filteredData.reduce((acc, current) => {
    // Convert the recaudacion value from string to number (assuming it's always a number in string format)
    const recaudacion = parseFloat(current.recaudacion);
    return acc + recaudacion;
  }, 0);

  const [mostrarValor, setMostrarValor] = useState(false);

  const handleClick = () => {
    setMostrarValor(!mostrarValor); // Cambia el estado al contrario del estado actual
  };

  const totalContratosEntregados = filteredData.reduce((total, salida) => {
    return (
      total +
      (salida.datos_cliente.datosCliente
        ? salida.datos_cliente.datosCliente.length
        : 0)
    );
  }, 0);

  const totalMetrosCuadrados = filteredData?.reduce((total, salida) => {
    return (
      total +
      (salida?.datos_cliente?.datosCliente?.reduce((subtotal, cliente) => {
        return subtotal + Number(cliente.metrosCuadrados);
      }, 0) || 0)
    );
  }, 0);

  return (
    <section className="w-full h-full min-h-screen max-h-full">
      <div className="bg-gray-100 py-10 px-10 flex justify-between items-center max-md:flex-col max-md:gap-3">
        <p className="font-bold text-gray-900 text-xl">
          Crear nuevas remuneraciones.
        </p>
        <button
          onClick={() =>
            document.getElementById("my_modal_crear_remuneracion").showModal()
          }
          type="button"
          className="bg-primary py-1 px-4 rounded-md text-white font-semibold text-sm"
        >
          Crear nueva remuneracion
        </button>
      </div>

      <div className="py-10 px-5 flex justify-between max-md:flex-col max-md:gap-3">
        <div className="flex items-center gap-3 max-md:flex-col">
          <div className="flex gap-2">
            <div className="border border-gray-300 flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md">
              <input
                value={searchTermCliente}
                onChange={handleSearchClienteChange}
                type="text"
                className="outline-none font-medium w-full"
                placeholder="Buscar por clientes.."
              />
              <FaSearch className="text-gray-700" />
            </div>

            <select
              value={selectedUser}
              onChange={handleUserChange}
              className="border border-gray-300 flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md outline-none font-semibold capitalize"
            >
              <option className="font-bold capitalize text-primary" value="">
                Seleccionar usuario...
              </option>
              {uniqueUsers.map((user) => (
                <option
                  className="capitalize font-semibold"
                  key={user}
                  value={user}
                >
                  {user}
                </option>
              ))}
            </select>
          </div>
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

        <div className="dropdown dropdown-left dropdown-hover max-md:hidden">
          <button className="font-bold text-sm bg-primary py-2 px-4 text-white rounded">
            Ver estadisticas de remuneradas
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 mt-2 bg-gray-800 w-[800px] rounded-md max-md:w-80 mr-1"
          >
            <div className="py-5 px-5 grid grid-cols-3 gap-5 w-full max-md:grid-cols-1">
              <div className="flex flex-col gap-1 border py-3 px-3 bg-white rounded-md">
                <p className="font-medium text-sm text-center">
                  Total en remuneraciónes del mes.
                </p>
                <p className="font-bold text-lg text-center">
                  {totalRecaudacionMensual.toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  })}
                </p>
              </div>
              <div className="flex flex-col gap-1 border py-3 px-3 bg-white rounded-md">
                <p className="font-medium text-sm text-center">
                  Total en remuneraciónes de la semana.
                </p>
                <p className="font-bold text-lg text-center">
                  {totalRecaudacionSemanal.toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  })}
                </p>
              </div>
              <div
                className="flex flex-col gap-1 border py-3 px-3 bg-white rounded-md"
                onClick={handleClick}
              >
                <p className="font-medium text-sm text-center">
                  Total en remuneraciónes anualmente.
                </p>
                {mostrarValor ? (
                  <p className="font-bold text-lg text-blue-500 text-center cursor-pointer">
                    {totalRemuneracionesAnualmente.toLocaleString("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    })}
                  </p>
                ) : (
                  <div className="flex gap-2 items-center justify-center font-bold cursor-pointer">
                    <FaEye className="text-blue-500 text-xl" /> Ver monto
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 border py-3 px-3 bg-white rounded-md">
                <p className="font-medium text-sm text-center">
                  Total viviendas entregadas/contratos.
                </p>
                <p className="font-bold text-lg text-blue-500 text-center">
                  {totalContratosEntregados}
                </p>
              </div>
              <div className="flex flex-col gap-1 border py-3 px-3 bg-white rounded-md">
                <p className="font-medium text-sm text-center">
                  Total metros cuadrados entregados.
                </p>
                <p className="font-bold text-lg text-blue-500 text-center">
                  {totalMetrosCuadrados?.toFixed(2)} mts.
                </p>
              </div>
            </div>
          </ul>
        </div>
      </div>

      {/* tabla de datos  */}
      <div className="px-5 max-md:overflow-x-auto scrollbar-hidden">
        <table className="table">
          <thead className="text-sm font-bold text-gray-800">
            <tr>
              <th>Numero</th>
              <th>Usuario</th>
              <th>Fabrica</th>
              <th>Fecha</th>
              <th>Mes</th>
              <th>Clientes</th>
              <th>Remunerado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody className="text-xs font-medium capitalize">
            {filteredData
              .filter((s) => s.localidad === user.localidad) // Filtrar por localidad del usuario
              .map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.usuario}</td>
                  <td>{s.sucursal}</td>
                  <td>{formatearFecha(s.created_at)}</td>
                  <td>
                    {new Date(s.created_at).toLocaleString("default", {
                      month: "long",
                    })}
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        handleID(s.id), openVerCliente();
                      }}
                      type="button"
                      className="bg-primary py-1 px-4 rounded text-white font-bold flex gap-2 items-center outline-none"
                    >
                      Ver cliente/contrato{" "}
                      <FaHouseChimneyUser className="text-xl" />
                    </button>
                  </td>

                  <td>
                    <div className="flex">
                      <p
                        className={`font-bold py-1 px-2 rounded-md ${
                          s.recaudacion >= 0
                            ? "bg-green-100/80 text-green-700"
                            : "bg-red-100/80 text-red-700"
                        } `}
                      >
                        {Number(s.recaudacion).toLocaleString("es-AR", {
                          style: "currency",
                          currency: "ARS",
                          minimumIntegerDigits: 2,
                        })}
                      </p>
                    </div>
                  </td>
                  <td className="md:hidden">
                    <div className="flex gap-1">
                      <FaEdit
                        onClick={() => {
                          handleObtenerId(s.id),
                            document
                              .getElementById(
                                "my_modal_actualizar_remuneracion"
                              )
                              .showModal();
                        }}
                        className="text-xl text-blue-500"
                      />
                      <FaDeleteLeft
                        onClick={() => {
                          handleObtenerId(s.id),
                            document
                              .getElementById("my_modal_eliminar")
                              .showModal();
                        }}
                        className="text-xl text-red-500"
                      />
                      <Link className="capitalize" to={`/recaudacion/${s.id}`}>
                        <FaArrowAltCircleRight className="text-xl text-gray-700" />
                      </Link>
                    </div>
                  </td>
                  <td className="px-1 py-3 font-medium text-gray-900 uppercase cursor-pointer max-md:hidden">
                    <div className="dropdown dropdown-left">
                      <div
                        tabIndex={0}
                        role="button"
                        className="bg-gray-700 py-2 px-2 rounded-full text-white m-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                          />
                        </svg>
                      </div>
                      <ul
                        tabIndex={0}
                        className="font-bold text-xs dropdown-content z-[1] menu p-1 shadow-xl border-[1px] border-gray-200 bg-base-100 rounded-md w-52"
                      >
                        <li className="hover:bg-gray-700 hover:text-white rounded-md">
                          <button
                            type="button"
                            onClick={() => {
                              handleObtenerId(s.id),
                                document
                                  .getElementById(
                                    "my_modal_actualizar_remuneracion"
                                  )
                                  .showModal();
                            }}
                          >
                            Editar
                          </button>
                        </li>
                        <li className="hover:bg-gray-700 hover:text-white rounded-md">
                          <button
                            onClick={() => {
                              handleObtenerId(s.id),
                                document
                                  .getElementById("my_modal_eliminar")
                                  .showModal();
                            }}
                            type="button"
                          >
                            Eliminar
                          </button>
                        </li>
                        <li className="hover:bg-gray-700 hover:text-white rounded-md">
                          <Link
                            className="capitalize"
                            to={`/recaudacion/${s.id}`}
                          >
                            Ver la remuneración
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <ModalCrearRemuneracion />
      <ModalActualizarRemuneracion obtenerID={idObtenida} />
      <ModalEliminar idObtenida={idObtenida} />
    </section>
  );
};

export const ModalCrearRemuneracion = () => {
  const fechaActual = new Date();

  const { setRemuneraciones } = useRemuneracionContext();

  const nombresMeses = [
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

  const nombresDias = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];

  const numeroDiaActual = fechaActual.getDay(); // Obtener el día del mes actual

  const numeroMesActual = fechaActual.getMonth() + 1; // Obtener el mes actual

  const nombreMesActual = nombresMeses[numeroMesActual - 1]; // Obtener el nombre del mes actual

  const nombreDiaActual = nombresDias[numeroDiaActual]; // Obtener el nombre del día actual

  //useContext
  const { choferes, setChoferes } = useSalidasContext();

  //obtenerChoferes
  useEffect(() => {
    async function loadData() {
      const res = await client.get("/chofer");

      setChoferes(res.data);
    }

    loadData();
  }, []);

  //daots del cliente
  const [datosCliente, setDatosCliente] = useState([]);
  //eliminar cliente
  const eliminarCliente = (nombreClienteAEliminar) => {
    // Filtrar la lista de clientes para obtener una nueva lista sin el cliente a eliminar
    const nuevaListaClientes = datosCliente.filter(
      (cliente) => cliente.cliente !== nombreClienteAEliminar
    );
    // Actualizar el estado con la nueva lista de clientes
    setDatosCliente(nuevaListaClientes);
  };

  //estados del formulario
  const [chofer, setChofer] = useState("");
  const [armador, setArmador] = useState("");
  const [fecha_carga, setFechaCarga] = useState("");
  const [fecha_entrega, setFechaEntrega] = useState("");
  const [km_lineal, setKmLineal] = useState(0);
  const [pago_fletero_espera, setPagoFletero] = useState(0);
  const [viaticos, setViaticos] = useState(0);
  const [refuerzo, setRefuerzo] = useState(0);
  const [auto, setAuto] = useState(0);

  // Utilizar reduce para calcular la suma total de la propiedad totalFlete
  const totalSuma = datosCliente.reduce((acumulador, elemento) => {
    // Convertir la propiedad totalFlete a número y sumarla al acumulador
    return acumulador + parseFloat(elemento.totalFlete);
  }, 0); // Iniciar el acumulador en 0

  const totalSumaMetros = datosCliente.reduce((acumulador, elemento) => {
    // Convertir la propiedad totalFlete a número y sumarla al acumulador
    return acumulador + parseFloat(elemento.metrosCuadrados);
  }, 0); // Iniciar el acumulador en 0

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_URL, {
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("nueva-remuneracion", (nuevaSalida) => {
      setRemuneraciones(nuevaSalida);
    });

    return () => newSocket.close();
  }, []);

  const [error, setError] = useState([]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const recaudacion =
      Number(totalSuma) -
      Number(pago_fletero_espera) -
      Number(viaticos) -
      Number(auto) -
      Number(refuerzo);

    try {
      const res = await crearNuevaRemuneracion({
        armador,
        fecha_carga,
        fecha_entrega,
        pago_fletero_espera,
        km_lineal,
        viaticos,
        auto,
        refuerzo,
        recaudacion,
        chofer,
        datos_cliente: { datosCliente },
      });

      if (socket) {
        socket.emit("nueva-remuneracion", res.data);
      }

      showSuccessToast("Creado correctamente");

      setChofer("");
      setArmador("");
      setFechaCarga("");
      setFechaEntrega("");
      setKmLineal(0);
      setPagoFletero(0);
      setViaticos(0);
      setRefuerzo(0);
      setAuto(0);

      setDatosCliente([]);

      document.getElementById("my_modal_crear_remuneracion").close();
    } catch (error) {
      setTimeout(() => {
        setError("");
      }, 1500);
      setError(error.response.data.message);
    }
  };

  const [usuario, setUsuario] = useState("");

  const handleUsuario = (usuario) => setUsuario(usuario);

  const [isEditable, setIsEditable] = useState(false);

  const handleInputClick = () => {
    setIsEditable(true);
  };

  return (
    <dialog id="my_modal_crear_remuneracion" className="modal">
      <div className="modal-box rounded-md max-w-full h-full scroll-bar max-md:w-full max-md:max-h-full max-md:rounded-none">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 className="font-bold text-xl">Crear nueva remuneración.</h3>
        <p className="py-0.5 text-sm font-medium">
          En esta ventana podras crear nuevas remuneraciones de los clientes,
          fletes ,etc.
        </p>

        {error && error.length > 0 && (
          <div className="flex justify-center">
            <p className="bg-red-100 text-sm font-medium py-2 px-4 rounded-md text-red-800">
              {error}
            </p>
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-5 max-md:py-2 max-md:px-2 max-md:border-none max-md:shadow-none mt-5"
        >
          <article className="flex flex-col gap-2">
            <div>
              <h3 className="font-bold text-lg">Ingresar datos.</h3>
            </div>
            {/* datos del formulario  */}
            <div className="flex flex-col items-start gap-6">
              <div className="grid grid-cols-3 gap-2 max-md:w-full max-md:grid-cols-1 max-md:gap-5">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm">
                    Seleccionar Transportista
                  </label>
                  <select
                    onChange={(e) => setChofer(e.target.value)}
                    value={chofer}
                    type="text"
                    className="border border-gray-300 py-2 px-2 rounded-md font-medium capitalize text-sm outline-none"
                  >
                    <option value="">Seleccionar transportista</option>
                    {choferes.map((c) => (
                      <option key={c.id}>{c.chofer}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm">Armador</label>
                  <input
                    onChange={(e) => setArmador(e.target.value)}
                    value={armador}
                    type="text"
                    className="border border-gray-300 py-2 px-2 rounded-md font-medium capitalize text-sm outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 items-start">
                <button
                  onClick={() =>
                    document
                      .getElementById("my_modal_crear_cliente_remuneracion")
                      .showModal()
                  }
                  type="button"
                  className="bg-primary text-white flex gap-2 items-center px-4 py-1 rounded-md text-sm font-semibold"
                >
                  Crear Clientes
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="max-w-full min-w-full w-full max-md:overflow-x-auto">
              <table className="table w-full max-w-full min-w-full">
                <thead className="text-gray-900 text-sm">
                  <tr>
                    <th className="">Cliente</th>
                    <th className="">Localidad</th>
                    <th className="">Total mtrs</th>
                    <th className="">Total del flete</th>
                    <th className="">Acciones</th>
                  </tr>
                </thead>

                <tbody className="uppercase text-xs">
                  {datosCliente.map((datos) => (
                    <tr key={datos.id}>
                      <td>
                        {datos.cliente} ({datos.numeroContrato})
                      </td>
                      <td>{datos.localidad}</td>
                      <td>{datos.metrosCuadrados} Mts</td>
                      <td className="font-bold">
                        {Number(datos.totalFlete).toLocaleString("es-AR", {
                          style: "currency",
                          currency: "ARS",
                          minimumIntegerDigits: 2,
                        })}
                      </td>
                      <td>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => eliminarCliente(datos.cliente)}
                            type="button"
                            className="bg-red-100 py-1 px-3 text-xs font-semibold text-center rounded-md text-red-800"
                          >
                            Eliminar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleUsuario(datos.cliente),
                                document
                                  .getElementById(
                                    "my_modal_editar_cliente_remuneracion"
                                  )
                                  .showModal();
                            }}
                            className="bg-green-100 py-1 px-3 text-xs font-semibold text-center rounded-md text-green-700"
                          >
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="flex flex-col items-start gap-5">
            <div>
              <h3 className="font-bold text-lg text-slate-700 max-md:text-sm">
                Fechas de carga/entrega.
              </h3>
            </div>
            <div className="flex gap-3 max-md:w-full max-md:flex-col">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm">Fecha de carga</label>
                <input
                  onChange={(e) => setFechaCarga(e.target.value)}
                  value={fecha_carga}
                  type="date"
                  className="border border-gray-300 py-2 px-2 rounded-md font-medium text-sm outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm">Fecha de entrega</label>
                <input
                  onChange={(e) => setFechaEntrega(e.target.value)}
                  value={fecha_entrega}
                  type="date"
                  className="border border-gray-300 py-2 px-2 rounded-md font-medium text-sm outline-none"
                />
              </div>
            </div>
          </article>

          <article className="flex flex-col items-start gap-5">
            <div className="flex flex-col gap-2 items-start">
              <div>
                <h3 className="font-bold text-lg text-slate-700 max-md:text-sm">
                  Totales del viaje.
                </h3>
              </div>
              <div className="flex gap-5 ">
                <div className="flex gap-2 items-center border border-gray-300 rounded-md py-2 px-3">
                  <p className="text-gray-900 font-medium max-md:text-sm">
                    Total en fletes
                  </p>
                  <p className="font-bold text-slate-700 max-md:text-sm">
                    {Number(totalSuma).toLocaleString("es-AR", {
                      style: "currency",
                      currency: "ARS",
                      minimumIntegerDigits: 2,
                    })}
                  </p>
                </div>
                <div className="flex gap-2 items-center border border-gray-300 rounded-md py-2 px-3">
                  <p className="text-gray-900 font-medium max-md:text-sm">
                    Total en metros cuadrados
                  </p>
                  <p className="font-bold text-slate-700 max-md:text-sm">
                    {Number(totalSumaMetros).toFixed(2)} Mtrs.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 items-start justify-start gap-5 max-md:w-full max-md:grid-cols-1">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm">KM Lineal</label>
                <input
                  value={km_lineal}
                  onChange={(e) => setKmLineal(e.target.value)}
                  onBlur={() => {
                    setIsEditable(false);
                  }}
                  type="text"
                  className="border border-gray-300 py-2 px-2 rounded-md font-medium capitalize text-sm outline-none w-auto"
                />
              </div>

              <div className="cursor-pointer" onClick={handleInputClick}>
                {isEditable ? (
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm">
                      {" "}
                      Pago fletero + espera
                    </label>
                    <input
                      onChange={(e) => setPagoFletero(e.target.value)}
                      value={pago_fletero_espera}
                      onBlur={() => {
                        setIsEditable(false);
                      }}
                      type="text"
                      className="border border-gray-300 py-2 px-2 rounded-md font-medium capitalize text-sm outline-none w-auto"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm">
                      {" "}
                      Pago fletero + espera
                    </label>

                    <p className="border border-gray-300 py-2 px-2 rounded-md font-medium capitalize text-sm outline-none w-auto">
                      {formatearDinero(Number(pago_fletero_espera) || 0)}
                    </p>
                  </div>
                )}
              </div>

              <div className="cursor-pointer" onClick={handleInputClick}>
                {isEditable ? (
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm">
                      {" "}
                      Total en viaticos
                    </label>
                    <input
                      onChange={(e) => setViaticos(e.target.value)}
                      value={viaticos}
                      onBlur={() => {
                        setIsEditable(false);
                      }}
                      type="text"
                      className="border border-gray-300 py-2 px-2 rounded-md font-medium capitalize text-sm outline-none w-auto"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm">
                      {" "}
                      Total en viaticos
                    </label>

                    <p className="border border-gray-300 py-2 px-2 rounded-md font-medium capitalize text-sm outline-none w-auto">
                      {formatearDinero(Number(viaticos) || 0)}
                    </p>
                  </div>
                )}
              </div>

              <div className="cursor-pointer" onClick={handleInputClick}>
                {isEditable ? (
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm"> Total Auto</label>
                    <input
                      onChange={(e) => setAuto(e.target.value)}
                      value={auto}
                      onBlur={() => {
                        setIsEditable(false);
                      }}
                      type="text"
                      className="border border-gray-300 py-2 px-2 rounded-md font-medium capitalize text-sm outline-none w-auto"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm"> Total Auto</label>

                    <p className="border border-gray-300 py-2 px-2 rounded-md font-medium capitalize text-sm outline-none w-auto">
                      {formatearDinero(Number(auto) || 0)}
                    </p>
                  </div>
                )}
              </div>

              <div className="cursor-pointer" onClick={handleInputClick}>
                {isEditable ? (
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm"> Total refuerzo</label>
                    <input
                      onChange={(e) => setRefuerzo(e.target.value)}
                      value={refuerzo}
                      onBlur={() => {
                        setIsEditable(false);
                      }}
                      type="text"
                      className="border border-gray-300 py-2 px-2 rounded-md font-medium capitalize text-sm outline-none w-auto"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm"> Total refuerzo</label>

                    <p className="border border-gray-300 py-2 px-2 rounded-md font-medium capitalize text-sm outline-none w-auto">
                      {formatearDinero(Number(refuerzo) || 0)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex">
              <div className="flex max-md:flex-col max-md:w-full max-md:gap-1 max-md:py-1 max-md:items-start gap-3 bg-white border border-gray-300 rounded-md py-2 px-4 mt-5 items-center">
                <span className="font-bold text-slate-700">Remunerado</span>

                <p
                  className={
                    totalSuma -
                      pago_fletero_espera -
                      viaticos -
                      auto -
                      refuerzo <
                    0
                      ? "text-red-600 font-bold"
                      : "text-blue-500 font-bold"
                  }
                >
                  {Number(
                    totalSuma - pago_fletero_espera - viaticos - auto - refuerzo
                  ).toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                    minimumIntegerDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </article>

          <div>
            <button
              type="submit"
              className="py-1.5 px-6 bg-primary hover:shadow-md text-white transition-all rounded-md font-semibold text-sm"
            >
              Cargar nueva remuneracion
            </button>
          </div>
        </form>

        <ModalCrearClienteRemuneracion
          datosCliente={datosCliente}
          setDatosCliente={setDatosCliente}
        />
        <ModalEditarClienteRemuneracion
          datosCliente={datosCliente}
          setDatosCliente={setDatosCliente}
          usuario={usuario}
        />
      </div>
    </dialog>
  );
};

export const ModalActualizarRemuneracion = ({ obtenerID }) => {
  //useContext
  const { setRemuneraciones } = useRemuneracionContext();

  const { choferes, setChoferes } = useSalidasContext();

  //daots del cliente
  const [datosCliente, setDatosCliente] = useState([]);
  // //eliminar cliente
  const eliminarCliente = (nombreClienteAEliminar) => {
    // Filtrar la lista de clientes para obtener una nueva lista sin el cliente a eliminar
    const nuevaListaClientes = datosCliente.filter(
      (cliente) => cliente.cliente !== nombreClienteAEliminar
    );
    // Actualizar el estado con la nueva lista de clientes
    setDatosCliente(nuevaListaClientes);
  };

  const [error, setError] = useState("");

  //obtenerDatoUnico
  useEffect(() => {
    async function loadData() {
      const res = await client.get(`/remuneraciones/${obtenerID}`);

      const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      setChofer(res.data.chofer);
      setArmador(res.data.armador);
      setFechaCarga(formatDate(res.data.fecha_carga));
      setFechaEntrega(formatDate(res.data.fecha_entrega));
      setKmLineal(res.data.km_lineal);
      setPagoFletero(res.data.pago_fletero_espera);
      setViaticos(res.data.viaticos);
      setRefuerzo(res.data.refuerzo);
      setAuto(res.data.auto);
      setDatosCliente(res.data.datos_cliente?.datosCliente);
    }

    loadData();
  }, [obtenerID]);

  //obtenerChoferes
  useEffect(() => {
    async function loadData() {
      const res = await client.get("/chofer");

      setChoferes(res.data);
    }

    loadData();
  }, []);

  // Utilizar reduce para calcular la suma total de la propiedad totalFlete
  const totalSuma = datosCliente.reduce((acumulador, elemento) => {
    // Convertir la propiedad totalFlete a número y sumarla al acumulador
    return acumulador + parseFloat(elemento.totalFlete);
  }, 0); // Iniciar el acumulador en 0

  const totalSumaMetros = datosCliente.reduce((acumulador, elemento) => {
    // Convertir la propiedad totalFlete a número y sumarla al acumulador
    return acumulador + parseFloat(elemento.metrosCuadrados);
  }, 0); // Iniciar el acumulador en 0

  //estados del formulario
  const [chofer, setChofer] = useState("");
  const [armador, setArmador] = useState("");
  const [fecha_carga, setFechaCarga] = useState("");
  const [fecha_entrega, setFechaEntrega] = useState("");
  const [km_lineal, setKmLineal] = useState("");
  const [pago_fletero_espera, setPagoFletero] = useState("");
  const [viaticos, setViaticos] = useState("");
  const [refuerzo, setRefuerzo] = useState("");
  const [auto, setAuto] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_URL, {
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("editar-remuneracion", (nuevaSalida) => {
      setRemuneraciones(nuevaSalida);
    });

    return () => newSocket.close();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();

    const recaudacion =
      Number(totalSuma) -
      Number(pago_fletero_espera) -
      Number(viaticos) -
      Number(auto) -
      Number(refuerzo);

    const editarSalidas = {
      armador,
      fecha_carga,
      fecha_entrega,
      pago_fletero_espera,
      km_lineal,
      viaticos,
      auto,
      refuerzo,
      recaudacion,
      chofer,
      datos_cliente: { datosCliente },
    };

    try {
      const res = await client.put(
        `/remuneraciones/${obtenerID}`,
        editarSalidas
      );

      socket.emit("editar-remuneracion", res.data);

      showSuccessToast("Actualizado correctamente");

      document.getElementById("my_modal_actualizar_remuneracion").close();
    } catch (error) {
      console.log(error);
    }
  };

  const [usuario, setUsuario] = useState("");

  const handleUsuario = (usuario) => setUsuario(usuario);

  const [isEditable, setIsEditable] = useState(false);

  const handleInputClick = () => {
    setIsEditable(true);
  };

  return (
    <dialog id="my_modal_actualizar_remuneracion" className="modal">
      <div className="modal-box rounded-md max-w-full h-full scroll-bar max-md:w-full max-md:max-h-full max-md:rounded-none">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 className="font-bold text-xl">Actualizar la remuneración.</h3>
        <p className="py-0.5 text-sm font-medium">
          En esta ventana podras actualizar la remuneración seleccionada.
        </p>

        {error && error.length > 0 && (
          <div className="flex justify-center">
            <p className="bg-red-100 text-sm font-medium py-2 px-4 rounded-md text-red-800">
              {error}
            </p>
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-5 max-md:py-2 max-md:px-2 max-md:border-none max-md:shadow-none mt-5"
        >
          <article className="flex flex-col gap-2">
            <div>
              <h3 className="font-bold text-lg">Ingresar datos.</h3>
            </div>
            {/* datos del formulario  */}
            <div className="flex flex-col items-start gap-6">
              <div className="grid grid-cols-3 gap-2 max-md:w-full max-md:grid-cols-1 max-md:gap-5">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm">
                    Seleccionar Transportista
                  </label>
                  <select
                    onChange={(e) => setChofer(e.target.value)}
                    value={chofer}
                    type="text"
                    className="border border-gray-300 py-2 px-2 rounded-md font-medium capitalize text-sm outline-none"
                  >
                    <option value="">Seleccionar transportista</option>
                    {choferes.map((c) => (
                      <option key={c.id}>{c.chofer}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm">Armador</label>
                  <input
                    onChange={(e) => setArmador(e.target.value)}
                    value={armador}
                    type="text"
                    className="border border-gray-300 py-2 px-2 rounded-md font-medium capitalize text-sm outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 items-start">
                <button
                  onClick={() =>
                    document
                      .getElementById("my_modal_crear_cliente_remuneracion")
                      .showModal()
                  }
                  type="button"
                  className="bg-primary text-white flex gap-2 items-center px-4 py-1 rounded-md text-sm font-semibold"
                >
                  Crear Clientes
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="max-w-full min-w-full w-full max-md:overflow-x-auto">
              <table className="table w-full max-w-full min-w-full">
                <thead className="text-gray-900 text-sm">
                  <tr>
                    <th className="">Cliente</th>
                    <th className="">Localidad</th>
                    <th className="">Total mtrs</th>
                    <th className="">Total del flete</th>
                    <th className="">Acciones</th>
                  </tr>
                </thead>

                <tbody className="uppercase text-xs">
                  {datosCliente.map((datos) => (
                    <tr key={datos.id}>
                      <td>
                        {datos.cliente} ({datos.numeroContrato})
                      </td>
                      <td>{datos.localidad}</td>
                      <td>{datos.metrosCuadrados} Mts</td>
                      <td className="font-bold">
                        {Number(datos.totalFlete).toLocaleString("es-AR", {
                          style: "currency",
                          currency: "ARS",
                          minimumIntegerDigits: 2,
                        })}
                      </td>
                      <td>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => eliminarCliente(datos.cliente)}
                            type="button"
                            className="bg-red-100 py-1 px-3 text-xs font-semibold text-center rounded-md text-red-800"
                          >
                            Eliminar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleUsuario(datos.cliente),
                                document
                                  .getElementById(
                                    "my_modal_editar_cliente_remuneracion"
                                  )
                                  .showModal();
                            }}
                            className="bg-green-100 py-1 px-3 text-xs font-semibold text-center rounded-md text-green-700"
                          >
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="flex flex-col items-start gap-5">
            <div>
              <h3 className="font-bold text-lg text-slate-700 max-md:text-sm">
                Fechas de carga/entrega.
              </h3>
            </div>
            <div className="flex gap-3 max-md:w-full max-md:flex-col">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm">Fecha de carga</label>
                <input
                  onChange={(e) => setFechaCarga(e.target.value)}
                  value={fecha_carga}
                  type="date"
                  className="border border-gray-300 py-2 px-2 rounded-md font-medium text-sm outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm">Fecha de entrega</label>
                <input
                  onChange={(e) => setFechaEntrega(e.target.value)}
                  value={fecha_entrega}
                  type="date"
                  className="border border-gray-300 py-2 px-2 rounded-md font-medium text-sm outline-none"
                />
              </div>
            </div>
          </article>

          <article className="flex flex-col items-start gap-5">
            <div className="flex flex-col gap-2 items-start">
              <div>
                <h3 className="font-bold text-lg text-slate-700 max-md:text-sm">
                  Totales del viaje.
                </h3>
              </div>
              <div className="flex gap-5 ">
                <div className="flex gap-2 items-center border border-gray-300 rounded-md py-2 px-3">
                  <p className="text-gray-900 font-medium max-md:text-sm">
                    Total en fletes
                  </p>
                  <p className="font-bold text-slate-700 max-md:text-sm">
                    {Number(totalSuma).toLocaleString("es-AR", {
                      style: "currency",
                      currency: "ARS",
                      minimumIntegerDigits: 2,
                    })}
                  </p>
                </div>
                <div className="flex gap-2 items-center border border-gray-300 rounded-md py-2 px-3">
                  <p className="text-gray-900 font-medium max-md:text-sm">
                    Total en metros cuadrados
                  </p>
                  <p className="font-bold text-slate-700 max-md:text-sm">
                    {Number(totalSumaMetros).toFixed(2)} Mtrs.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 items-start justify-start gap-5 max-md:w-full max-md:grid-cols-1">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm">KM Lineal</label>
                <input
                  value={km_lineal || 0}
                  onChange={(e) => setKmLineal(e.target.value)}
                  onBlur={() => {
                    setIsEditable(false);
                  }}
                  type="text"
                  className="border border-gray-300 py-2 px-2 rounded-md font-medium capitalize text-sm outline-none w-auto"
                />
              </div>

              <div className="cursor-pointer" onClick={handleInputClick}>
                {isEditable ? (
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm">
                      {" "}
                      Pago fletero + espera
                    </label>
                    <input
                      onChange={(e) => setPagoFletero(e.target.value)}
                      value={pago_fletero_espera || 0}
                      onBlur={() => {
                        setIsEditable(false);
                      }}
                      type="text"
                      className="border border-gray-300 py-2 px-2 rounded-md font-medium capitalize text-sm outline-none w-auto"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm">
                      {" "}
                      Pago fletero + espera
                    </label>

                    <p className="border border-gray-300 py-2 px-2 rounded-md font-medium capitalize text-sm outline-none w-auto">
                      {formatearDinero(Number(pago_fletero_espera) || 0)}
                    </p>
                  </div>
                )}
              </div>

              <div className="cursor-pointer" onClick={handleInputClick}>
                {isEditable ? (
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm">
                      {" "}
                      Total en viaticos
                    </label>
                    <input
                      onChange={(e) => setViaticos(e.target.value)}
                      value={viaticos || 0}
                      onBlur={() => {
                        setIsEditable(false);
                      }}
                      type="text"
                      className="border border-gray-300 py-2 px-2 rounded-md font-medium capitalize text-sm outline-none w-auto"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm">
                      {" "}
                      Total en viaticos
                    </label>

                    <p className="border border-gray-300 py-2 px-2 rounded-md font-medium capitalize text-sm outline-none w-auto">
                      {formatearDinero(Number(viaticos) || 0)}
                    </p>
                  </div>
                )}
              </div>

              <div className="cursor-pointer" onClick={handleInputClick}>
                {isEditable ? (
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm"> Total Auto</label>
                    <input
                      onChange={(e) => setAuto(e.target.value)}
                      value={auto || 0}
                      onBlur={() => {
                        setIsEditable(false);
                      }}
                      type="text"
                      className="border border-gray-300 py-2 px-2 rounded-md font-medium capitalize text-sm outline-none w-auto"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm"> Total Auto</label>

                    <p className="border border-gray-300 py-2 px-2 rounded-md font-medium capitalize text-sm outline-none w-auto">
                      {formatearDinero(Number(auto) || 0)}
                    </p>
                  </div>
                )}
              </div>

              <div className="cursor-pointer" onClick={handleInputClick}>
                {isEditable ? (
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm"> Total refuerzo</label>
                    <input
                      onChange={(e) => setRefuerzo(e.target.value)}
                      value={refuerzo || 0}
                      onBlur={() => {
                        setIsEditable(false);
                      }}
                      type="text"
                      className="border border-gray-300 py-2 px-2 rounded-md font-medium capitalize text-sm outline-none w-auto"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm"> Total refuerzo</label>

                    <p className="border border-gray-300 py-2 px-2 rounded-md font-medium capitalize text-sm outline-none w-auto">
                      {formatearDinero(Number(refuerzo) || 0)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex">
              <div className="flex max-md:flex-col max-md:w-full max-md:gap-1 max-md:py-1 max-md:items-start gap-3 bg-white border border-gray-300 rounded-md py-2 px-4 mt-5 items-center">
                <span className="font-bold text-slate-700">Remunerado</span>

                <p
                  className={
                    totalSuma -
                      pago_fletero_espera -
                      viaticos -
                      auto -
                      refuerzo <
                    0
                      ? "text-red-600 font-bold"
                      : "text-blue-500 font-bold"
                  }
                >
                  {Number(
                    totalSuma - pago_fletero_espera - viaticos - auto - refuerzo
                  ).toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                    minimumIntegerDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </article>

          <div>
            <button
              type="submit"
              className="py-1.5 px-6 bg-primary hover:shadow-md text-white transition-all rounded-md font-semibold text-sm"
            >
              Actualizar la remuneracion
            </button>
          </div>
        </form>

        <ModalCrearClienteRemuneracion
          datosCliente={datosCliente}
          setDatosCliente={setDatosCliente}
        />
        <ModalEditarClienteRemuneracion
          datosCliente={datosCliente}
          setDatosCliente={setDatosCliente}
          usuario={usuario}
        />
      </div>
    </dialog>
  );
};

const ModalEliminar = ({ idObtenida }) => {
  const { handleSubmit } = useForm();

  const { setRemuneraciones } = useRemuneracionContext();

  const onSubmit = async (formData) => {
    try {
      const ordenData = {
        datos: {
          ...formData,
        },
      };

      const res = await client.delete(
        `/remuneraciones/${idObtenida}`,
        ordenData
      );

      setRemuneraciones(res.data);

      document.getElementById("my_modal_eliminar").close();

      showSuccessToastError("Eliminado correctamente");
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  return (
    <dialog id="my_modal_eliminar" className="modal">
      <div className="modal-box rounded-md max-w-md">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <img
              className="w-44 mx-auto"
              src="https://app.holded.com/assets/img/document/doc_delete.png"
            />
          </div>
          <div className="font-semibold text-sm text-gray-400 text-center">
            REFERENCIA {idObtenida}
          </div>
          <div className="font-semibold text-[#FD454D] text-lg text-center">
            Eliminar la remuneracion cargada..
          </div>
          <div className="text-sm text-gray-400 text-center mt-1">
            El documento no podra ser recuperado nunca mas...
          </div>
          <div className="mt-4 text-center w-full px-16">
            <button
              type="submit"
              className="bg-red-500 py-1 px-4 text-center font-bold text-white text-sm rounded-md w-full"
            >
              Confirmar
            </button>{" "}
            <button
              type="button"
              onClick={() =>
                document.getElementById("my_modal_eliminar").close()
              }
              className="bg-orange-100 py-1 px-4 text-center font-bold text-orange-600 mt-2 text-sm rounded-md w-full"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};
