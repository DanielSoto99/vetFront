"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function NuevaDesparasitacionPage() {
  const router = useRouter();
  const params = useParams();
  const mascotaId = params.id as string;

  const [form, setForm] = useState({
    producto: "",
    dosis: "",
    fechaAplicacion: "",
    fechaProximaDosis: "",
    observaciones: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.producto || !form.fechaAplicacion) {
      setError("Debes ingresar producto y fecha de aplicación.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await apiFetch("/desparasitaciones", {
        method: "POST",
        body: JSON.stringify({
          mascotaId: Number(mascotaId),
          producto: form.producto,
          dosis: form.dosis,
          fechaAplicacion: new Date(form.fechaAplicacion).toISOString(),
          fechaProximaDosis: form.fechaProximaDosis
            ? new Date(form.fechaProximaDosis).toISOString()
            : undefined,
          observaciones: form.observaciones,
        }),
      });

      router.push(`/dashboard/pacientes/${mascotaId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al registrar desparasitación",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href={`/dashboard/pacientes/${mascotaId}`}
          className="text-sm text-slate-500"
        >
          ← Volver a ficha
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Registrar desparasitación
          </h1>
          <p className="text-slate-500">
            Guarda producto, dosis y próxima aplicación.
          </p>
        </div>

        <form
          onSubmit={guardar}
          className="space-y-4 rounded-3xl border bg-white p-6 shadow-sm"
        >
          <Campo label="Producto *">
            <input
              className="input"
              placeholder="Ej: Drontal, NexGard, Bravecto"
              value={form.producto}
              onChange={(e) => update("producto", e.target.value)}
            />
          </Campo>

          <Campo label="Dosis">
            <input
              className="input"
              placeholder="Ej: 1 comprimido, 2 ml"
              value={form.dosis}
              onChange={(e) => update("dosis", e.target.value)}
            />
          </Campo>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Fecha aplicación *">
              <input
                type="date"
                className="input"
                value={form.fechaAplicacion}
                onChange={(e) => update("fechaAplicacion", e.target.value)}
              />
            </Campo>

            <Campo label="Próxima dosis">
              <input
                type="date"
                className="input"
                value={form.fechaProximaDosis}
                onChange={(e) => update("fechaProximaDosis", e.target.value)}
              />
            </Campo>
          </div>

          <Campo label="Observaciones">
            <textarea
              rows={4}
              className="input"
              value={form.observaciones}
              onChange={(e) => update("observaciones", e.target.value)}
            />
          </Campo>

          {error && (
            <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href={`/dashboard/pacientes/${mascotaId}`}
              className="rounded-2xl border border-slate-200 px-6 py-3 text-slate-700"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}