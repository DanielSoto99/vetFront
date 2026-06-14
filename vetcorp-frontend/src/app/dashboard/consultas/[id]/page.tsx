"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

function fecha(f?: string) {
  if (!f) return "Sin fecha";
  return new Date(f).toLocaleDateString("es-CL");
}

export default function DetalleConsultaPage() {
  const params = useParams();
  const id = params.id as string;

  const [consulta, setConsulta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      const data = await apiFetch(`/consultas/${id}`);
      setConsulta(data);
      setLoading(false);
    }

    cargar();
  }, [id]);

  if (loading) return <main className="p-6">Cargando consulta...</main>;

  return (
    <main className="p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link
          href={`/dashboard/pacientes/${consulta.mascotaId}`}
          className="text-sm text-slate-500"
        >
          ← Volver a ficha
        </Link>

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">
            {consulta.tipoConsulta}
          </h1>

          <p className="mt-1 text-slate-500">
            {fecha(consulta.fechaConsulta)} · {consulta.estado}
          </p>

          <p className="mt-4 text-lg font-semibold text-slate-900">
            {consulta.mascota?.nombre}
          </p>

          <p className="text-sm text-slate-500">
            Tutor: {consulta.mascota?.tutor?.nombre}{" "}
            {consulta.mascota?.tutor?.apellido || ""}
          </p>
        </section>

        <section className="grid gap-6 sm:grid-cols-4">
          <Info label="Peso" value={consulta.pesoActual ? `${consulta.pesoActual} kg` : "Sin registro"} />
          <Info label="Temperatura" value={consulta.temperatura ? `${consulta.temperatura} °C` : "Sin registro"} />
          <Info label="FC" value={consulta.frecuenciaCardiaca ? `${consulta.frecuenciaCardiaca} lpm` : "Sin registro"} />
          <Info label="FR" value={consulta.frecuenciaRespiratoria ? `${consulta.frecuenciaRespiratoria} rpm` : "Sin registro"} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card title="Anamnesis">
            <Dato label="Motivo" value={consulta.motivoConsulta} />
            <Dato label="Duración síntomas" value={consulta.duracionSintomas || "Sin registro"} />
            <Dato label="Anamnesis" value={consulta.anamnesis || "Sin registro"} />
          </Card>

          <Card title="Signos clínicos">
            <Dato label="TRC" value={consulta.trc || "Sin registro"} />
            <Dato label="Mucosas" value={consulta.mucosas || "Sin registro"} />
            <Dato label="Estado general" value={consulta.estadoGeneral || "Sin registro"} />
          </Card>
        </section>

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Examen físico por sistemas
          </h2>

          <div className="grid gap-4 lg:grid-cols-2">
            <Dato label="Cardiovascular" value={consulta.sistemaCardiovascular || "Sin registro"} />
            <Dato label="Respiratorio" value={consulta.sistemaRespiratorio || "Sin registro"} />
            <Dato label="Digestivo" value={consulta.sistemaDigestivo || "Sin registro"} />
            <Dato label="Neurológico" value={consulta.sistemaNeurologico || "Sin registro"} />
            <Dato label="Músculo-esquelético" value={consulta.sistemaMusculoEsqueletico || "Sin registro"} />
            <Dato label="Piel y pelaje" value={consulta.pielPelaje || "Sin registro"} />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card title="Diagnóstico">
            <Dato label="Presuntivo" value={consulta.diagnosticoPresuntivo || "Sin registro"} />
            <Dato label="Definitivo" value={consulta.diagnosticoDefinitivo || "Sin registro"} />
            <Dato label="Indicaciones tutor" value={consulta.indicacionesTutor || "Sin registro"} />
            <Dato label="Fecha control" value={consulta.fechaControl ? fecha(consulta.fechaControl) : "Sin control"} />
          </Card>

          <Card title="Cierre">
            <Dato label="Observaciones" value={consulta.observacionesCierre || "Sin observaciones"} />
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card title="Tratamientos">
            {!consulta.tratamientoMedicamentos || consulta.tratamientoMedicamentos.length === 0 ? (
  <p className="text-sm text-slate-400">Sin tratamientos registrados.</p>
) : (
  consulta.tratamientoMedicamentos.map((t) => (
                <div key={t.id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{t.nombre}</p>
                  <p className="text-sm text-slate-500">
                    {t.dosis || "Sin dosis"} · {t.frecuencia || "Sin frecuencia"} · {t.duracion || "Sin duración"}
                  </p>
                  <p className="text-sm text-slate-500">
                    Vía: {t.via || "Sin vía"}
                  </p>
                  {t.indicaciones && (
                    <p className="mt-2 text-sm text-slate-600">{t.indicaciones}</p>
                  )}
                </div>
              ))
            )}
          </Card>

          <Card title="Exámenes solicitados">
            {!consulta.examenesSolicitados || consulta.examenesSolicitados.length === 0 ? (
  <p className="text-sm text-slate-400">Sin exámenes solicitados.</p>
) : (
  consulta.examenesSolicitados.map((e) => (
                <div key={e.id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{e.nombre}</p>
                  <p className="text-sm text-slate-500">{e.estado}</p>
                  {e.resultado && (
                    <p className="mt-2 text-sm text-slate-600">{e.resultado}</p>
                  )}
                </div>
              ))
            )}
          </Card>
        </section>

        {consulta.receta && (
          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Receta</h2>
            <p className="text-sm text-slate-500">
              Número: {consulta.receta.numero || "Borrador"}
            </p>
            <p className="text-sm text-slate-500">
              Estado: {consulta.receta.emitida ? "Emitida" : "No emitida"}
            </p>
            <p className="mt-3 text-slate-700">
              {consulta.receta.indicaciones || "Sin indicaciones"}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-slate-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Dato({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="whitespace-pre-line text-sm text-slate-700">{value}</p>
    </div>
  );
}