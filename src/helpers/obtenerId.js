import { useState } from "react";

export const useObtenerId = () => {
  const [idObtenida, setIdObtenida] = useState(null);

  const handleObtenerId = (id) => {
    setIdObtenida(id);
  };

  return { handleObtenerId, idObtenida };
};
