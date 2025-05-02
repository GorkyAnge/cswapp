let clients = [];

export function setClients(newClients) {
  clients = newClients
    .filter((c) => c.id && c.nombres && c.apellidos && c.ciudad && c.email)
    .map((c) => ({
      id: c.id,
      nombres: c.nombres,
      apellidos: c.apellidos,
      fecha_nacimiento: c.fecha_nacimiento
        ? new Date(c.fecha_nacimiento)
        : null,
      ciudad: c.ciudad,
      fecha_registro: c.fecha_registro ? new Date(c.fecha_registro) : null,
      email: c.email,
    }));
  console.log("Clientes cargados:", clients);
}

export function getClients() {
  return clients;
}

export function getClientById(id) {
  return clients.find((c) => c.id === id);
}

export function getClientsByCity(city) {
  return clients.filter((c) => c.ciudad?.toLowerCase() === city.toLowerCase());
}

export function getClientsSortedByAge() {
  return [...clients].sort((a, b) => b.fecha_nacimiento - a.fecha_nacimiento);
}

export function getClientsByAgeRange(ageMin, ageMax) {
  return clients.filter((c) => {
    if (!c.fecha_nacimiento) return false;
    const birth = new Date(c.fecha_nacimiento);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      years--;
    }
    if (ageMin && years < Number(ageMin)) return false;
    if (ageMax && years > Number(ageMax)) return false;
    return true;
  });
}
