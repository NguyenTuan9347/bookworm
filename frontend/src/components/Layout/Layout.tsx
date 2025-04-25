import NavBar from "../NavBar/NavBar";
import "./Layout.css";
import { constVar } from "../../shared/constVar";
import Footer from "../Footer/Footer";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <>
      <NavBar links={constVar.links} signInMetadata={constVar.signInMetadata} />
      <main className="main-content pt-14 px-2 mx-16 min-h-screen">
        <Outlet />
      </main>
      <Footer {...constVar.additionalInfo} />
    </>
  );
}

export default Layout;
