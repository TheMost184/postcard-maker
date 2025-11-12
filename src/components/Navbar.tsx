import { useState } from "react";
import { NavLink } from "react-router-dom";

const linkBase =
  "px-3 py-2 rounded-md text-sm font-medium transition-colors";
const linkActive =
  "bg-stone-900 text-white";
const linkInactive =
  "text-stone-700 hover:bg-stone-200";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const navItem = (to: string, label: string) => (
    <NavLink
      to={to}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
        `${linkBase} ${isActive ? linkActive : linkInactive}`
      }
    >
      {label}
    </NavLink>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur border-b border-stone-200">
      <nav className="mx-auto max-w-5xl px-4">
        <div className="h-14 flex items-center justify-between">
          {/* Brand */}
          <NavLink to="/book" className="font-bold tracking-wide text-black">
            อิ่วปึ่ง
          </NavLink>

          {/* Desktop links */}
          <div className="hidden sm:flex gap-2">
            {navItem("/book", "เปิดแบบหนังสือ")}
            {navItem("/postcard", "สร้างโปสการ์ด")}
          </div>

          {/* Mobile: hamburger */}
          <button
            className="sm:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-stone-200"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {/* ไอคอนง่าย ๆ ด้วย SVG */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="sm:hidden pb-3 flex flex-col gap-1">
            {navItem("/book", "เปิดแบบหนังสือ")}
            {navItem("/postcard", "สร้างโปสการ์ด")}
          </div>
        )}
      </nav>
    </header>
  );
}
