import { FaRobot } from "react-icons/fa"; // Importamos el ícono de robot
import { useCallback } from "react";

const ChatBotButton = () => {
  // Número de teléfono para la acción de chat
  const phoneNumber = "3462693961";

  // Función para abrir el chat con el número de teléfono
  const handleChatClick = useCallback(() => {
    const whatsappUrl = `https://wa.me/34${phoneNumber}`;
    window.open(whatsappUrl, "_blank"); // Abre en una nueva pestaña
  }, [phoneNumber]);

  return (
    <div
      className="fixed bottom-8 right-8 z-50 max-md:hidden" // Posición fija, en la parte inferior derecha
    >
      <button
        className="flex items-center justify-center p-4 bg-blue-500 font-semibold rounded-full text-white hover:bg-primary transition-all shadow-lg"
        onClick={handleChatClick}
        aria-label="Chatear"
      >
        <FaRobot className="w-6 h-6" /> {/* Ícono del robot */}
        <span className="ml-2 hidden md:inline">
          Comunícate ahora si no funciona el sistema
        </span>{" "}
        {/* Texto que se muestra en pantallas más grandes */}
      </button>
    </div>
  );
};

export default ChatBotButton;
