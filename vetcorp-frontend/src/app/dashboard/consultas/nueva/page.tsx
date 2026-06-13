"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Mascota = {
  id: number;
  nombre: string;
  especie: string;
  raza?: string;
  tutor?: {
    nombre: string;
    apellido?: string;
  };
};

type FormConsulta = {
  mascotaId: string;
  tipoConsulta: string;
  estado: string;
  pesoActual: string;
  temperatura: string;
  frecuenciaCardiaca: string;
  frecuenciaRespiratoria: string;
  trc: string;
  mucosas: string;
  motivoConsulta: string;
  duracionSintomas: string;
  anamnesis: string;
  estadoGeneral: string;
  sistemaCardiovascular: string;
  sistemaRespiratorio: string;
  sistemaDigestivo: string;
  sistemaNeurologico: string;
  sistemaMusculoEsqueletico: string;
  pielPelaje: string;
  diagnosticoPresuntivo: string;
  diagnosticoDefinitivo: string;
  indicacionesTutor: string;
  fechaControl: string;
  observacionesCierre: string;
};

const FORM_INICIAL: FormConsulta = {
  mascotaId: "",
  tipoConsulta: "Consulta general",
  estado: "COMPLETADA",
  pesoActual: "",
  temperatura: "",
  frecuenciaCardiaca: "",
  frecuenciaRespiratoria: "",
  trc: "",
  mucosas: "",
  motivoConsulta: "",
  duracionSintomas: "",
  anamnesis: "",
  estadoGeneral: "",
  sistemaCardiovascular: "",
  sistemaRespiratorio: "",
  sistemaDigestivo: "",
  sistemaNeurologico: "",
  sistemaMusculoEsqueletico: "",
  pielPelaje: "",
  diagnosticoPresuntivo: "",
  diagnosticoDefinitivo: "",
  indicacionesTutor: "",
  fechaControl: "",
  observacionesCierre: "",
};

