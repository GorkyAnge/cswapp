import fs from 'fs';
import path from 'path';

// Determine if running in production environment
const isProduction = process.env.NODE_ENV === 'production';
// Use memory for tests, file storage for development/production
let clients = [];
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'clients.json');

// Initialize data directory if it doesn't exist
try {
  if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
    fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
  }
  if (fs.existsSync(DATA_FILE_PATH)) {
    const data = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    clients = JSON.parse(data);
  }
} catch (error) {
  console.error('Error initializing data storage:', error);
}

// Helper to save clients to file
function saveClientsToFile(clientsData) {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(clientsData, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving clients data to file:', error);
  }
}

export function setClients(newClients) {
  const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
  clients = newClients
    .filter((c) => {
      if (!c.id || !c.nombres || !c.apellidos || !c.ciudad || !c.email)
        return false;
      // Validar formato de fecha_nacimiento si existe
      if (
        c.fecha_nacimiento &&
        typeof c.fecha_nacimiento === "string" &&
        !dateRegex.test(c.fecha_nacimiento)
      )
        return false;
      // Validar formato de fecha_registro si existe
      if (
        c.fecha_registro &&
        typeof c.fecha_registro === "string" &&
        !dateRegex.test(c.fecha_registro)
      )
        return false;
      return true;
    })
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
  
  // Also save to file for persistence
  saveClientsToFile(clients);
  console.log("Clientes cargados:", clients);
}

export function getClients() {
  // For production, always try to reload from file to get latest data
  if (isProduction) {
    try {
      if (fs.existsSync(DATA_FILE_PATH)) {
        const data = fs.readFileSync(DATA_FILE_PATH, 'utf8');
        clients = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading clients data from file:', error);
    }
  }
  return clients;
}

export function getClientById(id) {
  return getClients().find((c) => c.id === id);
}

export function getClientsByCity(city) {
  return getClients().filter((c) => c.ciudad?.toLowerCase() === city.toLowerCase());
}

export function getClientsSortedByAge() {
  return [...getClients()].sort((a, b) => b.fecha_nacimiento - a.fecha_nacimiento);
}

export function getClientsByAgeRange(ageMin, ageMax) {
  return getClients().filter((c) => {
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
