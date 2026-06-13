"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

function fecha(fecha?: string) {
  if (!fecha) return "Sin fecha";
  return new Date(fecha).toLocaleDateString("es-CL");
}

export default function FichaPacientePage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      const resp = await apiFetch(`/mascotas/${id}/ficha-completa`);
      setData(resp);
      setLoading(false);
    }

    cargar();
  }, [id]);

  if (loading) return <main className="p-6">Cargando ficha...</main>;

  const { mascota, tutor, antecedenteClinico, consultas, vacunas, desparasitaciones, archivos, proximaCita, resumen } = data;

  return (
    <main className="p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link href="/dashboard/pacientes" className="text-sm text-slate-500">
          ← Volver a pacientes
        </Link>

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">{mascota.nombre}</h1>
          <p className="mt-1 text-slate-500">
            {mascota.especie} · {mascota.raza || "Sin raza"} · {mascota.sexo || "Sin sexo"}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <Info label="Peso" value={mascota.pesoActual ? `${mascota.pesoActual} kg` : "Sin peso"} />
            <Info label="Microchip" value={mascota.microchip || "No registrado"} />
            <Info label="Esterilizado" value={mascota.esterilizado ? "Sí" : "No"} />
            <Info label="Próxima cita" value={proximaCita ? fecha(proximaCita.fechaInicio) : "Sin cita"} />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card title="Tutor">
            <p className="font-semibold text-slate-900">
              {tutor.nombre} {tutor.apellido || ""}
            </p>
            <p className="text-sm text-slate-500">{tutor.telefono || "Sin teléfono"}</p>
            <p className="text-sm text-slate-500">{tutor.email || "Sin email"}</p>
            <p className="text-sm text-slate-500">{tutor.direccion || "Sin dirección"}</p>
          </Card>

          <Card title="Antecedentes clínicos">
            <Dato label="Alergias" value={antecedenteClinico?.alergias || "Sin alergias registradas"} />
            <Dato label="Enfermedades previas" value={antecedenteClinico?.enfermedadesPrevias || "Sin antecedentes"} />
            <Dato label="Medicamentos actuales" value={antecedenteClinico?.medicamentosActuales || "Ninguno"} />
            <Dato label="Condición corporal" value={antecedenteClinico?.condicionCorporal ? `${antecedenteClinico.condicionCorporal}/9` : "Sin registro"} />
          </Card>

          <Card title="Resumen">
            <Dato label="Consultas" value={resumen.totalConsultas} />
            <Dato label="Vacunas" value={resumen.totalVacunas} />
            <Dato label="Desparasitaciones" value={resumen.totalDesparasitaciones} />
            <Dato label="Archivos" value={resumen.totalArchivos} />
          </Card>
        </section>

        <section className="rounded-3xl border bg-white shadow-sm">
          <Titulo title="Consultas clínicas" />
          <ListaVacia visible={consultas.length === 0} texto="No hay consultas registradas." />
          <div className="divide-y">
            {consultas.map((c: any) => (
              <div key={c.id} className="px-6 py-4">
                <p className="font-semibold text-slate-900">
                  {c.tipoConsulta} · {fecha(c.fechaConsulta)}
                </p>
                <p className="text-sm text-slate-500">
                  {c.diagnosticoPresuntivo || "Sin diagnóstico"} · {c.estado}
                </p>
                <p className="mt-2 text-sm text-slate-600">{c.motivoConsulta}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card title="Vacunas">
            {vacunas.length === 0 ? (
              <p className="text-sm text-slate-400">No hay vacunas registradas.</p>
            ) : (
              vacunas.map((v: any) => (
                <div key={v.id} className="border-b py-3 last:border-b-0">
                  <p className="font-medium text-slate-900">{v.nombre}</p>
                  <p className="text-sm text-slate-500">
                    Aplicada: {fecha(v.fechaAplicacion)}
                  </p>
                  <p className="text-sm text-slate-500">
                    Próxima: {fecha(v.fechaProximaDosis)}
                  </p>
                </div>
              ))
            )}
          </Card>

          <Card title="Desparasitaciones">
            {desparasitaciones.length === 0 ? (
              <p className="text-sm text-slate-400">No hay desparasitaciones registradas.</p>
            ) : (
              desparasitaciones.map((d: any) => (
                <div key={d.id} className="border-b py-3 last:border-b-0">
                  <p className="font-medium text-slate-900">{d.producto}</p>
                  <p className="text-sm text-slate-500">
                    Aplicada: {fecha(d.fechaAplicacion)}
                  </p>
                  <p className="text-sm text-slate-500">
                    Próxima: {fecha(d.fechaProximaDosis)}
                  </p>
                </div>
              ))
            )}
          </Card>
        </section>

        <section className="rounded-3xl border bg-white shadow-sm">
          <Titulo title="Archivos clínicos" />
          <ListaVacia visible={archivos.length === 0} texto="No hay archivos registrados." />
          <div className="divide-y">
            {archivos.map((a: any) => (
              <a
                key={a.id}
                href={a.url}
                target="_blank"
                className="block px-6 py-4 hover:bg-slate-50"
              >
                <p className="font-medium text-slate-900">{a.nombreOriginal}</p>
                <p className="text-sm text-slate-500">{a.categoria || "Archivo clínico"}</p>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-bold text-slate-900">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Dato({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

function Titulo({ title }: { title: string }) {
  return <h2 className="border-b px-6 py-5 font-bold text-slate-900">{title}</h2>;
}

function ListaVacia({ visible, texto }: { visible: boolean; texto: string }) {
  if (!visible) return null;
  return <div className="p-6 text-sm text-slate-400">{texto}</div>;
}