export default function NuevaConsultaPage() {
  const router = useRouter();

  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [form, setForm] = useState<FormConsulta>(FORM_INICIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarMascotas() {
      const data = await apiFetch("/mascotas");
      setMascotas(data);
    }

    cargarMascotas();
  }, []);

  function update<K extends keyof FormConsulta>(key: K, value: FormConsulta[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function guardarConsulta(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.mascotaId) {
      setError("Debes seleccionar una mascota.");
      return;
    }

    if (!form.motivoConsulta.trim()) {
      setError("Debes ingresar el motivo de consulta.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const resp = await apiFetch("/consultas", {
        method: "POST",
        body: JSON.stringify({
          mascotaId: Number(form.mascotaId),
          tipoConsulta: form.tipoConsulta,
          estado: form.estado,

          pesoActual: form.pesoActual ? Number(form.pesoActual) : undefined,
          temperatura: form.temperatura ? Number(form.temperatura) : undefined,
          frecuenciaCardiaca: form.frecuenciaCardiaca
            ? Number(form.frecuenciaCardiaca)
            : undefined,
          frecuenciaRespiratoria: form.frecuenciaRespiratoria
            ? Number(form.frecuenciaRespiratoria)
            : undefined,

          trc: form.trc,
          mucosas: form.mucosas,
          motivoConsulta: form.motivoConsulta,
          duracionSintomas: form.duracionSintomas,
          anamnesis: form.anamnesis,

          estadoGeneral: form.estadoGeneral,
          sistemaCardiovascular: form.sistemaCardiovascular,
          sistemaRespiratorio: form.sistemaRespiratorio,
          sistemaDigestivo: form.sistemaDigestivo,
          sistemaNeurologico: form.sistemaNeurologico,
          sistemaMusculoEsqueletico: form.sistemaMusculoEsqueletico,
          pielPelaje: form.pielPelaje,

          diagnosticoPresuntivo: form.diagnosticoPresuntivo,
          diagnosticoDefinitivo: form.diagnosticoDefinitivo,
          indicacionesTutor: form.indicacionesTutor,
          fechaControl: form.fechaControl
            ? new Date(form.fechaControl).toISOString()
            : undefined,
          observacionesCierre: form.observacionesCierre,
        }),
      });

      router.push(`/dashboard/pacientes/${resp.consulta.mascotaId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar consulta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Nueva consulta</h1>
          <p className="text-slate-500">Registro clínico veterinario</p>
        </div>

        <form onSubmit={guardarConsulta} className="space-y-6">
          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Paciente y tipo de atención
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Mascota *">
                <select
                  value={form.mascotaId}
                  onChange={(e) => update("mascotaId", e.target.value)}
                  className="input"
                >
                  <option value="">Seleccionar mascota</option>
                  {mascotas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre} · {m.especie} · Tutor: {m.tutor?.nombre}{" "}
                      {m.tutor?.apellido || ""}
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo label="Tipo de consulta">
                <select
                  value={form.tipoConsulta}
                  onChange={(e) => update("tipoConsulta", e.target.value)}
                  className="input"
                >
                  <option>Consulta general</option>
                  <option>Control</option>
                  <option>Vacunación</option>
                  <option>Desparasitación</option>
                  <option>Urgencia</option>
                  <option>Domicilio</option>
                  <option>Otro</option>
                </select>
              </Campo>
            </div>
          </section>

          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Signos vitales
            </h2>

            <div className="grid gap-4 sm:grid-cols-4">
              <Campo label="Peso kg">
                <input
                  className="input"
                  type="number"
                  step="0.1"
                  value={form.pesoActual}
                  onChange={(e) => update("pesoActual", e.target.value)}
                />
              </Campo>

              <Campo label="Temperatura °C">
                <input
                  className="input"
                  type="number"
                  step="0.1"
                  value={form.temperatura}
                  onChange={(e) => update("temperatura", e.target.value)}
                />
              </Campo>

              <Campo label="FC">
                <input
                  className="input"
                  type="number"
                  value={form.frecuenciaCardiaca}
                  onChange={(e) =>
                    update("frecuenciaCardiaca", e.target.value)
                  }
                />
              </Campo>

              <Campo label="FR">
                <input
                  className="input"
                  type="number"
                  value={form.frecuenciaRespiratoria}
                  onChange={(e) =>
                    update("frecuenciaRespiratoria", e.target.value)
                  }
                />
              </Campo>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Campo label="TRC">
                <input
                  className="input"
                  placeholder="< 2 seg"
                  value={form.trc}
                  onChange={(e) => update("trc", e.target.value)}
                />
              </Campo>

              <Campo label="Mucosas">
                <input
                  className="input"
                  placeholder="Rosadas húmedas"
                  value={form.mucosas}
                  onChange={(e) => update("mucosas", e.target.value)}
                />
              </Campo>
            </div>
          </section>

          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Anamnesis
            </h2>

            <div className="space-y-4">
              <Campo label="Motivo de consulta *">
                <input
                  className="input"
                  value={form.motivoConsulta}
                  onChange={(e) => update("motivoConsulta", e.target.value)}
                />
              </Campo>

              <Campo label="Duración de síntomas">
                <input
                  className="input"
                  value={form.duracionSintomas}
                  onChange={(e) => update("duracionSintomas", e.target.value)}
                />
              </Campo>

              <Campo label="Anamnesis">
                <textarea
                  rows={4}
                  className="input"
                  value={form.anamnesis}
                  onChange={(e) => update("anamnesis", e.target.value)}
                />
              </Campo>
            </div>
          </section>

          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Examen físico
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Estado general">
                <input
                  className="input"
                  value={form.estadoGeneral}
                  onChange={(e) => update("estadoGeneral", e.target.value)}
                />
              </Campo>

              <Campo label="Cardiovascular">
                <textarea
                  rows={3}
                  className="input"
                  value={form.sistemaCardiovascular}
                  onChange={(e) =>
                    update("sistemaCardiovascular", e.target.value)
                  }
                />
              </Campo>

              <Campo label="Respiratorio">
                <textarea
                  rows={3}
                  className="input"
                  value={form.sistemaRespiratorio}
                  onChange={(e) =>
                    update("sistemaRespiratorio", e.target.value)
                  }
                />
              </Campo>

              <Campo label="Digestivo">
                <textarea
                  rows={3}
                  className="input"
                  value={form.sistemaDigestivo}
                  onChange={(e) => update("sistemaDigestivo", e.target.value)}
                />
              </Campo>

              <Campo label="Neurológico">
                <textarea
                  rows={3}
                  className="input"
                  value={form.sistemaNeurologico}
                  onChange={(e) => update("sistemaNeurologico", e.target.value)}
                />
              </Campo>

              <Campo label="Músculo-esquelético">
                <textarea
                  rows={3}
                  className="input"
                  value={form.sistemaMusculoEsqueletico}
                  onChange={(e) =>
                    update("sistemaMusculoEsqueletico", e.target.value)
                  }
                />
              </Campo>

              <Campo label="Piel y pelaje">
                <textarea
                  rows={3}
                  className="input"
                  value={form.pielPelaje}
                  onChange={(e) => update("pielPelaje", e.target.value)}
                />
              </Campo>
            </div>
          </section>

          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Diagnóstico e indicaciones
            </h2>

            <div className="space-y-4">
              <Campo label="Diagnóstico presuntivo">
                <input
                  className="input"
                  value={form.diagnosticoPresuntivo}
                  onChange={(e) =>
                    update("diagnosticoPresuntivo", e.target.value)
                  }
                />
              </Campo>

              <Campo label="Diagnóstico definitivo">
                <input
                  className="input"
                  value={form.diagnosticoDefinitivo}
                  onChange={(e) =>
                    update("diagnosticoDefinitivo", e.target.value)
                  }
                />
              </Campo>

              <Campo label="Indicaciones al tutor">
                <textarea
                  rows={4}
                  className="input"
                  value={form.indicacionesTutor}
                  onChange={(e) => update("indicacionesTutor", e.target.value)}
                />
              </Campo>

              <Campo label="Fecha de control">
                <input
                  type="date"
                  className="input"
                  value={form.fechaControl}
                  onChange={(e) => update("fechaControl", e.target.value)}
                />
              </Campo>

              <Campo label="Observaciones de cierre">
                <textarea
                  rows={3}
                  className="input"
                  value={form.observacionesCierre}
                  onChange={(e) =>
                    update("observacionesCierre", e.target.value)
                  }
                />
              </Campo>
            </div>
          </section>

          {error && (
            <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-2xl border border-slate-200 px-6 py-3 text-slate-700"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Guardar consulta"}
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