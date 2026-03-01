import { useLogin } from "../context/AppProvider";
import userLogo from "../assets/user-check-icon.svg";
import { useNavigate, NavigateFunction, Link } from "react-router-dom";
import { loginAPi } from "../integrations/auth";

const Header: React.FC = () => {
  const signOut = useLogin().signOut;
  const navigate: NavigateFunction = useNavigate();

  return (
    <header className="w-full bg-prymaryBlue py-4 flex justify-between items-center px-8">
      <div className="flex justify-center items-center gap-6">
        <div className="logo-img w-[80px] h-[80px]">
          <img src={userLogo} alt="user-logo" className="w-full h-full" />
        </div>

        <h1 className="text-2xl font-bold text-white">
          Bem-vindo, {useLogin().user.name}!
        </h1>
      </div>

      <nav className="navbar">
        <div>
          <ul className="flex gap-6 text-white">
            <li className="">
              <Link to={"/panel"}>Painel</Link>
            </li>
            <li className="">
              <Link to={`user-details/${useLogin().user.userId}`}>
                <button>Detalhes</button>
              </Link>
            </li>
            <li>
              <Link to={"/panel/dashboard"}>
                <button>Dashboard</button>
              </Link>
            </li>
            <li>
              <Link to={"/panel/invoice-library"}>
                <button>Biblioteca de Faturas</button>
              </Link>
            </li>

            <li />
            <li className="">
              <button
                onClick={() => {
                  loginAPi()
                    .logOut()
                    .then(() => {
                      signOut();
                      navigate("/", { replace: true });
                    });
                }}
              >
                Sair
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
