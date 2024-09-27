import { useAberturasContext } from "../../../context/AberturasProvider";
import { useForm } from "react-hook-form";
import client from "../../../api/axios";
import io from "socket.io-client";
import { useEffect, useState } from "react";
import {
  showSuccessToast,
  showSuccessToastError,
} from "../../../helpers/toast";
import { FaDeleteLeft } from "react-icons/fa6";
import { formatearFecha } from "../../../helpers/formatearFecha";
import { useObtenerId } from "../../../helpers/obtenerId";
import { useAuth } from "../../../context/AuthProvider";

export const Cierres = () => {
  const { cierres } = useAberturasContext();
  const { user } = useAuth();
  const [mesFiltrado, setMesFiltrado] = useState("");
  const [anioFiltrado, setAnioFiltrado] = useState("");

  const handleChangeMes = (e) => {
    setMesFiltrado(e.target.value);
  };

  // Función para manejar cambio de año
  const handleChangeAnio = (e) => {
    setAnioFiltrado(e.target.value);
  };

  // Función para filtrar cierres por mes y año
  const filtrarCierres = (cierre) => {
    if (mesFiltrado && anioFiltrado) {
      const fecha = new Date(cierre.fecha_salida);
      return (
        fecha.getFullYear() === parseInt(anioFiltrado) &&
        fecha.getMonth() === parseInt(mesFiltrado) - 1 // getMonth devuelve de 0 a 11
      );
    } else if (mesFiltrado) {
      return (
        new Date(cierre.fecha_salida).getMonth() === parseInt(mesFiltrado) - 1
      );
    } else if (anioFiltrado) {
      return (
        new Date(cierre.fecha_salida).getFullYear() === parseInt(anioFiltrado)
      );
    }
    return true; // Mostrar todos si no hay filtros aplicados
  };

  const { handleObtenerId, idObtenida } = useObtenerId();
  return (
    <section className="w-full h-full min-h-screen max-h-full">
      {user.fabrica === "aberturas" && (
        <>
          <div className="bg-gray-100 py-10 px-10 flex justify-between items-center max-md:flex-col max-md:gap-3">
            <p className="font-bold text-gray-900 text-xl">
              Sector de cierres mensuales de salidas y stock.
            </p>
            <button
              onClick={() =>
                document.getElementById("my_modal_crear_cierre").showModal()
              }
              type="button"
              className="bg-primary py-1 px-4 rounded-md text-white font-semibold text-sm"
            >
              Cargar nuevo cierre del mes.
            </button>
          </div>

          {/* Controles de filtro */}
          <div className="flex gap-1 pt-12 pb-5 px-10">
            {/* Filtro por mes */}
            <select
              value={mesFiltrado}
              onChange={handleChangeMes}
              className="p-2 border rounded-md border-gray-300 text-sm font-bold"
            >
              <option className="font-bold" value="">
                Seleccionar mes
              </option>
              <option value="1">Enero</option>
              <option value="2">Febrero</option>
              <option value="3">Marzo</option>
              <option value="4">Abril</option>
              <option value="5">Mayo</option>
              <option value="6">Junio</option>
              <option value="7">Julio</option>
              <option value="8">Agosto</option>
              <option value="9">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
            </select>

            {/* Filtro por año */}
            <select
              value={anioFiltrado}
              onChange={handleChangeAnio}
              className="p-2 border rounded-md border-gray-300 text-sm font-bold"
            >
              <option className="font-bold" value="">
                Seleccionar año
              </option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
              <option value="2029">2029</option>
              <option value="2030">2030</option>
              {/* Agrega más opciones de años según tus necesidades */}
            </select>
          </div>

          <div className="px-10 max-md:overflow-x-auto scrollbar-hidden pb-12 pt-0 max-md:px-3">
            <table className="table">
              <thead className="text-sm font-bold text-gray-800">
                <tr>
                  <th>Referencia</th>
                  <th>Total en salidas</th>
                  <th>Total en stock</th>
                  <th>Total numero</th>
                  <th>Fecha del cierre</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody className="text-xs font-medium capitalize ">
                {cierres.filter(filtrarCierres).map((cierre) => (
                  <tr key={cierre.id}>
                    <td>{cierre.id}</td>
                    <td>{cierre.numero_salidas}</td>
                    <td>{cierre.numero_stock}</td>
                    <td>
                      <div className="flex">
                        <p className="bg-primary/10 py-2 px-2 rounded-md text-primary font-extrabold">
                          {Number(cierre.numero_salidas) +
                            Number(cierre.numero_stock)}
                        </p>
                      </div>
                    </td>
                    <td>{formatearFecha(cierre.fecha_salida)}</td>
                    <td>
                      <div className="flex gap-3">
                        <FaDeleteLeft
                          onClick={() => {
                            handleObtenerId(cierre.id),
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
          <ModalCrearCierre />
          <ModalEliminar idObtenida={idObtenida} />
        </>
      )}
    </section>
  );
};

export const ModalCrearCierre = () => {
  const { register, handleSubmit, reset } = useForm();
  const { setCierres } = useAberturasContext();

  const onSubmit = async (formData) => {
    try {
      const aberturaData = {
        ...formData,
      };

      const res = await client.post("/cierres", aberturaData);

      setCierres(res.data);

      showSuccessToast("Creado correctamente");

      document.getElementById("my_modal_crear_cierre").close();

      reset();
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  return (
    <dialog id="my_modal_crear_cierre" className="modal">
      <div className="modal-box rounded-md max-md:w-full max-md:max-w-full max-md:h-full max-md:max-h-full max-md:rounded-none">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg mb-3">
          Crear nuevo cierre mensual, estadistica.
        </h3>
        <form
          className="mt-4 flex flex-col items-start gap-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm">Fecha del cierre</label>
            <input
              {...register("fecha_salida", { required: true })}
              type="date"
              placeholder="Escribe el numero.."
              className="border border-gray-300 py-2 px-2 rounded-md font-medium text-sm outline-none w-auto"
            />
          </div>{" "}
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm">
              Escribir el numero de salidas
            </label>
            <input
              {...register("numero_salidas", { required: true })}
              type="text"
              placeholder="Escribe el numero.."
              className="border border-gray-300 py-2 px-2 rounded-md font-medium text-sm outline-none w-auto"
            />
          </div>{" "}
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm">
              Escribir el numero de stock
            </label>
            <input
              {...register("numero_stock", { required: true })}
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
              Cargar el numero del cierre
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

const ModalEliminar = ({ idObtenida }) => {
  const { handleSubmit } = useForm();

  const { setCierres } = useAberturasContext();

  const onSubmit = async (formData) => {
    try {
      const ordenData = {
        datos: {
          ...formData,
        },
      };

      const res = await client.delete(`/cierres/${idObtenida}`, ordenData);

      setCierres(res.data);

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
            Eliminar el cierre cargado..
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
