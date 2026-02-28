import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import Panel from "../pages/Panel/Panel";
import Error404 from "../pages/Error404/Error404";
import CreateUser from "../pages/CreateUser/CreateUser";
import UserDetails from "../pages/UserDetails/UserDetails";
import AuthenticatedRoute from "./AuthenticatedRoute";
import ProfileCard from "../pages/ProfileCard/ProfileCard";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
import SharedLayout from "../components/SharedLayout";
import InvoiceLibrary from "../pages/InvoiceLibrary/InvoiceLibrary";

const AllRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="create-user" element={<CreateUser />} />
        <Route path="reset-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route
          path="panel"
          element={
            <AuthenticatedRoute>
              <Panel />
            </AuthenticatedRoute>
          }
        >
          <Route
            index
            element={
              <SharedLayout>
                <ProfileCard />
              </SharedLayout>
            }
          />
          <Route
            path="user-details/:userId"
            element={
              <SharedLayout>
                <UserDetails />
              </SharedLayout>
            }
          />
          <Route
            path="invoice-library"
            element={
              <SharedLayout>
                <InvoiceLibrary />
              </SharedLayout>
            }
          />
        </Route>
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
  );
};

export default AllRoutes;
