"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Especie = {
  id: number;
  nombre: string;
};

export default function NuevoPacientePage() {
  const router = useRouter();

  const [especies, setEspecies] = useState<Especie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    tutorNombre: "",
    tutorApellido: "",
    tutorRut: "",
    tutorTelefono: "",
    tutorEmail: "",
    tutorDireccion: "",
    tutorCiudad: "Santiago",

    mascotaNombre: "",
    especieId: "",
    raza: "",
    sexo: "",
    fechaNacimiento: "",
    pesoActual: "",
    colorPelaje: "",
    microchip: "",
    esterilizado: false,
    observaciones: "",

    alergias: "",
    enfermedadesPrevias: "",
    medicamentosActuales: "",
    condicionCorporal: "",
    antecedentesObservaciones: "",
  });

  useEffect(() => {
    async function cargarEspecies() {
      const data = await apiFetch("/especies");
      setEspecies(data);
    }

    cargarEspecies();
  }, []);

  function update(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.tutorNombre || !form.mascotaNombre || !form.especieId) {
      setError("Completa tutor, nombre de mascota y especie.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const tutorResp = await apiFetch("/tutores", {
        method: "POST",
        body: JSON.stringify({
          nombre: form.tutorNombre,
          apellido: form.tutorApellido,
          rut: form.tutorRut,
          telefono: form.tutorTelefono,
          email: form.tutorEmail,
          direccion: form.tutorDireccion,
          ciudad: form.tutorCiudad,
        }),
      });

      const mascotaResp = await apiFetch("/mascotas", {
        method: "POST",
        body: JSON.stringify({
          nombre: form.mascotaNombre,
          especieId: Number(form.especieId),
          raza: form.raza,
          sexo: form.sexo,
          fechaNacimiento: form.fechaNacimiento || undefined,
          pesoActual: form.pesoActual ? Number(form.pesoActual) : undefined,
          colorPelaje: form.colorPelaje,
          microchip: form.microchip,
          esterilizado: form.esterilizado,
          observaciones: form.observaciones,
          tutorId: tutorResp.tutor.id,
        }),
      });

      await apiFetch("/antecedentes", {
        method: "POST",
        body: JSON.stringify({
          mascotaId: mascotaResp.mascota.id,
          alergias: form.alergias,
          enfermedadesPrevias: form.enfermedadesPrevias,
          medicamentosActuales: form.medicamentosActuales,
          condicionCorporal: form.condicionCorporal
            ? Number(form.condicionCorporal)
            : undefined,
          observaciones: form.antecedentesObservaciones,
        }),
      });

      router.push(`/dashboard/pacientes/${mascotaResp.mascota.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar paciente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Nuevo paciente</h1>
          <p className="text-slate-500">
            Registra tutor, mascota y antecedentes clínicos.
          </p>
        </div>

        <form onSubmit={guardar} className="space-y-6">
          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Tutor</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Nombre tutor *">
                <input className="input" value={form.tutorNombre} onChange={(e) => update("tutorNombre", e.target.value)} />
              </Campo>

              <Campo label="Apellido">
                <input className="input" value={form.tutorApellido} onChange={(e) => update("tutorApellido", e.target.value)} />
              </Campo>

              <Campo label="RUT">
                <input className="input" value={form.tutorRut} onChange={(e) => update("tutorRut", e.target.value)} />
              </Campo>

              <Campo label="Teléfono">
                <input className="input" value={form.tutorTelefono} onChange={(e) => update("tutorTelefono", e.target.value)} />
              </Campo>

              <Campo label="Email">
                <input className="input" value={form.tutorEmail} onChange={(e) => update("tutorEmail", e.target.value)} />
              </Campo>

              <Campo label="Ciudad">
                <input className="input" value={form.tutorCiudad} onChange={(e) => update("tutorCiudad", e.target.value)} />
              </Campo>

              <Campo label="Dirección">
                <input className="input" value={form.tutorDireccion} onChange={(e) => update("tutorDireccion", e.target.value)} />
              </Campo>
            </div>
          </section>

          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Mascota</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Nombre mascota *">
                <input className="input" value={form.mascotaNombre} onChange={(e) => update("mascotaNombre", e.target.value)} />
              </Campo>

              <Campo label="Especie *">
                <select className="input" value={form.especieId} onChange={(e) => update("especieId", e.target.value)}>
                  <option value="">Seleccionar especie</option>
                  {especies.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo label="Raza">
                <input className="input" value={form.raza} onChange={(e) => update("raza", e.target.value)} />
              </Campo>

              <Campo label="Sexo">
                <select className="input" value={form.sexo} onChange={(e) => update("sexo", e.target.value)}>
                  <option value="">Seleccionar</option>
                  <option>Macho</option>
                  <option>Hembra</option>
                  <option>Desconocido</option>
                </select>
              </Campo>

              <Campo label="Fecha nacimiento">
                <input type="date" className="input" value={form.fechaNacimiento} onChange={(e) => update("fechaNacimiento", e.target.value)} />
              </Campo>

              <Campo label="Peso actual kg">
                <input type="number" step="0.1" className="input" value={form.pesoActual} onChange={(e) => update("pesoActual", e.target.value)} />
              </Campo>

              <Campo label="Color pelaje">
                <input className="input" value={form.colorPelaje} onChange={(e) => update("colorPelaje", e.target.value)} />
              </Campo>

              <Campo label="Microchip">
                <input className="input" value={form.microchip} onChange={(e) => update("microchip", e.target.value)} />
              </Campo>
            </div>

            <label className="mt-4 flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.esterilizado}
                onChange={(e) => update("esterilizado", e.target.checked)}
              />
              <span className="text-sm text-slate-700">Esterilizado</span>
            </label>

            <Campo label="Observaciones">
              <textarea className="input mt-4" rows={3} value={form.observaciones} onChange={(e) => update("observaciones", e.target.value)} />
            </Campo>
          </section>

          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Antecedentes clínicos
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Alergias">
                <input className="input" value={form.alergias} onChange={(e) => update("alergias", e.target.value)} />
              </Campo>

              <Campo label="Enfermedades previas">
                <input className="input" value={form.enfermedadesPrevias} onChange={(e) => update("enfermedadesPrevias", e.target.value)} />
              </Campo>

              <Campo label="Medicamentos actuales">
                <input className="input" value={form.medicamentosActuales} onChange={(e) => update("medicamentosActuales", e.target.value)} />
              </Campo>

              <Campo label="Condición corporal 1-9">
                <input type="number" className="input" value={form.condicionCorporal} onChange={(e) => update("condicionCorporal", e.target.value)} />
              </Campo>
            </div>

            <Campo label="Observaciones antecedentes">
              <textarea className="input mt-4" rows={3} value={form.antecedentesObservaciones} onChange={(e) => update("antecedentesObservaciones", e.target.value)} />
            </Campo>
          </section>

          {error && (
            <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard/pacientes")}
              className="rounded-2xl border border-slate-200 px-6 py-3 text-slate-700"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Guardar paciente"}
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