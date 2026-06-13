"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Cita = {
  id: number;
  titulo: string;
  tipo: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  motivo?: string;
  observaciones?: string;
  mascota?: {
    id: number;
    nombre: string;
    especie: string;
  };
  tutor?: {
    nombre: string;
    apellido?: string;
    telefono?: string;
  };
};

function fecha(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-CL");
}

function hora(fecha: string) {
  return new Date(fecha).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

export default function AgendaPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      const data = await apiFetch("/agenda");
      setCitas(data);
      setLoading(false);
    }

    cargar();
  }, []);

  return (
    <main className="p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Agenda</h1>
            <p className="text-slate-500">
              Citas, controles y atenciones programadas
            </p>
          </div>

          <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            + Nueva cita
          </button>
        </div>

        <section className="rounded-3xl border bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-slate-400">Cargando agenda...</div>
          ) : citas.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p className="mb-3 text-4xl">📅</p>
              <p className="font-medium">No hay citas registradas</p>
            </div>
          ) : (
            <div className="divide-y">
              {citas.map((cita) => (
                <div
                  key={cita.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50"
                >
                  <div className="w-20 text-center">
                    <p className="text-sm font-bold text-slate-900">
                      {hora(cita.fechaInicio)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {fecha(cita.fechaInicio)}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                    {emojiEspecie(cita.mascota?.especie)}
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {cita.titulo}
                    </p>

                    <p className="text-sm text-slate-500">
                      {cita.tipo} · {cita.mascota?.nombre || "Sin mascota"}
                    </p>

                    <p className="text-xs text-slate-400">
                      Tutor: {cita.tutor?.nombre} {cita.tutor?.apellido || ""} ·{" "}
                      {cita.tutor?.telefono || "Sin teléfono"}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {cita.estado}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}