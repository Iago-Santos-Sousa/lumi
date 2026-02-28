import { Link } from "react-router-dom";
import userAvatar from "../../assets/user-avatar.svg";
import { useLogin } from "../../context/AppProvider";

const ProfileCard: React.FC = () => {
  const { user } = useLogin();

  console.log(user);

  return (
    <div className="profile-card relative flex flex-col justify-center items-center max-w-[min(80%,450px)] mx-auto border-2 border-x-gray-100 rounded-md pb-6">
      <div className="w-full background-element bg-prymaryBlueDark h-[150px] rounded-t-md"></div>
      <div className="user-profile-img absolute z-10 top-6 overflow-visible p-2 bg-white border-2 border-prymaryBlueDark rounded-full w-[180px] h-[180px] shadow-2xl right-[50%] translate-x-[50%]">
        <img
          src={userAvatar}
          alt="img-user"
          className="w-full h-full object-cover rounded-full"
        />
      </div>

      <h3 className="w-full user-name text-center mt-20 text-lg font-bold">
        {user.name}
      </h3>

      <div className="w-full text-center mt-6">
        <Link to={`user-details/${user.userId}`}>
          <button className="view-more-btn bg-prymaryBlue rounded-full text-white py-2 px-12 text-base">
            Ver mais
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ProfileCard;
