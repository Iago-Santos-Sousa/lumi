import { Link } from "react-router-dom";

const EmailErrorMessageCard = ({ message }: { message: string }) => {
  // Tente novamente enviando um novo E-mail para restaurar a sua senha.
  return (
    <div className="max-w-md text-md mt-8 border border-gray-200 shadow-md rounded rounded-l-[10px] border-l-[10px] border-l-red-400 rounded-r-[10px] border-r-[10px] border-r-red-400 py-4 px-6">
      <div className="flex flex-col gap-4 items-center">
        <p className="text-gray-500 font-semibold text-justify">{message}</p>
        <p className="text-gray-500 font-semibold text-justify">
          Please try again by sending a new email to reset your password.
        </p>

        <div className="search-button">
          <Link to="/">
            <button
              type="submit"
              className={`bg-red-400 text-white rounded-md text-center w-36 py-2`}
            >
              Back to login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailErrorMessageCard;
