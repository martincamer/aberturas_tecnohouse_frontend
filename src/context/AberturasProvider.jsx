//imports
import { createContext, useContext, useEffect, useState } from "react";
import client from "../api/axios";

//context
export const AberturasContext = createContext();

//use context
export const useAberturasContext = () => {
  const context = useContext(AberturasContext);
  if (!context) {
    throw new Error("Use Remuneracion Propvider");
  }
  return context;
};

//
export const AberturasProvider = ({ children }) => {
  const [aberturas, setAberturas] = useState([]);
  const [fabricas, setFabricas] = useState([]);
  const [salidas, setSalidas] = useState([]);
  const [cierres, setCierres] = useState([]);

  useEffect(() => {
    async function loadData() {
      const respuesta = await client.get("/aberturas");

      setAberturas(respuesta.data);
    }

    loadData();
  }, []);

  useEffect(() => {
    async function loadData() {
      const respuesta = await client.get("/fabricas");

      setFabricas(respuesta.data);
    }

    loadData();
  }, []);

  useEffect(() => {
    async function loadData() {
      const respuesta = await client.get("/salidas");

      setSalidas(respuesta.data);
    }

    loadData();
  }, []);

  useEffect(() => {
    async function loadData() {
      const respuesta = await client.get("/cierres");

      setCierres(respuesta.data);
    }

    loadData();
  }, []);

  return (
    <AberturasContext.Provider
      value={{
        aberturas,
        setAberturas,
        fabricas,
        setFabricas,
        setSalidas,
        salidas,
        setCierres,
        cierres,
      }}
    >
      {children}
    </AberturasContext.Provider>
  );
};
