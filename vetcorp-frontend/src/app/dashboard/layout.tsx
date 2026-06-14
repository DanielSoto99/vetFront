"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Inicio", emoji: "🏠" },
  { href: "/dashboard/agenda", label: "Agenda", emoji: "📅" },
  { href: "/dashboard/pacientes", label: "Pacientes", emoji: "🐾" },
  { href: "/dashboard/consultas/nueva", label: "Nueva consulta", emoji: "📋" },
  { href: "/dashboard/consultas", label: "Historial", emoji: "🗂️" },
  { href: "/dashboard/recetas", label: "Recetas", emoji: "💊" },
];

type Usuario = {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  rol: string;
  sexoUsuario?: "M" | "F" | "OTRO";
};

function obtenerTitulo(usuario: Usuario | null) {
  if (!usuario) return "";

  if (usuario.sexoUsuario === "F") return "Dra.";
  if (usuario.sexoUsuario === "M") return "Dr.";

  return "";
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-10 flex h-[46px] items-center justify-between">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex h-full items-center gap-3"
        >
          <img
            src="/logo-vetcorp.png"
            alt="VetCorp"
            className="h-30 w-auto object-contain"
          />

          <div className="leading-tight">
            <p className="text-sm font-bold text-slate-900">
              Gestión veterinaria
            </p>
          </div>
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            ✕
          </button>
        )}
      </div>

      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>{item.emoji}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl bg-slate-50 p-4">
        <p className="text-xs text-slate-400">Versión</p>
        <p className="text-sm font-semibold text-slate-700">
          VetCorp SaaS v1.0
        </p>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [usuarioMenu, setUsuarioMenu] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const data = localStorage.getItem("usuario");

    if (!token || !data) {
      router.push("/login");
      return;
    }

    setUsuario(JSON.parse(data));
  }, [router]);

  function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 hidden h-full w-72 border-r bg-white lg:block">
        <Sidebar />
      </aside>

      {menuAbierto && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 border-r bg-white transition-transform duration-300 lg:hidden ${
          menuAbierto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onClose={() => setMenuAbierto(false)} />
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b bg-white/80 px-4 py-4 backdrop-blur sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMenuAbierto(true)}
                className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              >
                ☰
              </button>

              <div>
                <p className="text-xs text-slate-500 sm:text-sm">
                  Panel veterinario
                </p>
                <h1 className="text-sm font-semibold text-slate-900 sm:text-base">
                  VetCorp SaaS
                </h1>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setUsuarioMenu(!usuarioMenu)}
                className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
              >
                <span>
                  {usuario
                    ? `${obtenerTitulo(usuario)} ${usuario.nombre}`
                    : "Usuario"}
                </span>
                <span>▾</span>
              </button>

              {usuarioMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border bg-white p-2 shadow-xl">
                  <div className="border-b px-3 py-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {usuario
                        ? `${obtenerTitulo(usuario)} ${usuario.nombre} ${usuario.apellido || ""}`
                        : "Usuario"}
                    </p>
                    <p className="text-xs text-slate-500">{usuario?.email}</p>
                    <p className="mt-1 text-xs font-medium text-slate-400">
                      {usuario?.rol}
                    </p>
                  </div>

                  <Link
                    href="/dashboard/perfil"
                    className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    Mi perfil
                  </Link>

                  <button
                    onClick={cerrarSesion}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}