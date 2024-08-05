import React, { useEffect, useState } from "react";
import { FaArrowAltCircleRight, FaEdit, FaSearch } from "react-icons/fa";
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

export const Aberturas = () => {
  const { aberturas } = useAberturasContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedLinea, setSelectedLinea] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("");

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
    <section className="w-full h-full min-h-screen max-h-full">
      <div className="bg-gray-100 py-10 px-10 flex justify-between items-center max-md:flex-col max-md:gap-3">
        <p className="font-bold text-gray-900 text-xl">Sector de aberturas.</p>
        <button
          onClick={() =>
            document.getElementById("my_modal_nueva_abertura").showModal()
          }
          type="button"
          className="bg-primary py-1 px-4 rounded-md text-white font-semibold text-sm"
        >
          Cargar nueva abertura
        </button>
      </div>

      <div className="py-10 px-10 max-md:px-5">
        <div className="flex gap-2 max-md:flex-col max-md:w-auto">
          <div className="border border-gray-300  max-md:w-auto  flex items-center gap-2 w-1/5 px-2 py-1.5 text-sm rounded-md">
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
                Ventana corrediza
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
      </div>

      <div className="px-10 max-md:overflow-x-auto scrollbar-hidden max-md:px-5">
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
            {filteredData.map((abertura) => (
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
                    <FaDeleteLeft
                      onClick={() => {
                        handleObtenerId(abertura.id),
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

      <ModalCrearNuevaAbertura />
      <ModalActualizarAbertura idObtenida={idObtenida} />
      <ModalEliminar idObtenida={idObtenida} />
    </section>
  );
};

export const ModalCrearNuevaAbertura = () => {
  const { register, handleSubmit, reset } = useForm();
  const { setAberturas } = useAberturasContext();

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_URL, {
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("nueva-abertura", (nuevaAbertura) => {
      setAberturas(nuevaAbertura);
    });

    return () => newSocket.close();
  }, []);

  const onSubmit = async (formData) => {
    try {
      const aberturaData = {
        ...formData,
      };

      const res = await client.post("/crear-abertura", aberturaData);

      if (socket) {
        socket.emit("nueva-abertura", res?.data);
      }

      showSuccessToast("Creado correctamente");

      document.getElementById("my_modal_nueva_abertura").close();

      reset();
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  return (
    <dialog id="my_modal_nueva_abertura" className="modal">
      <div className="modal-box rounded-md max-md:h-full max-md:max-h-full max-md:w-full max-md:max-w-full max-md:rounded-none">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg">Cargar nueva abertura</h3>
        <p className="py-0 text-sm font-medium">
          Rellena los siguientes campos, para poder cargar una abertura.
        </p>
        <form
          className="mt-4 flex flex-col gap-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm">Detalle de la abertura</label>
            <input
              {...register("detalle", { required: true })}
              type="text"
              placeholder="Escribe del detalle.."
              className="border border-gray-300 py-2 px-2 rounded-md font-medium text-sm outline-none w-auto"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm">AnchoxAlto</label>
            <input
              {...register("ancho_alto", { required: true })}
              type="text"
              placeholder="ej:120x120"
              className="border border-gray-300 py-2 px-2 rounded-md font-medium text-sm outline-none w-auto"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm">Tipo de abertura</label>
            <select
              {...register("tipo", { required: true })}
              type="text"
              className="border border-gray-300 py-2 px-2 rounded-md font-medium text-sm outline-none w-auto"
            >
              <option className="font-bold text-primary">
                Seleccionar el tipo
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
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm">Linea de la abertura</label>
            <select
              {...register("linea", { required: true })}
              type="text"
              className="border border-gray-300 py-2 px-2 rounded-md font-medium text-sm outline-none w-auto"
            >
              <option className="font-bold text-primary">
                Seleccionar la linea
              </option>
              <option value={"herrero"} className="font-semibold">
                Herrero
              </option>
              <option value={"modena"} className="font-semibold">
                Modena
              </option>{" "}
              <option value={"modena a30"} className="font-semibold">
                Modena a30
              </option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm">Color de la abertura</label>
            <select
              {...register("color", { required: true })}
              type="text"
              className="border border-gray-300 py-2 px-2 rounded-md font-medium text-sm outline-none w-auto"
            >
              <option className="font-bold text-primary">
                Seleccionar el color
              </option>
              <option value={"blanco"} className="font-semibold">
                Blanco
              </option>
              <option value={"negro"} className="font-semibold">
                Negro
              </option>{" "}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm">Stock actual</label>
            <input
              {...register("stock", { required: true })}
              type="text"
              placeholder="Escribe el stock.."
              className="border border-gray-300 py-2 px-2 rounded-md font-medium text-sm outline-none w-auto"
            />
          </div>
          <div>
            <button
              type="submit"
              className="py-1.5 px-6 bg-primary hover:shadow-md text-white transition-all rounded-md font-semibold text-sm"
            >
              Cargar la abertura
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export const ModalActualizarAbertura = ({ idObtenida }) => {
  const { register, handleSubmit, setValue } = useForm();
  const { setAberturas } = useAberturasContext();

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const obtenerDatos = async () => {
      const respuesta = await client.get(`/abertura/${idObtenida}`);

      setValue("detalle", respuesta.data.detalle);
      setValue("color", respuesta.data.color);
      setValue("linea", respuesta.data.linea);
      setValue("tipo", respuesta.data.tipo);
      setValue("ancho_alto", respuesta.data.ancho_alto);
      setValue("stock", respuesta.data.stock);
    };

    obtenerDatos();
  }, [idObtenida]);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_URL, {
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("actualizar-abertura", (actualizarAbertura) => {
      setAberturas(actualizarAbertura);
    });

    return () => newSocket.close();
  }, []);

  const onSubmit = async (formData) => {
    try {
      const aberturaData = {
        ...formData,
      };

      const res = await client.put(`/aberturas/${idObtenida}`, aberturaData);

      if (socket) {
        socket.emit("actualizar-abertura", res?.data);
      }

      document.getElementById("my_modal_actualizar_abertura").close();
      showSuccessToast("Actualizado correctamente");

      // reset();
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  return (
    <dialog id="my_modal_actualizar_abertura" className="modal">
      <div className="modal-box rounded-md max-md:h-full max-md:max-h-full max-md:w-full max-md:max-w-full max-md:rounded-none">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        {/* <h3 className="font-bold text-lg">Cargar nueva abertura</h3>
        <p className="py-0 text-sm font-medium">
          Rellena los siguientes campos, para poder cargar una abertura.
        </p> */}
        <form
          className="py-4 flex flex-col gap-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm">Detalle de la abertura</label>
            <input
              {...register("detalle", { required: true })}
              type="text"
              placeholder="Escribe del detalle.."
              className="border border-gray-300 py-2 px-2 rounded-md font-medium text-sm outline-none w-auto"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm">AnchoxAlto</label>
            <input
              {...register("ancho_alto", { required: true })}
              type="text"
              placeholder="ej:120x120"
              className="border border-gray-300 py-2 px-2 rounded-md font-medium text-sm outline-none w-auto"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm">Tipo de abertura</label>
            <select
              {...register("tipo", { required: true })}
              type="text"
              className="border border-gray-300 py-2 px-2 rounded-md font-medium text-sm outline-none w-auto"
            >
              <option className="font-bold text-primary">
                Seleccionar el tipo
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
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm">Linea de la abertura</label>
            <select
              {...register("linea", { required: true })}
              type="text"
              className="border border-gray-300 py-2 px-2 rounded-md font-medium text-sm outline-none w-auto"
            >
              <option className="font-bold text-primary">
                Seleccionar la linea
              </option>
              <option value={"herrero"} className="font-semibold">
                Herrero
              </option>
              <option value={"modena"} className="font-semibold">
                Modena
              </option>{" "}
              <option value={"modena a30"} className="font-semibold">
                Modena a30
              </option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm">Color de la abertura</label>
            <select
              {...register("color", { required: true })}
              type="text"
              className="border border-gray-300 py-2 px-2 rounded-md font-medium text-sm outline-none w-auto"
            >
              <option className="font-bold text-primary">
                Seleccionar el color
              </option>
              <option value={"blanco"} className="font-semibold">
                Blanco
              </option>
              <option value={"negro"} className="font-semibold">
                Negro
              </option>{" "}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm">Stock actual</label>
            <input
              {...register("stock", { required: true })}
              type="text"
              placeholder="Escribe el stock.."
              className="border border-gray-300 py-2 px-2 rounded-md font-medium text-sm outline-none w-auto"
            />
          </div>
          <div>
            <button
              type="submit"
              className="py-1.5 px-6 bg-primary hover:shadow-md text-white transition-all rounded-md font-semibold text-sm"
            >
              Actualizar la abertura
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

const ModalEliminar = ({ idObtenida }) => {
  const { handleSubmit } = useForm();

  const { setAberturas } = useAberturasContext();

  const onSubmit = async (formData) => {
    try {
      const ordenData = {
        datos: {
          ...formData,
        },
      };

      const res = await client.delete(`/aberturas/${idObtenida}`, ordenData);

      setAberturas(res.data);

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
            Eliminar la abertura cargada..
          </div>
          <div className="text-sm text-gray-400 text-center mt-1">
            La abertura no podra ser recuperado nunca mas...
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
