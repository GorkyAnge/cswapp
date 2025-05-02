import { NextResponse } from "next/server";
import {
  getClients,
  getClientById,
  getClientsByCity,
  getClientsSortedByAge,
  setClients,
  getClientsByAgeRange,
} from "../../lib/data";

export async function POST(request) {
  const body = await request.json();
  setClients(
    body.map((c) => ({
      id: c.id,
      nombres: c.nombres,
      apellidos: c.apellidos,
      fecha_nacimiento: c.fecha_nacimiento
        ? new Date(c.fecha_nacimiento)
        : null,
      ciudad: c.ciudad,
      fecha_registro: c.fecha_registro ? new Date(c.fecha_registro) : null,
      email: c.email,
    }))
  );
  return NextResponse.json({ ok: true });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const city = searchParams.get("city");
  const sort = searchParams.get("sort");
  const ageMin = searchParams.get("ageMin");
  const ageMax = searchParams.get("ageMax");

  if (id) {
    const client = getClientById(id);
    return NextResponse.json(client ? client : { error: "Not found" }, {
      status: client ? 200 : 404,
    });
  }

  if (city) {
    return NextResponse.json(getClientsByCity(city));
  }

  if (sort === "age") {
    return NextResponse.json(getClientsSortedByAge());
  }

  if (ageMin || ageMax) {
    return NextResponse.json(getClientsByAgeRange(ageMin, ageMax));
  }

  return NextResponse.json(getClients());
}
