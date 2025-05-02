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
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  function paginate(arr) {
    const total = arr.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      data: arr.slice(start, end),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  if (id) {
    const client = getClientById(id);
    return NextResponse.json(client ? client : {}, {
      status: client ? 200 : 404,
    });
  }

  if (city) {
    return NextResponse.json(paginate(getClientsByCity(city)));
  }

  if (sort === "age") {
    return NextResponse.json(paginate(getClientsSortedByAge()));
  }

  if (ageMin || ageMax) {
    return NextResponse.json(paginate(getClientsByAgeRange(ageMin, ageMax)));
  }

  return NextResponse.json(paginate(getClients()));
}
