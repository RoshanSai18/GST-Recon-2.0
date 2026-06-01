import { Link } from "react-router-dom";
import StarLogo from "./StarLogo";

const Navbar = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 w-full px-6 lg:px-8 pt-4">
      <nav className="max-w-7xl mx-auto bg-[#171717]/80 backdrop-blur-md rounded-2xl border border-[#262626] shadow-sm px-6 sm:px-8 py-4 grid grid-cols-3 items-center">
        <div className="flex justify-start">
          <span className="w-[84px]" />
        </div>

        <div className="flex justify-center">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-[#e5e5e5]"
          >
            <StarLogo className="w-7 h-7 text-[#d4d4d4] drop-shadow-sm" />
            <span>GraphGST</span>
          </Link>
        </div>

        <div className="flex justify-end">
          <Link
            to="/login"
            className="inline-flex items-center rounded-full border border-[#262626] bg-[#262626] px-5 py-2 text-sm font-medium text-[#e5e5e5] hover:bg-[#171717] transition-colors"
          >
            Log in
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
