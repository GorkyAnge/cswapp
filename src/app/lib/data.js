let clients = [];

export function setClients(newClients) {
  clients = newClients
    .filter((c) => c.id && c.name && c.city && c.age) // descarta registros incompletos
    .map((c) => ({
      id: c.id,
      name: c.name,
      city: c.city,
      age: parseInt(c.age, 10),
    }));
  console.log("Clientes cargados:", clients); // útil para depurar
}

export function getClients() {
  return clients;
}

export function getClientById(id) {
  return clients.find((c) => c.id === id);
}

export function getClientsByCity(city) {
  return clients.filter((c) => c.city?.toLowerCase() === city.toLowerCase());
}

export function getClientsSortedByAge() {
  return [...clients].sort((a, b) => b.age - a.age);
}
