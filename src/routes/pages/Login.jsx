// import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { Label } from "../../components/formularios/Label";
import { Input } from "../../components/formularios/Input";
import { Button } from "../../components/formularios/Button";
import { InputPassword } from "../../components/formularios/InputPassword";
import ChatBotButton from "../../components/uiv2/ChatBotButton";

export const Login = () => {
  const { signin, error } = useAuth();

  const navigate = useNavigate();

  const { register, handleSubmit } = useForm();

  const onSubmit = handleSubmit(async (data) => {
    const user = await signin(data);

    if (user) {
      navigate("/");
    }
  });

  return (
    <section className="flex items-center h-screen justify-center gap-12 max-md:px-5 max-md:h-screen relative">
      <div className="w-full z-[103]">
        <form
          onSubmit={onSubmit}
          className="flex w-1/3 mx-auto flex-col gap-4 bg-white px-10 py-12 rounded-md max-md:w-full max-md:py-10 max-md:gap-3 z-[103] border border-gray-300 max-md:px-2 max-md:border-none"
        >
          <div className="flex justify-center">
            <img
              className="w-[40px]"
              src="https://app.holded.com/assets/img/brand/holded-logo.svg"
            />
          </div>
          <div className="flex justify-center">
            <h4 className="font-semibold text-2xl text-gray-900 max-md:text-xl">
              Te damos la bienvenida 👋
            </h4>
          </div>
          <div className="text-base font-medium text-slate-500 text-center max-md:text-sm">
            Ingresa al sistema de Aberturas de{" "}
            <span className="font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              Tecnohouse
            </span>
            .
          </div>
          {
            <div>
              <div className="flex flex-col gap-1">
                {error?.map((e) => (
                  <span
                    key={e}
                    className="bg-red-100 rounded-xl px-3 text-center uppercase py-3 text-red-800 text-sm"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
          }
          <div className="flex flex-col gap-2">
            <Label label="Usuario" />
            <Input
              register={register}
              placeholder={"martin"}
              type={"username"}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label label="Contraseña del registro" />
            <InputPassword
              register={register}
              placeholder={""}
              type={"password"}
            />
          </div>

          <Button type={"submit"} titulo={"Iniciar Sesión"} />

          <div className="text-sm font-medium text-center mt-5 w-1/2 mx-auto max-md:w-full">
            Si, pide a tu administrador que te cree un usuario 👀.
          </div>
        </form>
      </div>

      <ChatBotButton />
    </section>
  );
};
