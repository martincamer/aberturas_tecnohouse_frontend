import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

export const Navbar = () => {
  const { signout } = useAuth();

  return (
    <header className="bg-gray-800 py-5 px-10 flex items-center justify-between max-md:items-end max-md:justify-end">
      <div className="flex gap-10 items-center max-md:hidden">
        <Link to={"/"} className="cursor-pointer">
          <img src="https://app.holded.com/assets/img/brand/holded-logo.svg" />
        </Link>
        <div className="flex gap-2">
          <div className="dropdown dropdown-hover">
            <div
              tabIndex={0}
              role="button"
              className="text-white font-semibold hover:bg-gray-700 py-1 px-4 rounded-md transition-all"
            >
              Acciones
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-white p-1 rounded-md w-52 text-sm font-medium shadow-xl gap-1"
            >
              <li className="hover:bg-gray-800 hover:text-white rounded-md">
                <Link to={"/salidas"}>Nuevas salidas</Link>
              </li>{" "}
              <li className="hover:bg-gray-800 hover:text-white rounded-md">
                <Link to={"/cierres"}>Control de cierres</Link>
              </li>{" "}
            </ul>
          </div>
          <Link
            className="text-white font-semibold hover:bg-gray-700 py-1 px-4 rounded-md transition-all"
            to={"/aberturas"}
          >
            Sector aberturas
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* <div className="cursor-pointer bg-gray-500 py-5 px-5 rounded-full"></div>{" "} */}
        <button
          onClick={() => signout()}
          className="font-semibold text-white bg-primary px-4 py-1 text-sm rounded-md"
        >
          Salir de la cuenta
        </button>
      </div>
    </header>
  );
};
