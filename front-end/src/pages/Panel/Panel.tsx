import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Outlet } from "react-router-dom";

const Panel: React.FC = () => {
  return (
    <div className="panel">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
};

export default Panel;
