import { useState } from "react";
import { Link } from "react-router-dom";
import userCreate from "../../assets/user-circle.svg";
import passwordIcon from "../../assets/password-icon.svg";
import emailIcon from "../../assets/email-icon.svg";
import eyeIcon from "../../assets/eye-icon.svg";
import eyeClosed from "../../assets/eye-closed.svg";
import backIcon from "../../assets/back-icon.svg";
import name from "../../assets/user-name-icon.svg";
import { userApi } from "../../integrations/user";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { useToast } from "../../context/ToastContext";

type Inputs = {
  password: string;
  confirm_password: string;
  name: string;
  email: string;
};

const CreateUser: React.FC = () => {
  const [loginError, setLoginError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmShowPassword, setConfirmShowPassword] = useState(false);
  const { showToast } = useToast();
  const handleSuccess = () => {
    showToast("success", "Usuário criado com sucesso!");
  };

  const handleError = (message: string) => {
    showToast("error", message);
  };

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<Inputs>();

  const handleCreateUser = async (data: Inputs): Promise<void> => {
    clearErrors();
    setLoginError("");

    try {
      data.password = data.password ? data.password.trim() : "";
      data.confirm_password = data.confirm_password
        ? data.confirm_password.trim()
        : "";
      data.name = data.name ? data.name.trim() : "";
      data.email = data.email ? data.email.trim() : "";

      if (data.password !== data.confirm_password) {
        setError(
          "confirm_password",
          { type: "required", message: "Confirm password!" },
          { shouldFocus: true },
        );
        return;
      }

      const createUserData = {
        ...data,
        role: "user",
      };

      const result = await userApi().createUser(createUserData);
      console.log(result);
      handleSuccess();
    } catch (error: unknown | AxiosError) {
      console.log(error);
      if (error instanceof AxiosError) {
        if (error?.response?.status === 409) {
          setLoginError("Essa conta de email ou nome de usuário já existe!");
          setError("email", { type: "focus" }, { shouldFocus: true });
          setError("name", { type: "focus" }, { shouldFocus: true });
          handleError("Essa conta de email ou nome de usuário já existe!");
        } else {
          setLoginError("Erro ao criar usuário!");
          handleError("Erro ao criar usuário!");
        }
      }
    }
  };

  return (
    <div className="wrapper min-h-screen py-12">
      <div className="login-page bg-white px-10 py-6 border rounded-lg mt-0 mx-auto max-w-[min(80%,450px)] relative">
        <div className="w-[50px] h-[50px] absolute top-4 left-4 hover:border hover:rounded-full hover:bg-blue-300">
          <Link to={"/"}>
            <button className="">
              <img
                src={backIcon}
                alt="return-icon"
                className="w-full h-full "
              />
            </button>
          </Link>
        </div>
        <form
          className="flex flex-col gap-6"
          onSubmit={handleSubmit(handleCreateUser)}
        >
          <div className="w-[100px] h-[100px] mx-auto">
            <img src={userCreate} alt="create-user" className="w-full h-full" />
          </div>

          <div className="w-full">
            <label htmlFor="name" className="text-sm text-spanTwoColor w-full">
              Nome de usuário
            </label>
            <div className="relative w-full mb-2">
              <input
                type="text"
                placeholder="nome de usuário"
                id="name"
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-prymaryPurple invalid:outline-red-500 aria-required:outline-red-500"
                {...register("name", {
                  required: "Digite seu nome de usuário",
                })}
                aria-required={errors?.name ? true : false}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <img src={name} alt="" width={20} height={20} />
              </div>
            </div>
            {errors?.name && (
              <span className="text-sm text-red-500">
                {errors?.name?.message}
              </span>
            )}
          </div>

          <div className="w-full">
            <label htmlFor="email" className="text-sm text-spanTwoColor w-full">
              Email
            </label>
            <div className="relative w-full mb-2">
              <input
                type="email"
                placeholder="email"
                id="email"
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-prymaryPurple invalid:outline-red-500 aria-required:outline-red-500"
                {...register("email", {
                  required: "Digite seu email",
                })}
                aria-required={errors.email ? true : false}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <img src={emailIcon} alt="" width={20} height={20} />
              </div>
            </div>
            {errors?.email && (
              <span className="text-sm text-red-500">
                {errors?.email?.message}
              </span>
            )}
          </div>

          <div className="w-full">
            <label
              htmlFor="password"
              className="text-sm text-spanTwoColor w-full"
            >
              Senha
            </label>
            <div className="relative w-full mb-2">
              <input
                type={`${!showPassword ? "password" : "text"}`}
                placeholder="senha"
                id="password"
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-prymaryPurple invalid:outline-red-500 aria-required:outline-red-500"
                {...register("password", {
                  required: "Digite sua senha",
                })}
                aria-required={errors?.password ? true : false}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <img src={passwordIcon} alt="" width={20} height={20} />
              </div>
              <span
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => {
                  setShowPassword((prev) => !prev);
                }}
              >
                <img
                  src={!showPassword ? eyeIcon : eyeClosed}
                  alt=""
                  width={20}
                  height={20}
                />
              </span>
            </div>
            {errors?.password && (
              <span className="text-sm text-red-500">
                {errors?.password?.message}
              </span>
            )}
          </div>

          <div className="w-full">
            <label
              htmlFor="confirm_password"
              className="text-sm text-spanTwoColor w-full"
            >
              Confirmar senha
            </label>
            <div className="relative w-full mb-2">
              <input
                type={`${!confirmShowPassword ? "password" : "text"}`}
                placeholder="confirmar senha"
                id="confirm_password"
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-prymaryPurple invalid:outline-red-500 aria-required:outline-red-500"
                {...register("confirm_password", {
                  required: "Confirme sua senha",
                })}
                aria-required={errors?.confirm_password ? true : false}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <img src={passwordIcon} alt="" width={20} height={20} />
              </div>
              <span
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => {
                  setConfirmShowPassword((prev) => !prev);
                }}
              >
                <img
                  src={!confirmShowPassword ? eyeIcon : eyeClosed}
                  alt=""
                  width={20}
                  height={20}
                />
              </span>
            </div>
            {errors?.confirm_password && (
              <span className="text-sm text-red-500">
                {errors?.confirm_password?.message}
              </span>
            )}
          </div>

          <div className="text-center text-white w-auto h-auto">
            <button
              className="bg-purple-500 text-base w-full rounded-full py-3 opacity-70 hover:opacity-100"
              type="submit"
            >
              Cadastrar
            </button>
          </div>

          <div>
            {loginError && (
              <p className="text-sm text-red-500 text-center">{loginError}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
