import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import userCreate from "../../assets/user-circle.svg";
import emailIcon from "../../assets/email-icon.svg";
import backIcon from "../../assets/back-icon.svg";
import name from "../../assets/user-name-icon.svg";
import { userApi } from "../../integrations/user";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { useToast } from "../../context/ToastContext";
import { useParams, Params } from "react-router-dom";

type Inputs = {
  password: string;
  confirm_password: string;
  name: string;
  email: string;
};

interface UserInfos {
  email: string;
  name: string;
  user_id: string;
}

const UserDetails: React.FC = () => {
  const userParam: Params<string> | undefined = useParams();
  const [userInfo, setUserInfo] = useState<UserInfos>({
    email: "",
    name: "",
    user_id: "",
  });

  const { showToast } = useToast();

  const handleError = (message: string) => {
    showToast("error", message);
  };

  const {
    register,
    formState: { errors },
  } = useForm<Inputs>();

  useEffect(() => {
    if (userParam?.userId) {
      const userId: string = userParam.userId;
      userApi()
        .getUser(userId)
        .then((response) => {
          setUserInfo({
            email: response.email,
            name: response.name,
            user_id: String(response.user_id),
          });
        })
        .catch((error: Error | AxiosError) => {
          console.log(error);
          handleError("Unable to retrieve user details!");
        });
    }
  }, [userParam?.userId]);

  return (
    <div>
      <div className="w-[50px] h-[50px] absolute top-4 left-10 hover:border hover:rounded-full hover:bg-blue-300">
        <Link to={"/panel"}>
          <button className="">
            <img src={backIcon} alt="return-icon" className="w-full h-full " />
          </button>
        </Link>
      </div>
      <div className="login-page bg-white px-6 py-6 mt-0 mx-auto max-w-[min(80%,450px)] relative">
        <form className="flex flex-col gap-6">
          <div className="w-[100px] h-[100px] mx-auto">
            <img src={userCreate} alt="create-user" className="w-full h-full" />
          </div>

          <div className="w-full">
            <label htmlFor="name" className="text-sm text-spanTwoColor w-full">
              User name
            </label>
            <div className="relative w-full mb-2">
              <input
                type="text"
                placeholder="name"
                id="name"
                disabled
                value={userInfo.name}
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-prymaryPurple invalid:outline-red-500 aria-required:outline-red-500"
                {...register("name", {
                  required: "Enter your name",
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
                disabled
                value={userInfo.email}
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-prymaryPurple invalid:outline-red-500 aria-required:outline-red-500"
                {...register("email", {
                  required: "Enter your email",
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
        </form>
      </div>
    </div>
  );
};

export default UserDetails;
