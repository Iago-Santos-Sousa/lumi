import { useState } from "react";
import { Link } from "react-router-dom";
import userCreate from "../../assets/user-circle.svg";
import passwordIcon from "../../assets/password-icon.svg";
import eyeIcon from "../../assets/eye-icon.svg";
import eyeClosed from "../../assets/eye-closed.svg";
import backIcon from "../../assets/back-icon.svg";
import { userApi } from "../../integrations/user";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import EmailErrorMessageCard from "../../components/EmailErrorMessageCard";
import ResetPasswordSuccessCard from "../../components/ResetPasswordSuccessCard";
import LoadingDots from "../../components/LoadingDots";
const sleep = async (ms: number) =>
  new Promise<void>((resolve, reject) => setTimeout(resolve, ms));

type Inputs = {
  password: string;
  confirm_password: string;
};

const ResetPassword: React.FC = () => {
  const [resetPasswordError, setResetPasswordError] = useState<string>("");
  const [resetPasswordSuccess, setResetPasswordSuccess] =
    useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmShowPassword, setConfirmShowPassword] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Inputs>();

  const handleChangePassword = async (data: Inputs): Promise<void> => {
    try {
      setResetPasswordSuccess(false);
      setResetPasswordError("");
      setLoading(true);
      await sleep(3000);
      const path: string = window.location.pathname;
      const parts: string[] = path.split("/");
      const resetPasswordToken: string = parts[parts.length - 1];
      data.password = data.password ? data.password.trim() : "";
      data.confirm_password = data.confirm_password
        ? data.confirm_password.trim()
        : "";

      if (data.password !== data.confirm_password) {
        setError("password", { type: "focus" }, { shouldFocus: true });
        setError(
          "confirm_password",
          { type: "focus", message: "As senhas não conferem!" },
          { shouldFocus: true },
        );

        return;
      }

      const result = await userApi().resetPassword(
        resetPasswordToken,
        data.password,
      );
      setResetPasswordSuccess(true);
    } catch (error: unknown | AxiosError) {
      console.log(error);
      if (error instanceof AxiosError) {
        if (
          error?.response?.status === 404 ||
          error?.response?.status === 410
        ) {
          setResetPasswordError("Invalid or expired token!");
        } else {
          setResetPasswordError("Unable to change password!");
        }
      } else {
        setResetPasswordError("Unable to change password!");
      }
    } finally {
      setLoading(false);
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
          onSubmit={handleSubmit(handleChangePassword)}
        >
          <div className="w-[100px] h-[100px] mx-auto">
            <img src={userCreate} alt="create-user" className="w-full h-full" />
          </div>

          <div className="w-full">
            <label
              htmlFor="password"
              className="text-sm text-spanTwoColor w-full"
            >
              Password
            </label>
            <div className="relative w-full mb-2">
              <input
                type={`${!showPassword ? "password" : "text"}`}
                placeholder="password"
                id="password"
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-prymaryPurple invalid:outline-red-500 aria-required:outline-red-500"
                {...register("password", {
                  required: "Informe a sua senha",
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
              Confirm password
            </label>
            <div className="relative w-full mb-2">
              <input
                type={`${!confirmShowPassword ? "password" : "text"}`}
                placeholder="confirm password"
                id="confirm_password"
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-prymaryPurple invalid:outline-red-500 aria-required:outline-red-500"
                {...register("confirm_password", {
                  required: "Confirme a sua senha",
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

          <div className="text-center text-white">
            <button
              className="bg-purple-500 text-base w-full rounded-full py-3 opacity-70 hover:opacity-100"
              type="submit"
            >
              {loading ? <LoadingDots /> : "Change password"}
            </button>
          </div>
        </form>

        {resetPasswordSuccess && <ResetPasswordSuccessCard />}

        {resetPasswordError && (
          <EmailErrorMessageCard message={resetPasswordError} />
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
