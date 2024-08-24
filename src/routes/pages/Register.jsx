import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthProvider";
import { Label } from "../../components/formularios/Label";
import { Input } from "../../components/formularios/Input";
import { InputPassword } from "../../components/formularios/InputPassword";
import { Button } from "../../components/formularios/Button";

export const Register = () => {
  const { signup, error } = useAuth();

  const navigate = useNavigate();

  const { register, handleSubmit } = useForm();

  const onSubmit = handleSubmit(async (data) => {
    const user = await signup(data);

    if (user) {
      navigate("/");
    }
  });

  return (
    <section className="flex items-center justify-center gap-12 h-screen  bg-white flex-col relative">
      {/* <div className="h-[300px] rounded-full absolute top-10 left-[300px] w-[300px] bg-indigo-700 shadow-lg"></div> */}
      <form
        onSubmit={onSubmit}
        className="flex w-1/3 flex-col gap-4 bg-white border-[1px] border-slate-300 px-10 py-10 rounded-xl  shadow"
      >
        <div className="text-lg text-slate-700 w-full text-center">
          Registro de usuario
        </div>
        {
          <div>
            <div className="flex flex-col gap-1">
              {error?.map((e) => (
                <span
                  key={e}
                  className="bg-red-500/10 rounded-lg px-2 py-1 text-red-600 text-sm border-[1px] border-red-500/30"
                >
                  {e}
                </span>
              ))}
            </div>
          </div>
        }
        <div className="flex flex-col gap-2">
          <Label label="Email del registro" />
          <Input
            register={register}
            placeholder={"@emailregistro@email.com"}
            type={"email"}
          />
        </div>{" "}
        <div className="flex flex-col gap-2">
          <Label label="Fabrica" />
          <Input
            register={register}
            placeholder={"Fabrica del usuario"}
            type={"fabrica"}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label label="Usuario" />
          <Input
            register={register}
            placeholder={"@Usuario"}
            type={"username"}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label label="Contraseña" />
          <InputPassword register={register} type={"password"} />
        </div>
        <Button type={"submit"} titulo={"Registrar Usuario"} />
      </form>
    </section>
  );
};
