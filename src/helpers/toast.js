import { toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css"; // Asegúrate de importar los estilos de react-toastify

const customToastStyle = {
  textAlign: "center",
  width: "auto",
  padding: "12px 20px",
  fontWeight: "semibold",
  backgroundColor: "#fff", // Color de fondo verde (success)
  color: "#0005", // Color de texto blanco
  borderRadius: "0px",
};

export const showSuccessToastError = (message) => {
  toast.error(message, {
    style: customToastStyle,
    position: "top-center",
  });
};

// Función para mostrar el toast personalizado
export const showSuccessToast = (message) => {
  toast.success(message, {
    style: customToastStyle,
    position: "top-center",
  });
};
