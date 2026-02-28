import { Link } from "react-router-dom";

const EmailSuccessCard: React.FC = () => {
  // E-mail enviado com sucesso.
  /* 
    Verifique seu E-mail para ver se há um link para redefinir sua senha.
    Se ele não aparecer em alguns minutos, verifique sua caixa de spam. 
  */
  return (
    <div className="mt-6 border border-gray-300 shadow-md rounded rounded-l-[10px] border-l-[10px] border-l-blue-400 rounded-r-[10px] border-r-[10px] border-r-blue-400 py-4 px-4">
      <div className="flex flex-col gap-4 items-center">
        <p className="text-sm text-gray-500 font-semibold text-justify">
          Email sent successfully.
        </p>
        <p className="text-sm text-gray-500 font-semibold text-justify">
          Check your email for a link to reset your password. If you don't
          receive it within a few minutes, check your spam folder.
        </p>

        <div className="search-button">
          <Link to="/">
            <button
              type="submit"
              className={`bg-blue-400 cursor-pointer text-white rounded-md text-center w-36 py-2`}
            >
              Back to login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailSuccessCard;
