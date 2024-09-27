import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthProvider";
import { NotFound } from "./routes/pages/protected/NotFound.jsx";
import { Login } from "./routes/pages/Login";
import { Register } from "./routes/pages/Register";
import { Home } from "./routes/pages/protected/Home";
import { useEffect, useState } from "react";
import { Navbar } from "./components/ui/Navbar.jsx";
import { MenuMobile } from "./components/ui/MenuMobile.jsx";
import { AberturasProvider } from "./context/AberturasProvider.jsx";
//import normales
import RutaProtegida from "./layouts/RutaProtejida";
import "react-toastify/dist/ReactToastify.css";
import "react-toastify/dist/ReactToastify.min.css";
import { Aberturas } from "./routes/pages/protected/Aberturas.jsx";
import { Salidas } from "./routes/pages/protected/Salidas.jsx";
import { Cierres } from "./routes/pages/protected/Cierres.jsx";
import { Contratos } from "./routes/pages/protected/Contratos.jsx";
import { GenerarPedido } from "./routes/pages/protected/GenerarPedido.jsx";
import { PedidosFabricas } from "./routes/pages/protected/PedidosFabricas.jsx";

function App() {
  const { isAuth, user } = useAuth();

  const [isLoading, setIsLoading] = useState(true); // Estado de carga

  // Simula un tiempo de carga de 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false); // Desactiva la pantalla de carga después de 5 segundos
    }, 3000);

    return () => clearTimeout(timer); // Limpia el temporizador cuando se desmonta
  }, []);

  if (isLoading) {
    // Muestra la pantalla de carga mientras se está cargando
    return <LoadingScreen />;
  }

  return (
    <>
      <BrowserRouter>
        {/* <NavbarStatick /> */}
        <Routes>
          <Route
            element={<RutaProtegida isAllowed={!isAuth} redirectTo={"/"} />}
          >
            <Route index path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route
            element={<RutaProtegida isAllowed={isAuth} redirectTo={"/login"} />}
          >
            <Route
              element={
                <AberturasProvider>
                  <main className="min-h-full max-h-full h-full flex flex-col">
                    <Navbar />
                    <MenuMobile />
                    <Outlet />
                  </main>
                </AberturasProvider>
              }
            >
              <Route index path="/" element={<Home />} />
              <Route path="/aberturas" element={<Aberturas />} />
              <Route path="/salidas" element={<Salidas />} />
              <Route path="/cierres" element={<Cierres />} />
              <Route path="/contratos" element={<Contratos />} />
              <Route path="/pedido-nuevo" element={<GenerarPedido />} />
              <Route path="/pedidos-fabricas" element={<PedidosFabricas />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

const LoadingScreen = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-primary border-b-transparent"></div>
        <p className="mt-4 text-lg font-bold text-gray-700">Cargando...</p>
      </div>
    </div>
  );
};
