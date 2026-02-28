import { useEffect, PropsWithChildren } from "react";
import { useLogin } from "../context/AppProvider";
import { useNavigate, NavigateFunction } from "react-router-dom";
import PageLoading from "../components/PageLoading";
import { loginAPi } from "../integrations/auth";

const AuthenticatedRoute = ({ children }: PropsWithChildren) => {
  const accessToken = useLogin().accessToken;
  const navigate: NavigateFunction = useNavigate();

  useEffect(() => {
    const sessionToken: string | null =
      sessionStorage.getItem("user.accessToken");
    const sessionUser: string | null = sessionStorage.getItem("user.user");
    const sessionRefreshToken: string | null =
      sessionStorage.getItem("user.refreshToken");

    if (!sessionToken || !sessionUser || !sessionRefreshToken) {
      loginAPi()
        .logOut()
        .then((response) => {
          sessionStorage.clear();
          return navigate("/", { replace: true });
        });
    }
  }, []);

  if (!accessToken) {
    return <PageLoading />;
  } else {
    return children;
  }
};

export default AuthenticatedRoute;
