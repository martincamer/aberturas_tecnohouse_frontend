import React, { useEffect, useState } from "react";
import { FaArrowAltCircleRight, FaEdit, FaSearch } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { FaDeleteLeft } from "react-icons/fa6";
import { useAberturasContext } from "../../../context/AberturasProvider";
import { useForm } from "react-hook-form";
import client from "../../../api/axios";
import io from "socket.io-client";
import { useObtenerId } from "../../../helpers/obtenerId";
import {
  showSuccessToast,
  showSuccessToastError,
} from "../../../helpers/toast";
import { ModalActualizarAbertura, ModalCrearNuevaAbertura } from "./Aberturas";
import { formatearFecha } from "../../../helpers/formatearFecha";
import axios from "axios";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { ImprimirTodosLasSalidas } from "../../../components/pdf/ImprimirTodosLasSalidas";
import { useAuth } from "../../../context/AuthProvider";

export const Salidas = () => {
  const { salidas, fabricas, aberturas } = useAberturasContext();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFabrica, setSelectedFabrica] = useState("");

  let filteredData;

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

  filteredData = salidas.filter((item) => {
    // Buscar en fabrica
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearchTerm = item.fabrica
      .toLowerCase()
      .includes(searchTermLower);

    // Aplicar filtros adicionales
    const matchesFabricas =
      !selectedFabrica || item.fabrica === selectedFabrica;

    // Filtrar por rango de fechas
    const fechaInicioObj = new Date(fechaInicio);
    const fechaFinObj = new Date(fechaFin);
    const fechaOrden = new Date(item.created_at);
    const matchesFecha =
      fechaOrden >= fechaInicioObj && fechaOrden <= fechaFinObj;

    return matchesSearchTerm && matchesFabricas && matchesFecha;
  });

  filteredData.sort((a, b) => b.id - a.id);

  const { handleObtenerId, idObtenida } = useObtenerId();

  // Función para calcular el monto total de cantidades en `aberturas`
  const calcularMontoTotal = (aberturas) => {
    try {
      const aberturasArray = JSON.parse(aberturas);

      const montoTotal = aberturasArray.reduce((total, abertura) => {
        // Verificar si `cantidad` es un número
        if (typeof abertura.cantidad === "number") {
          return total + abertura.cantidad;
        } else if (typeof abertura.cantidad === "string") {
          // Si `cantidad` es un string, intentar convertirlo a número
          const cantidadNumerica = parseInt(abertura.cantidad, 10) || 0;
          return total + cantidadNumerica;
        }
        return total;
      }, 0);

      return montoTotal;
    } catch (error) {
      console.error("Error al calcular el monto total:", error);
      return 0;
    }
  };

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
  const totalCantidad = calcularTotalCantidad(filteredData);

  function renderRemitos(remitosString) {
    if (!remitosString || remitosString === "") {
      return <p>No hay remitos disponibles</p>;
    }

    try {
      const remitosArray = JSON.parse(remitosString);

      return (
        <ul className="flex gap-2 max-md:flex-col max-md:gap-1">
          {remitosArray.map((remito, index) => (
            <li key={index}>
              <strong>Numero remito:</strong> {remito.numero}
            </li>
          ))}
        </ul>
      );
    } catch (error) {
      console.error("Error parsing remitos JSON:", error);
      return <p>Error parsing remitos JSON</p>;
    }
  }

  const totalContratos = filteredData?.reduce((total, item) => {
    const contratos = JSON.parse(item?.contratos); // Convierte el texto JSON a un objeto
    return total + contratos?.length; // Suma la cantidad de contratos
  }, 0);

  console.log("data filtrada", filteredData);

  return (
    <section className="w-full h-full min-h-screen max-h-full">
      {user.fabrica === "aberturas" && (
        <>
          <div className=" bg-gray-100 py-10 px-10 flex justify-between items-center max-md:flex-col max-md:gap-3">
            <p className="font-extrabold text-2xl bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent ">
              Sector de salidas.
            </p>
            <button
              onClick={() =>
                document.getElementById("my_modal_nueva_salida").showModal()
              }
              type="button"
              className="bg-gradient-to-r from-pink-500 to-blue-400 py-1 px-4 rounded-md text-white font-semibold text-sm"
            >
              Cargar nueva salida de aberturas
            </button>
          </div>

          <div className="grid grid-cols-4 px-10 py-5 gap-3 max-md:px-5 max-md:grid-cols-1">
            <div className="bg-gray-800 py-5 px-5 rounded-2xl flex flex-col gap-2 justify-center items-center">
              <div>
                <p className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent text-xl font-extrabold">
                  Total aberturas entregadas.
                </p>
              </div>
              <div>
                <p className="bg-gradient-to-r from-green-200 to-blue-400 bg-clip-text text-transparent text-3xl font-bold">
                  {totalCantidad}
                </p>
              </div>
            </div>
            <div className="bg-gray-800 py-5 px-5 rounded-2xl flex flex-col gap-2 justify-center items-center">
              <div>
                <p className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent text-xl font-extrabold">
                  Contratos de salidas.
                </p>
              </div>
              <div>
                <p className="bg-gradient-to-r from-green-200 to-blue-400 bg-clip-text text-transparent text-3xl font-bold">
                  {totalContratos}
                </p>
              </div>
            </div>
          </div>
          {/* <div className="dropdown dropdown-hover px-10 py-10 max-md:px-5">
            <div
              tabIndex={0}
              role="button"
              className="bg-primary py-2 px-4 rounded-md text-white font-semibold text-sm"
            >
              Estadisticas de las salidas
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-gray-800 rounded-md z-[1] w-[600px] p-2 shadow mt-0.5 max-md:w-[300px]"
            >
              <div className="grid grid-cols-2 text-base py-3 px-3 gap-2 max-md:grid-cols-1">
                <div className="bg-white rounded-md py-5 px-5 flex flex-col gap-1">
                  <p className="font-medium text-gray-800">
                    Total aberturas entregadas
                  </p>
                  <p className="font-bold text-gray-800">{totalCantidad}</p>
                </div>{" "}
                <div className="bg-white rounded-md py-5 px-5 flex flex-col gap-1">
                  <p className="font-medium text-gray-800">
                    Aberturas en stock sistema
                  </p>
                  <p className="font-bold text-gray-800">{totalStock}</p>
                </div>
                <div className="bg-white rounded-md py-5 px-5 flex flex-col gap-1">
                  <p className="font-medium text-gray-800">
                    Contratos de salidas
                  </p>
                  <p className="font-bold text-blue-500">{totalContratos}</p>
                </div>
              </div>
            </ul>
          </div> */}
          <div className="px-10 font-bold mb-1 max-md:px-5">
            <p>Filtrar por fecha</p>
          </div>
          <div className="flex px-10 pb-3 max-md:px-5">
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
          <div className="py-0 px-10 max-md:px-5">
            <div className="flex gap-2 max-md:flex-col max-md:w-auto">
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

              <div>
                <select
                  value={selectedFabrica}
                  onChange={(e) => setSelectedFabrica(e.target.value)}
                  className="border border-gray-300 flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md outline-none font-semibold capitalize"
                >
                  <option
                    className="font-bold capitalize text-primary"
                    value=""
                  >
                    Seleccionar la fabrica...
                  </option>
                  {fabricas.map((fabrica) => (
                    <option
                      className="font-semibold"
                      key={fabrica.id}
                      value={fabrica.nombre}
                    >
                      {fabrica.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3">
              <PDFDownloadLink
                className="bg-gradient-to-r from-purple-500 to-blue-500 py-1.5 px-4 rounded-md text-white font-bold text-sm"
                fileName={`Resumen filtrado desde ${fechaInicio} - ${fechaFin}`}
                document={
                  <ImprimirTodosLasSalidas todasLasSalidas={filteredData} />
                }
              >
                Descargar resumen..
              </PDFDownloadLink>
            </div>
          </div>

          <div className="px-10 max-md:overflow-x-auto scrollbar-hidden pb-12 pt-5 max-md:px-3">
            <table className="table bg-gray-200 rounded-t-xl">
              <thead className="text-sm font-bold text-gray-800">
                <tr>
                  <th>Referencia</th>
                  <th>Fabrica de la salida</th>
                  <th>Total aberturas</th>
                  <th>Fecha de salida</th>
                  <th>Fecha de carga al sistema</th>
                  <th>Datos</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody className="text-xs font-medium capitalize bg-white ">
                {filteredData.map((fabrica) => (
                  <tr
                    className="hover:bg-gray-100/40 transition-all cursor-pointer"
                    key={fabrica.id}
                  >
                    <td>{fabrica.id}</td>
                    <td>{fabrica.fabrica}</td>
                    <td>
                      <div className="flex">
                        <p className="font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 py-1 px-3 rounded-md">
                          {calcularMontoTotal(fabrica.aberturas)}
                        </p>
                      </div>
                    </td>{" "}
                    {/* <td>{renderRemitos(fabrica.remitos)}</td> */}
                    <td>
                      <p>{formatearFecha(fabrica.fecha_salida)}</p>
                    </td>{" "}
                    <td>
                      <p>{formatearFecha(fabrica.created_at)}</p>
                    </td>
                    <td className="md:hidden">
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            handleObtenerId(fabrica.id),
                              document
                                .getElementById("my_modal_ver_imagenes_remitos")
                                .showModal();
                          }}
                          className="font-bold bg-primary text-white rounded-md py-1 px-2"
                        >
                          rem.
                        </button>{" "}
                        <button
                          onClick={() => {
                            handleObtenerId(fabrica.id),
                              document
                                .getElementById("my_modal_ver_aberturas")
                                .showModal();
                          }}
                          className="font-bold bg-blue-500 text-white rounded-md py-1 px-2"
                        >
                          aber.
                        </button>
                        <button
                          onClick={() => {
                            handleObtenerId(fabrica.id),
                              document
                                .getElementById("my_modal_ver_contratos")
                                .showModal();
                          }}
                          className="font-bold bg-green-500 text-white rounded-md py-1 px-2"
                        >
                          Contratos.
                        </button>
                      </div>
                    </td>
                    <td className="max-md:hidden">
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            handleObtenerId(fabrica.id),
                              document
                                .getElementById("my_modal_ver_imagenes_remitos")
                                .showModal();
                          }}
                          className="font-bold  bg-gradient-to-r from-yellow-500 to-green-500 text-white rounded-md py-1 px-2"
                        >
                          Ver remitos
                        </button>{" "}
                        <button
                          onClick={() => {
                            handleObtenerId(fabrica.id),
                              document
                                .getElementById("my_modal_ver_contratos")
                                .showModal();
                          }}
                          className="font-bold  bg-gradient-to-r from-yellow-500 to-green-500 text-white rounded-md py-1 px-2"
                        >
                          Ver contratos
                        </button>{" "}
                        <button
                          onClick={() => {
                            handleObtenerId(fabrica.id),
                              document
                                .getElementById("my_modal_ver_aberturas")
                                .showModal();
                          }}
                          className="font-bold  bg-gradient-to-r from-blue-500 to-gray-500 text-white rounded-md py-1 px-2"
                        >
                          Ver aberturas
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-3">
                        {/* <FaEdit className="text-xl text-blue-500 cursor-pointer" /> */}
                        <FaDeleteLeft
                          onClick={() => {
                            handleObtenerId(fabrica.id),
                              document
                                .getElementById("my_modal_eliminar")
                                .showModal();
                          }}
                          className="text-xl text-red-500 cursor-pointer"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* <div>
        <PDFViewer className="w-full h-[100vh]">
          <ImprimirTodosLasSalidas todasLasSalidas={filteredData} />
        </PDFViewer>
      </div> */}

          <ModalCrearNuevaSalida />
          <ModalEliminar idObtenida={idObtenida} />
          <ModalVerImagenesRemitos idObtenida={idObtenida} />
          <ModalVerAberturas idObtenida={idObtenida} />
          <ModalVerContratos idObtenida={idObtenida} />
        </>
      )}
    </section>
  );
};

export const ModalCrearNuevaSalida = () => {
  const { register, handleSubmit, reset } = useForm();
  const { setSalidas, fabricas, setAberturas, aberturas } =
    useAberturasContext();

  const [error, setError] = useState("");

  const [aberturasSeleccionadas, setAberturasSeleccionadas] = useState([]);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragging, setDragging] = useState(false);

  const uploadFiles = async (files) => {
    if (!files || files.length === 0) {
      return [];
    }

    const uploadFile = async (file) => {
      const data = new FormData();
      data.append("file", file);
      const uploadPreset = file.type.startsWith("image/")
        ? "imagenes"
        : "documentos";
      data.append("upload_preset", uploadPreset);

      try {
        const api = `https://api.cloudinary.com/v1_1/de4aqqalo/${
          file.type.startsWith("image/") ? "image" : "raw"
        }/upload`;
        const res = await axios.post(api, data);
        return res.data.secure_url;
      } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        return null;
      }
    };

    const promises = files.map(uploadFile);
    return Promise.all(promises);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    if (validFiles.length > 0) {
      setUploadedFiles((prevFiles) => [...prevFiles, ...validFiles]);
    }
    setDragging(false);
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    if (validFiles.length > 0) {
      setUploadedFiles((prevFiles) => [...prevFiles, ...validFiles]);
    }
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const [editandoIndex, setEditandoIndex] = useState(null);
  const [cantidadEditada, setCantidadEditada] = useState("");

  const handleEditarCantidad = (index) => {
    setEditandoIndex(index);
    setCantidadEditada(aberturasSeleccionadas[index].cantidad);
  };

  const handleGuardarCantidad = () => {
    setAberturasSeleccionadas((prev) => {
      const updated = [...prev];
      updated[editandoIndex] = {
        ...updated[editandoIndex],
        cantidad: cantidadEditada,
      };
      return updated;
    });
    setEditandoIndex(null);
    setCantidadEditada(""); // Resetear el valor de cantidad editada
  };

  const handleCancelarEdicion = () => {
    setEditandoIndex(null);
    setCantidadEditada(""); // Resetear el valor de cantidad editada
  };

  const handleEliminarAbertura = (id) => {
    // Encuentra la abertura que se está eliminando
    const aberturaAEliminar = aberturasSeleccionadas.find(
      (abertura) => abertura.id === id
    );

    // Asegúrate de que se encontró una abertura para eliminar
    if (aberturaAEliminar) {
      // Convertir cantidad a número y manejar casos donde la conversión pueda fallar
      const cantidadEliminar = Number(aberturaAEliminar.cantidad, 10);
      const cantidadEliminarValidada = isNaN(cantidadEliminar)
        ? 0
        : cantidadEliminar;

      // Actualiza el stock de la abertura en la lista de aberturas
      const nuevasAberturas = aberturas.map((abertura) => {
        if (abertura.id === aberturaAEliminar.id) {
          // Devuelve el stock a la abertura existente
          return {
            ...abertura,
            stock: (Number(abertura.stock) || 0) + cantidadEliminarValidada,
          };
        }
        return abertura;
      });

      // Actualiza el estado de aberturas con el stock actualizado
      setAberturas(nuevasAberturas);
    }

    // Filtra la lista de aberturas seleccionadas para eliminar el elemento
    const nuevasAberturasSeleccionadas = aberturasSeleccionadas.filter(
      (abertura) => abertura.id !== id
    );

    // Actualiza el estado con la lista filtrada
    setAberturasSeleccionadas(nuevasAberturasSeleccionadas);
  };

  const handleSeleccionarAbertura = (
    id,
    idRandom,
    detalle,
    color,
    linea,
    tipo,
    ancho_alto,
    cantidad
  ) => {
    const data = {
      id,
      idRandom,
      detalle,
      color,
      linea,
      tipo,
      ancho_alto,
      cantidad,
    };

    if (cantidad > 0) {
      // Actualiza el stock
      const updatedAberturas = aberturas.map((ab) =>
        ab.id === id ? { ...ab, stock: ab.stock - Number(cantidad) } : ab
      );

      // Actualiza el estado global (o el estado en el contexto)
      setAberturas(updatedAberturas);
    }

    setAberturasSeleccionadas([...aberturasSeleccionadas, data]);
  };

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_URL, {
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("crear-salida", (nuevaSalida) => {
      setSalidas(nuevaSalida);
    });

    return () => newSocket.close();
  }, []);

  const [remitos, setRemitos] = useState([]);

  // Función para agregar un remito
  const handleAgregarRemito = (idRandom, numero) => {
    const newRemito = { idRandom, numero };
    setRemitos([...remitos, newRemito]);
  };

  // Función para editar un remito
  const handleEditarRemito = (index, nuevoNumero) => {
    const remitosActualizados = [...remitos];
    remitosActualizados[index].numero = nuevoNumero;
    setRemitos(remitosActualizados);
  };

  // Función para eliminar un remito
  const handleEliminarRemito = (index) => {
    const remitosFiltrados = remitos.filter((remito, idx) => idx !== index);
    setRemitos(remitosFiltrados);
  };

  // Estado para controlar la edición de un remito
  const [editIndex, setEditIndex] = useState(-1);

  const [contratos, setContratos] = useState([]);

  // Función para agregar un remito
  const handleAgregarContratos = (idRandom, nombre) => {
    const newContrato = { idRandom, nombre };
    setContratos([...contratos, newContrato]);
  };

  // Función para editar un remito
  const handleEditarContratos = (index, nuevoNombre) => {
    const contratosActualizados = [...contratos];
    contratosActualizados[index].nombre = nuevoNombre;
    setContratos(contratosActualizados);
  };

  // Función para eliminar un remito
  const handleEliminarContratos = (index) => {
    const contratosFiltrados = contratos.filter(
      (contrato, idx) => idx !== index
    );
    setContratos(contratosFiltrados);
  };

  // Estado para controlar la edición de un remito
  const [editIndexContratos, setEditIndexContratos] = useState(-1);

  const onSubmit = async (formData) => {
    const uploadedFileUrls = await uploadFiles(uploadedFiles);

    try {
      const aberturaData = {
        ...formData,
        aberturas: aberturasSeleccionadas,
        remitos: remitos,
        contratos: contratos,
        files: uploadedFileUrls, // Añade las URLs de los archivos subidos
      };

      const res = await client.post("/crear-salida", aberturaData);

      if (socket) {
        socket.emit("crear-salida", res?.data.salidas);
      }

      setAberturas(res.data.aberturas);
      showSuccessToast("Creado correctamente");

      setAberturasSeleccionadas([]);
      setRemitos([]);

      document.getElementById("my_modal_nueva_salida").close();

      reset();
    } catch (error) {
      console.error("Error creating product:", error);
      console.log("asdsadsad", error.response.data.message);
      setTimeout(() => {
        setError("");
      }, 2000);
      setError(error.response.data.message);
    }
  };

  const totalCantidad = aberturasSeleccionadas.reduce((total, abertura) => {
    const cantidad = abertura.cantidad;

    // Parsea la cantidad como número entero
    const cantidadNumerica = parseInt(cantidad, 10) || 0;

    // Suma al total
    return total + cantidadNumerica;
  }, 0);

  return (
    <dialog id="my_modal_nueva_salida" className="modal">
      <div className="modal-box rounded-md max-w-full h-full max-md:max-h-full max-md:w-full max-md:rounded-none">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg">Cargar nueva salida de aberturas</h3>
        <p className="py-0 text-sm font-medium">
          Rellena los siguientes campos, para poder cargar la salida..
        </p>
        <form
          className="mt-4 flex flex-col items-start gap-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm">Seleccionar la fabrica</label>
            <div className="flex gap-2 items-center">
              <select
                {...register("fabrica", { required: true })}
                type="text"
                className="border border-gray-300 py-2 px-2 rounded-md font-medium text-sm outline-none w-auto capitalize"
              >
                <option className="font-bold text-primary">
                  Seleccionar la fabrica
                </option>
                {fabricas.map((fabrica) => (
                  <option
                    key={fabrica.id}
                    value={fabrica.nombre}
                    className="font-semibold"
                  >
                    {fabrica.nombre}
                  </option>
                ))}
              </select>
              <div>
                <IoMdAdd
                  onClick={() =>
                    document
                      .getElementById("my_modal_crear_fabrica")
                      .showModal()
                  }
                  className="bg-white border border-gray-300 rounded-md py-2 px-2 text-4xl text-gray-800 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm">Fecha de la salida</label>
            <input
              {...register("fecha_salida", { required: true })}
              type="date"
              className="border border-gray-300 py-2 px-2 rounded-md font-medium text-sm outline-none w-auto"
            />
          </div>

          <div className="mt-3">
            {" "}
            <button
              onClick={() =>
                document.getElementById("my_modal_cargar_remitos").showModal()
              }
              type="button"
              className="text-sm font-bold bg-gradient-to-r from-primary to-purple-500 py-2 px-2 rounded-md text-white"
            >
              Cargar numeros de remitos
            </button>
          </div>

          <div className="px-0 max-md:overflow-x-auto scrollbar-hidden w-full">
            <table className="table">
              <thead className="text-sm font-bold text-gray-800">
                <tr>
                  <th>Refer.</th>
                  <th>Numero del remito</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody className="text-xs font-medium capitalize">
                {remitos.map((remito, index) => (
                  <tr key={index}>
                    <td>{remito.idRandom}</td>
                    <td>
                      {editIndex === index ? (
                        <div className="flex">
                          <input
                            className="border border-gray-300 py-1 px-2 rounded-md outline-none"
                            type="text"
                            value={remito.numero}
                            onChange={(e) =>
                              handleEditarRemito(index, e.target.value)
                            }
                            onBlur={() => setEditIndex(-1)}
                            autoFocus
                          />
                          <FaEdit className="ml-2 text-blue-500 cursor-pointer" />
                        </div>
                      ) : (
                        <p onClick={() => setEditIndex(index)}>
                          {remito.numero}
                        </p>
                      )}
                    </td>
                    <td>
                      <button onClick={() => handleEliminarRemito(index)}>
                        <FaDeleteLeft className="text-xl text-red-500 cursor-pointer" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3">
            <button
              onClick={() =>
                document.getElementById("my_modal_contratos").showModal()
              }
              type="button"
              className="text-sm font-bold bg-gradient-to-r from-primary to-purple-500 py-2 px-2 rounded-md text-white"
            >
              Cargar contratos
            </button>
          </div>

          <div className="px-0 max-md:overflow-x-auto scrollbar-hidden w-full">
            <table className="table">
              <thead className="text-sm font-bold text-gray-800">
                <tr>
                  <th>Refer.</th>
                  <th>Numero del remito</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody className="text-xs font-medium capitalize">
                {contratos.map((contrato, index) => (
                  <tr key={index}>
                    <td>{contrato.idRandom}</td>
                    <td>
                      {editIndexContratos === index ? (
                        <div className="flex">
                          <input
                            className="border border-gray-300 py-1 px-2 rounded-md outline-none"
                            type="text"
                            value={contrato.nombre}
                            onChange={(e) =>
                              handleEditarContratos(index, e.target.value)
                            }
                            onBlur={() => setEditIndexContratos(-1)}
                            autoFocus
                          />
                          <FaEdit className="ml-2 text-blue-500 cursor-pointer" />
                        </div>
                      ) : (
                        <p onClick={() => setEditIndexContratos(index)}>
                          {contrato.nombre}
                        </p>
                      )}
                    </td>
                    <td>
                      <button onClick={() => handleEliminarContratos(index)}>
                        <FaDeleteLeft className="text-xl text-red-500 cursor-pointer" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex gap-2 max-md:flex-col max-md:w-full">
            <button
              onClick={() =>
                document
                  .getElementById("my_modal_seleccionar_aberturas")
                  .showModal()
              }
              type="button"
              className="text-sm font-bold bg-gradient-to-r from-green-500 to-blue-500 py-2 px-2 rounded-md text-white"
            >
              Cargar abertura a la salida
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("my_modal_cargar_aberturas_al_sistmea")
                  .showModal()
              }
              type="button"
              className="text-sm font-bold bg-gradient-to-r from-sky-500 to-purple-500 py-2 px-2 rounded-md text-white"
            >
              Cargar nueva abertura al sistema
            </button>
            <p className="border border-gray-300 py-1 px-6 font-bold rounded-md">
              {totalCantidad} aberturas cargadas.
            </p>
          </div>
          {error && (
            <div className="flex justify-center items-center w-full">
              <p className="bg-red-100/90 text-red-800 py-1 px-2 rounded-md font-bold text-sm text-center">
                {error}
              </p>
            </div>
          )}
          <div className="px-0 max-md:overflow-x-auto max-md:h-[30vh] scrollbar-hidden w-full">
            <table className="table">
              <thead className="text-sm font-bold text-gray-800">
                <tr>
                  <th>ID.</th>
                  <th>Refer.</th>
                  <th>Detalle</th>
                  <th>Color</th>
                  <th>Linea</th>
                  <th>Tipo</th>
                  <th>Anchoxalto</th>
                  <th>Cantidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody className="text-xs font-medium capitalize">
                {aberturasSeleccionadas.map((abertura, index) => (
                  <tr key={abertura.id}>
                    <td>{abertura.id}</td>
                    <td>{abertura.idRandom}</td>
                    <td>{abertura.detalle}</td>
                    <td>{abertura.color}</td>
                    <td>{abertura.linea}</td>
                    <td>{abertura.tipo}</td>
                    <td>{abertura.ancho_alto}</td>
                    <td>
                      {editandoIndex === index ? (
                        <div className="flex">
                          <input
                            type="text"
                            value={cantidadEditada}
                            onChange={(e) => setCantidadEditada(e.target.value)}
                            className="p-1 border border-gray-300 rounded-md font-bold outline-none w-[50px] text-center"
                          />
                          <button
                            onClick={handleGuardarCantidad}
                            className="ml-2 text-blue-500"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={handleCancelarEdicion}
                            className="ml-2 text-red-500"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex">
                          <p className="bg-green-100/90 text-green-700 py-1 px-3 rounded-md font-bold">
                            {abertura.cantidad}
                          </p>
                          <FaEdit
                            onClick={() => handleEditarCantidad(index)}
                            className="ml-2 text-blue-500 cursor-pointer"
                          />
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-3">
                        <FaEdit
                          className="text-xl text-blue-500 cursor-pointer"
                          onClick={() => handleEditarCantidad(index)}
                        />
                        <FaDeleteLeft
                          onClick={() => handleEliminarAbertura(abertura.id)}
                          className="text-xl text-red-500 cursor-pointer"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="my-5">
            <FileDrop
              dragging={dragging}
              handleDragLeave={handleDragLeave}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleFileChange={handleFileChange}
              handleRemoveFile={handleRemoveFile}
              uploadedFile={uploadedFiles}
            />
          </div>
          <div className="mt-2">
            <button
              type="submit"
              className="py-1.5 px-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:shadow-md text-white transition-all rounded-md font-semibold text-sm"
            >
              Cargar la salida
            </button>
          </div>
        </form>

        <ModalNuevaFabrica />
        <ModalSeleccionarAberturas
          handleSeleccionarAbertura={handleSeleccionarAbertura}
        />
        <ModalCargarAberturasAlSistema />
        <ModalRemitosCargar handleSeleccionarRemito={handleAgregarRemito} />
        <ModalContratos handleAgregarContratos={handleAgregarContratos} />
      </div>
    </dialog>
  );
};

export const ModalCargarAberturasAlSistema = ({}) => {
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
    <dialog id="my_modal_cargar_aberturas_al_sistmea" className="modal">
      <div className="modal-box w-full h-full max-w-full max-h-full rounded-none max-md:max-h-full max-md:w-full max-md:rounded-none max-md:h-full">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>

        <div className="mb-4 font-bold text-lg">
          <h3>Cargar aberturas del sistema o editarlas.</h3>
        </div>

        <div className="mb-4">
          <button
            onClick={() =>
              document.getElementById("my_modal_nueva_abertura").showModal()
            }
            type="button"
            className="bg-gradient-to-r from-pink-500 to-purple-500 py-1 px-4 rounded-md text-white font-semibold text-sm"
          >
            Cargar nueva abertura
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="border border-gray-300 flex items-center gap-2 w-1/5 px-2 py-1.5 text-sm rounded-md">
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
                <th>Stock</th>
                <th>Acciones</th>
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
                      <p
                        className={`${
                          abertura.stock > 0
                            ? "bg-green-100/90 text-green-700"
                            : "bg-red-100/90 text-red-700"
                        } py-1 px-2 rounded-md font-bold`}
                      >
                        {abertura.stock}
                      </p>
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-3">
                      <FaEdit
                        onClick={() => {
                          handleObtenerId(abertura.id),
                            document
                              .getElementById("my_modal_actualizar_abertura")
                              .showModal();
                        }}
                        className="text-xl text-blue-500 cursor-pointer"
                      />
                      {/* <FaDeleteLeft
                        onClick={() => {
                          handleObtenerId(abertura.id),
                            document
                              .getElementById("my_modal_eliminar")
                              .showModal();
                        }}
                        className="text-xl text-red-500 cursor-pointer"
                      /> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ModalCrearNuevaAbertura />
        <ModalActualizarAbertura idObtenida={idObtenida} />
      </div>
    </dialog>
  );
};

// Componente FileDrop
const FileDrop = ({
  dragging,
  handleDragLeave,
  handleDragOver,
  handleDrop,
  handleFileChange,
  handleRemoveFile,
  uploadedFile,
}) => {
  const renderUploadedFiles = () => {
    if (!uploadedFile || uploadedFile.length === 0) return null;

    return (
      <div className="file-preview-container grid grid-cols-2 gap-5 h-[30vh] max-md:grid-cols-1 overflow-y-scroll scroll-bar px-2">
        {uploadedFile.map((file, index) => (
          <div key={index} className="file-preview mt-5">
            <img
              src={URL.createObjectURL(file)}
              alt={`Preview ${index}`}
              className="preview-image max-w-full max-h-[600px]"
            />
            <div className="mt-2">
              <button
                onClick={() => handleRemoveFile(index)}
                className="font-bold text-sm bg-red-100/90 px-2 py-2 rounded-md text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`dropzone ${dragging ? "dragging" : ""}`}
    >
      <input
        className="bg-gray-800 py-2 px-2 rounded-md text-white font-semibold text-sm"
        type="file"
        multiple
        onChange={handleFileChange}
        accept="image/*"
      />
      {renderUploadedFiles()}
    </div>
  );
};

export const ModalSeleccionarAberturas = ({ handleSeleccionarAbertura }) => {
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
    <dialog id="my_modal_seleccionar_aberturas" className="modal">
      <div className="modal-box w-full h-full max-w-full max-h-full rounded-none max-md:max-h-full max-md:w-full max-md:rounded-none max-md:h-full">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>

        <div className="flex gap-2 mb-4 max-md:flex-col max-md:w-auto max-md:py-5">
          <div className="border border-gray-300 flex items-center gap-2 w-1/5 px-2 max-md:w-auto py-1.5 text-sm rounded-md">
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
                <th>Stock</th>
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
                      <p
                        className={`${
                          abertura.stock > 0
                            ? "bg-green-100/90 text-green-700"
                            : "bg-red-100/90 text-red-700"
                        } py-1 px-2 rounded-md font-bold`}
                      >
                        {abertura.stock}
                      </p>
                    </div>
                  </td>
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
                        className="bg-gradient-to-r from-violet-500 to-blue-500 py-1 px-2 rounded-md text-white font-bold"
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
        <ModalCantidad
          idObtenida={idObtenida}
          handleSeleccionarAbertura={handleSeleccionarAbertura}
        />
      </div>
    </dialog>
  );
};

export const ModalCantidad = ({ idObtenida, handleSeleccionarAbertura }) => {
  const [abertura, setAbertura] = useState([]);
  const [cantidades, setCantidades] = useState(0);
  const [detalle, setDetalle] = useState("");
  const [linea, setLinea] = useState("");
  const [color, setColor] = useState("");
  const [tipo, setTipo] = useState("");
  const [medida, setMedida] = useState("");

  const generateRandomId = () => Math.floor(Math.random() * 1000000);
  const idRandom = generateRandomId(); // Genera un ID aleatorio

  useEffect(() => {
    const obtenerDatos = async () => {
      const res = await client.get(`/abertura/${idObtenida}`);

      setAbertura(res.data);
      console.log("asdasd", res.data);
      setDetalle(res.data.detalle);
      setMedida(res.data.ancho_alto);
      setColor(res.data.color);
      setTipo(res.data.tipo);
      setLinea(res.data.linea);
    };
    obtenerDatos();
  }, [idObtenida]);

  return (
    <dialog id="my_modal_cantidad" className="modal">
      <div className="modal-box rounded-md max-w-3xl max-md:h-full max-md:w-full max-md:max-w-full max-md:max-h-full max-md:rounded-none">
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
            <div className="font-bold text-sm text-blue-500 flex flex-col gap-1">
              Detalle de la abertura
              <input
                className="outline-none border border-gray-300 rounded-md py-1.5 px-2 text-black w-full"
                value={detalle}
                onChange={(e) => setDetalle(e.target.value)}
              />
            </div>{" "}
            <div className="font-bold text-sm text-blue-500 flex flex-col gap-1">
              Ancho x Alto
              <input
                className="outline-none border border-gray-300 rounded-md py-1.5 px-2 text-black w-full"
                value={medida}
                onChange={(e) => setMedida(e.target.value)}
              />
            </div>
            <div className="font-bold text-sm text-blue-500  grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <p>Tipo</p>
                <select
                  className="outline-none border border-gray-300 rounded-md py-1.5 px-2 text-black w-full"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                >
                  <option
                    className="font-bold capitalize text-primary"
                    value=""
                  >
                    Seleccionar el tipo...
                  </option>
                  <option value={"mosquiteros"} className="font-semibold">
                    Mosquiteros
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
              </div>{" "}
              <div className="flex flex-col gap-1">
                <p>Linea</p>
                <select
                  className="outline-none border border-gray-300 rounded-md py-1.5 px-2 text-black w-full capitalize"
                  value={linea}
                  onChange={(e) => setLinea(e.target.value)}
                >
                  <option
                    className="font-bold capitalize text-primary"
                    value=""
                  >
                    Seleccionar la linea...
                  </option>{" "}
                  <option className="font-semibold capitalize" value="herrero">
                    herrero
                  </option>
                  <option className="font-semibold capitalize" value="modena">
                    modena
                  </option>
                  <option
                    className="font-semibold capitalize"
                    value="modena a30"
                  >
                    modena a30
                  </option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <p>Color</p>
                <select
                  className="outline-none border border-gray-300 rounded-md py-1.5 px-2 text-black w-full capitalize"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                >
                  <option
                    className="font-bold capitalize text-primary"
                    value=""
                  >
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
            </div>
            <div className="font-bold text-sm text-blue-500 flex flex-col gap-2">
              Cantidad
              <div>
                <input
                  className="border border-gray-300 rounded-md py-2 px-2 mb-3 font-bold text-sm outline-none text-black"
                  onChange={(e) => setCantidades(e.target.value)}
                  value={cantidades}
                  type="text"
                />
              </div>
            </div>{" "}
          </div>

          <div className="flex">
            <button
              onClick={() => {
                handleSeleccionarAbertura(
                  abertura.id,
                  abertura.id + idRandom,
                  detalle,
                  abertura.color,
                  abertura.linea,
                  abertura.tipo,
                  medida,
                  cantidades
                ),
                  setCantidades(0),
                  document.getElementById("my_modal_cantidad").close(),
                  document
                    .getElementById("my_modal_seleccionar_aberturas")
                    .close();
              }}
              type="button"
              className="bg-gradient-to-r from-pink-500 to-purple-500 py-1 px-2 rounded-md text-white font-bold text-sm"
            >
              Seleccionar cantidad
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

const ModalEliminar = ({ idObtenida }) => {
  const { handleSubmit } = useForm();

  const { setSalidas, setAberturas } = useAberturasContext();

  const onSubmit = async (formData) => {
    try {
      const ordenData = {
        datos: {
          ...formData,
        },
      };

      const res = await client.delete(`/salidas/${idObtenida}`, ordenData);

      setSalidas(res.data.salidas);
      setAberturas(res.data.aberturas);

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
            Eliminar el pedido cargado..
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

export const ModalNuevaFabrica = () => {
  const { register, handleSubmit, reset } = useForm();
  const { setFabricas } = useAberturasContext();

  const onSubmit = async (formData) => {
    try {
      const fabricaData = {
        ...formData,
      };

      const res = await client.post("/crear-fabrica", fabricaData);

      setFabricas(res.data);

      showSuccessToast("Creado correctamente");

      document.getElementById("my_modal_crear_fabrica").close();

      reset();
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  return (
    <dialog id="my_modal_crear_fabrica" className="modal">
      <div className="modal-box rounded-md max-md:max-h-full max-md:w-full max-md:rounded-none max-md:h-full">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg">Cargar nueva fabrica</h3>
        <p className="py-0 text-sm font-medium">
          Rellena los siguientes campos, para poder cargar la fabrica
        </p>
        <form
          className="mt-4 flex flex-col gap-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm">Nombre de la fabrica</label>
            <input
              {...register("nombre", { required: true })}
              type="text"
              placeholder="Escribe el nombre.."
              className="border border-gray-300 py-2 px-2 rounded-md font-medium text-sm outline-none w-auto"
            />
          </div>

          <div className="mt-2">
            <button
              type="submit"
              className="py-1.5 px-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:shadow-md text-white transition-all rounded-md font-semibold text-sm"
            >
              Cargar la fabrica
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

const ModalVerImagenesRemitos = ({ idObtenida }) => {
  const [imageUrls, setImageUrls] = useState([]);
  const [remitos, setRemitos] = useState([]);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        // Obtener los datos desde la API
        const respuesta = await client.get(`/salida/${idObtenida}`);
        const data = respuesta.data;

        // Obtener imágenes
        const parsedUrls = JSON.parse(data.files);
        setImageUrls(parsedUrls); // Verify if this is an array

        const parsedRemitos = JSON.parse(data.remitos);
        setRemitos(parsedRemitos); // Verify if this is an array
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    obtenerDatos();
  }, [idObtenida]);

  return (
    <dialog id="my_modal_ver_imagenes_remitos" className="modal">
      <div className="modal-box rounded-md max-w-4xl h-full">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg">Imágenes de remitos y numero.</h3>
        {/* Renderizar remitos */}
        <div className="flex flex-col gap-2 mt-4">
          {remitos &&
            remitos?.map((remito, index) => (
              <div key={index} className="remito-item">
                <p className="font-bold text-sm">
                  Número de remito:{" "}
                  <span className="text-blue-500 font-extrabold">
                    {remito.numero}
                  </span>
                </p>
              </div>
            ))}
        </div>
        {/* Renderizar imágenes */}
        <div className="flex flex-col gap-2 mt-4">
          {imageUrls &&
            imageUrls?.map((url, index) => (
              <div key={index} className="file-preview">
                <img
                  src={url}
                  alt={`Imagen ${index}`}
                  className="preview-image w-full h-auto object-cover"
                />
              </div>
            ))}
        </div>
      </div>
    </dialog>
  );
};

export const ModalVerAberturas = ({ idObtenida }) => {
  const [datos, setDatos] = useState([]);
  const [aberturas, setAberturas] = useState([]);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        // Obtener los datos desde la API
        const respuesta = await client.get(`/salida/${idObtenida}`);
        setDatos(respuesta.data);

        // Parsear aberturas y actualizar estado
        const aberturasArray = JSON.parse(respuesta.data.aberturas);
        setAberturas(aberturasArray);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    obtenerDatos();
  }, [idObtenida]);

  return (
    <dialog id="my_modal_ver_aberturas" className="modal">
      <div className="modal-box rounded-md max-w-full h-full">
        <form method="dialog">
          {/* Botón para cerrar el modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg">
          Aberturas entregadas a la fabrica{" "}
          <span className="capitalize text-primary">{datos?.fabrica}</span>
        </h3>

        <div className="px-0 max-md:overflow-x-auto scrollbar-hidden pb-12 pt-5">
          <table className="table">
            <thead className="text-sm font-bold text-gray-800">
              <tr>
                <th>Referencia</th>
                <th>Detalle</th>
                <th>Medida</th>
                <th>Color</th>
                <th>Linea</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                {/* Agrega más columnas según sea necesario */}
              </tr>
            </thead>

            <tbody className="text-xs font-medium capitalize">
              {aberturas.map((abertura) => (
                <tr key={abertura.id}>
                  <td>{abertura.idRandom}</td>
                  <td>{abertura.detalle}</td>
                  <td>{abertura.ancho_alto}</td>
                  <td>{abertura.color}</td>
                  <td>{abertura.linea}</td>
                  <td>{abertura.tipo}</td>
                  <td className="font-extrabold text-primary">
                    {abertura.cantidad}
                  </td>
                  {/* Agrega más celdas según sea necesario */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </dialog>
  );
};

export const ModalRemitosCargar = ({ handleSeleccionarRemito }) => {
  const [numero, setNumero] = useState("");

  const generateRandomId = () => Math.floor(Math.random() * 1000000);
  const idRandom = generateRandomId(); // Genera un ID aleatorio
  return (
    <dialog id="my_modal_cargar_remitos" className="modal">
      <div className="modal-box rounded-md max-md:max-h-full max-md:w-full max-md:rounded-none max-md:h-full">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <form>
          <div className="mb-2">
            <p className="text-lg font-bold">Cargar remito.</p>
          </div>
          <input
            className="border border-gray-300 rounded-md py-2 px-2 mb-3 font-bold text-sm outline-none"
            onChange={(e) => setNumero(e.target.value)}
            value={numero}
            placeholder="Escribir el remito ej: 1255-05"
            type="text"
          />

          <div className="flex">
            <button
              onClick={() => {
                handleSeleccionarRemito(idRandom, numero),
                  setNumero(""),
                  document.getElementById("my_modal_cargar_remitos").close();
              }}
              type="button"
              className="bg-gradient-to-r from-pink-500 to-purple-500 py-1 px-2 rounded-md text-white font-bold text-sm"
            >
              Cargar remito
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export const ModalContratos = ({ handleAgregarContratos }) => {
  const [nombre, setNombre] = useState("");

  const generateRandomId = () => Math.floor(Math.random() * 1000000);
  const idRandom = generateRandomId(); // Genera un ID aleatorio

  return (
    <dialog id="my_modal_contratos" className="modal">
      <div className="modal-box rounded-md max-md:max-h-full max-md:w-full max-md:rounded-none max-md:h-full">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <form className="w-full">
          <div className="mb-2">
            <p className="text-lg font-bold">Cargar contrato.</p>
          </div>
          <input
            className="border border-gray-300 rounded-md py-2 px-2 mb-3 font-bold text-sm outline-none w-full"
            onChange={(e) => setNombre(e.target.value)}
            value={nombre}
            placeholder="Escribir el nombre y contrato ej: martin 125-55"
            type="text"
          />

          <div className="flex">
            <button
              onClick={() => {
                handleAgregarContratos(idRandom, nombre),
                  setNombre(""),
                  document.getElementById("my_modal_contratos").close();
              }}
              type="button"
              className="bg-gradient-to-r from-pink-500 to-purple-500 py-1 px-2 rounded-md text-white font-bold text-sm"
            >
              Cargar contrato/cliente.
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

const ModalVerContratos = ({ idObtenida }) => {
  const [contratos, setContratos] = useState([]);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        // Obtener los datos desde la API
        const respuesta = await client.get(`/salida/${idObtenida}`);
        const data = respuesta.data;

        // Obtener remitos
        const parsedRemitos = JSON.parse(data.contratos);
        setContratos(parsedRemitos);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    obtenerDatos();
  }, [idObtenida]);

  return (
    <dialog id="my_modal_ver_contratos" className="modal">
      <div className="modal-box rounded-md max-w-3xl h-auto">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg">
          Contratos y clientes de la salida.
        </h3>
        {/* Renderizar remitos */}
        <div className="flex flex-col gap-2 mt-4">
          {contratos.map((remito, index) => (
            <div key={index} className="remito-item">
              <p className="font-bold text-sm capitalize">
                Contrato/Cliente:{" "}
                <span className="text-blue-500 font-extrabold">
                  {remito.nombre}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </dialog>
  );
};
