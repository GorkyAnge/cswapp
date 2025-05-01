import { NextResponse } from "next/server";
import {
  getClients,
  getClientById,
  getClientsByCity,
  getClientsSortedByAge,
  setClients,
} from "../../lib/data";

export async function POST(request) {
  const body = await request.json();
  setClients(
    body.map((c) => ({
      id: c.id,
      name: c.name,
      city: c.city,
      age: parseInt(c.age, 10),
    }))
  );
  return NextResponse.json({ ok: true });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const city = searchParams.get("city");
  const sort = searchParams.get("sort");

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

  return NextResponse.json(getClients());
}
