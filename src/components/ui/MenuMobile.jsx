import { useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import { Link, useLocation } from "react-router-dom";
import { IoMenuOutline, IoCloseOutline } from "react-icons/io5";

export const MenuMobile = () => {
  const { user, signout } = useAuth();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOverlayClick = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <div
      className={`${
        isOpen ? "w-64 opacity-1" : "w-0 opacity-1"
      } transition-all ease-linear flex flex-col bg-white min-h-[220vh] max-h-full h-full z-[100] border-r max-md:fixed md:hidden`}
    >
      {/* Botón de menú */}
      <div
        className={`py-4 px-4 ${
          isOpen ? "flex justify-between items-center" : ""
        }`}
      >
        <button className="text-4xl px-2" onClick={handleToggle}>
          {isOpen ? (
            <IoCloseOutline className="text-primary" />
          ) : (
            <IoMenuOutline className="text-white" />
          )}
        </button>
        {isOpen && (
          <div>
            <p className="bg-gray-800 py-1 px-2 rounded-md text-xs text-white capitalize font-bold">
              {user?.username}
            </p>
          </div>
        )}
      </div>
      {isOpen && (
        <div className="w-full max-h-full min-h-full h-full flex flex-col gap-0">
          <Link
            onClick={() => setIsOpen(!isOpen)}
            to={"/"}
            className={`${
              location.pathname === "/" ? "bg-primary text-white" : "bg-none"
            } hover:text-primary  font-semibold text-sm transition-all py-3 px-3`}
          >
            Inicio del sistema aberturas
          </Link>

          <Link
            onClick={() => setIsOpen(!isOpen)}
            to={"/salidas"}
            className={`${
              location.pathname === "/salidas"
                ? "bg-primary text-white"
                : "bg-none"
            } hover:text-orange-700 font-semibold text-sm transition-all py-3 px-3`}
          >
            Sector salidas
          </Link>
          <Link
            onClick={() => setIsOpen(!isOpen)}
            to={"/aberturas"}
            className={`${
              location.pathname === "/aberturas"
                ? "bg-primary text-white"
                : "bg-none"
            } hover:text-primary  font-semibold text-sm transition-all py-3 px-3`}
          >
            Sector aberturas
          </Link>

          <Link
            onClick={() => setIsOpen(!isOpen)}
            to={"/contratos"}
            className={`${
              location.pathname === "/contratos"
                ? "bg-primary text-white"
                : "bg-none"
            } hover:text-primary  font-semibold text-sm transition-all py-3 px-3`}
          >
            Contratos
          </Link>

          <Link
            onClick={() => setIsOpen(!isOpen)}
            to={"/cierres"}
            className={`${
              location.pathname === "/cierres"
                ? "bg-primary text-white"
                : "bg-none"
            } hover:text-primary  font-semibold text-sm transition-all py-3 px-3`}
          >
            Cierres del mes
          </Link>
          <button
            type="button"
            onClick={() => signout()}
            className={`bg-gray-800 py-2 px-3 text-white font-bold text-sm`}
          >
            Cerrar sesión
          </button>

          {user.localidad === "admin" && (
            <Link
              onClick={() => setIsOpen(!isOpen)}
              to={"/cuentas"}
              className={`${
                location.pathname === "/cuentas" ? "bg-orange-100" : "bg-none"
              } hover:text-orange-700 text-slate-700 text-sm transition-all py-3 px-3`}
            >
              Crear cuentas/editar/administrar
            </Link>
          )}
        </div>
      )}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/0 opacity-50 z-[-1]"
          onClick={handleOverlayClick}
        />
      )}
    </div>
  );
};
