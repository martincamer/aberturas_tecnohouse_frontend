import React from "react";
import { useAuth } from "../../context/AuthProvider";
import { Link } from "react-router-dom";

export const NavbarStatick = () => {
  const { user, signout, isAuth } = useAuth();

  return (
    isAuth && (
      <div className="absolute top-10 right-5 flex gap-2 items-start max-md:top-5 mx-8 max-md:hidden">
        <div className="dropdown dropdown-end items-center">
          <div
            tabIndex={0}
            role="button"
            className="avatar hover:shadow-md rounded-full transition-all w-full flex gap-3"
          >
            <div className="rounded-full h-[60px] w-[60px]">
              <img
                src={
                  user?.imagen ||
                  "https://media-eze1-1.cdn.whatsapp.net/v/t61.24694-24/143144780_433365128082776_2065965210607516755_n.jpg?ccb=11-4&oh=01_Q5AaIM0at3JRy1pLTQOpc4pAfeapqNoOS7IePIqPgF0glU69&oe=66364645&_nc_sid=e6ed6c&_nc_cat=103"
                }
              />
            </div>
          </div>

          <div className="absolute top-0 right-24">
            <p className="text-sm font-semibold text-slate-600">
              Usuario: <span className="font-normal">{user.email}</span>
            </p>
            <p className="text-sm font-semibold text-slate-600">
              Email: <span className="font-normal">{user.username}</span>
            </p>
          </div>
          <ul
            tabIndex={0}
            className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
          >
            <div className="py-2 px-3 text-center capitalize font-bold text-slate-700">
              {user?.username}
            </div>
            <div className="py-2 px-3 text-center capitalize font-light text-xs text-slate-700">
              {user?.email}
            </div>
            <li>
              <Link to={"/configuraciones"}>Configuraciones</Link>
            </li>
            <li>
              <button type="button" onClick={() => signout()}>
                Salir de la aplicación
              </button>
            </li>
          </ul>
        </div>
      </div>
    )
  );
};
