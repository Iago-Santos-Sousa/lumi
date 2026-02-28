import { useState } from "react";
import { Link } from "react-router-dom";
import userCreate from "../../assets/user-circle.svg";
import backIcon from "../../assets/back-icon.svg";
import emailIcon from "../../assets/email-icon.svg";
import { useForm } from "react-hook-form";
import { userApi } from "../../integrations/user";
import EmailErrorMessageCard from "../../components/EmailErrorMessageCard";
import EmailSuccessCard from "../../components/EmailSuccessCard";
import LoadingDots from "../../components/LoadingDots";

type Inputs = {
  email: string;
};

const ForgotPassword: React.FC = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Inputs>();

  const [errorEmail, setErrorEmail] = useState<string>("");
  const [successEmail, setSuccessEmail] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleResetPassword = async (data: Inputs) => {
    try {
      setSuccessEmail(false);
      setErrorEmail("");
      setLoading(true);
      data.email = data.email ? data.email.trim() : "";
      const result = await userApi().forgotPassword(data.email);
      console.log(result);
      setSuccessEmail(true);
    } catch (error: unknown) {
      console.log(error);
      setErrorEmail("Unable to send email!");
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
          onSubmit={handleSubmit(handleResetPassword)}
        >
          <div className="w-[100px] h-[100px] mx-auto">
            <img src={userCreate} alt="create-user" className="w-full h-full" />
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
                  required: "Enter your email",
                })}
                autoComplete="email"
                aria-required={errors?.email ? true : false}
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

          <div className="text-center text-white">
            <button
              className="bg-purple-500 text-base w-full rounded-full py-3 opacity-70 hover:opacity-100 min-h-12"
              type="submit"
            >
              {loading ? <LoadingDots /> : "Send E-mail"}
            </button>
          </div>
        </form>

        {successEmail && <EmailSuccessCard />}
        {errorEmail && <EmailErrorMessageCard message={errorEmail} />}
      </div>
    </div>
  );
};

export default ForgotPassword;
