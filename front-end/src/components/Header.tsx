import { useLogin } from "../context/AppProvider";
import userLogo from "../assets/user-check-icon.svg";
import { useNavigate, NavigateFunction, Link } from "react-router-dom";
import { loginAPi } from "../integrations/auth";

const Header: React.FC = () => {
  const signOut = useLogin().signOut;
  const navigate: NavigateFunction = useNavigate();

  return (
    <header className="w-full bg-prymaryBlue py-4 flex justify-between items-center px-8">
      <div className="logo-img w-[80px] h-[80px]">
        <img src={userLogo} alt="user-logo" className="w-full h-full" />
      </div>

      <nav className="navbar">
        <div>
          <ul className="flex gap-6 text-white">
            <li className="">
              <Link to={"/panel"}>Panel</Link>
            </li>
            <li className="">
              <Link to={`user-details/${useLogin().user.userId}`}>
                <button>Details</button>
              </Link>
            </li>
            <li>
              <Link to={"/panel/invoice-library"}>
                <button>Invoice Library</button>
              </Link>
            </li>

            <li />
            <li className="">
              <button
                onClick={() => {
                  loginAPi()
                    .logOut()
                    .then((response) => {
                      signOut();
                      navigate("/", { replace: true });
                    });
                }}
              >
                Log out
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
