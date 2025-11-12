import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Layout() {
  return (
    <>
      <Navbar />
      {/* กันทับด้วย padding-top เท่าความสูง navbar */}
      <main className="pt-14">
        <Outlet />
      </main>
    </>
  );
}
