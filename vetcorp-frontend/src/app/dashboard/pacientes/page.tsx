"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Mascota = {
  id: number;
  nombre: string;
  especie?: {
  id: number;
  nombre: string;
};
  raza?: string;
  sexo?: string;
  pesoActual?: number;
  esterilizado: boolean;
  tutor?: {
    nombre: string;
    apellido?: string;
    telefono?: string;
  };
};

function emojiEspecie(especie?: string) {
  const mapa: Record<string, string> = {
    Canino: "🐶",
    Felino: "🐱",
    Ave: "🐦",
    Conejo: "🐰",
    Reptil: "🦎",
    Roedor: "🐹",
    Otro: "🐾",
  };

  return mapa[especie || ""] || "🐾";
}

export default function PacientesPage() {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const data = await apiFetch("/mascotas");
        setMascotas(data);
      } finally {
        setLoading(false);
      }
    }

    cargar();
  }, []);

  const filtradas = mascotas.filter((m) => {
    const q = busqueda.toLowerCase();

    return (
      m.nombre.toLowerCase().includes(q) ||
      (m.especie?.nombre || "").toLowerCase().includes(q) ||
      (m.raza || "").toLowerCase().includes(q) ||
      (m.tutor?.nombre || "").toLowerCase().includes(q) ||
      (m.tutor?.apellido || "").toLowerCase().includes(q)
    );
  });

  return (
    <main className="p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Pacientes</h1>
            <p className="text-slate-500">Mascotas registradas en tu consulta</p>
          </div>

          <Link
            href="/dashboard/pacientes/nueva"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + Nuevo paciente
          </Link>
        </div>

        <div className="rounded-3xl border bg-white p-4 shadow-sm">
          <input
            type="text"
            placeholder="Buscar por mascota, especie, raza o tutor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
          />
        </div>

        <div className="rounded-3xl border bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-slate-400">Cargando pacientes...</div>
          ) : filtradas.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p className="mb-3 text-4xl">🔍</p>
              <p className="font-medium">No se encontraron pacientes</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtradas.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                    {emojiEspecie(m.especie?.nombre)}
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {m.nombre}
                      <span className="ml-2 text-sm font-normal text-slate-400">
                        {m.raza || "Sin raza"}
                      </span>
                    </p>

                    <p className="text-sm text-slate-500">
                      {m.especie?.nombre || "Sin especie"} · {m.sexo || "Sin sexo"} ·{" "}
                      {m.pesoActual ? `${m.pesoActual} kg` : "Sin peso"}
                    </p>

                    <p className="text-xs text-slate-400">
                      Tutor: {m.tutor?.nombre} {m.tutor?.apellido || ""} ·{" "}
                      {m.tutor?.telefono || "Sin teléfono"}
                    </p>
                  </div>

                  {m.esterilizado && (
                    <span className="hidden rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 sm:block">
                      Esterilizado
                    </span>
                  )}

                  <Link
                    href={`/dashboard/pacientes/${m.id}`}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    Ver ficha
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-right text-sm text-slate-400">
          {filtradas.length} pacientes
        </p>
      </div>
    </main>
  );
}