// Unit tests for data.js
import {
  setClients,
  getClients,
  getClientById,
  getClientsByCity,
  getClientsSortedByAge,
  getClientsByAgeRange,
} from '../data';

describe('data.js business logic', () => {
  const mockClients = [
    {
      id: '1',
      nombres: 'John',
      apellidos: 'Doe',
      fecha_nacimiento: '2000-01-01',
      ciudad: 'Quito',
      fecha_registro: '2023-01-01',
      email: 'john@example.com',
    },
    {
      id: '2',
      nombres: 'Jane',
      apellidos: 'Smith',
      fecha_nacimiento: '1990-05-10',
      ciudad: 'Guayaquil',
      fecha_registro: '2023-02-01',
      email: 'jane@example.com',
    },
    {
      id: '3',
      nombres: 'Ana',
      apellidos: 'Perez',
      fecha_nacimiento: '2010-07-15',
      ciudad: 'Quito',
      fecha_registro: '2023-03-01',
      email: 'ana@example.com',
    },
    // Invalid client (should be filtered out)
    {
      id: '',
      nombres: '',
      apellidos: '',
      ciudad: '',
      email: '',
    },
  ];

  beforeEach(() => {
    setClients(mockClients);
  });

  test('setClients filters and maps clients correctly', () => {
    const clients = getClients();
    expect(clients.length).toBe(3);
    expect(clients[0]).toHaveProperty('id', '1');
    expect(clients[0].fecha_nacimiento).toBeInstanceOf(Date);
    expect(clients[0].fecha_registro).toBeInstanceOf(Date);
  });

  test('getClientById returns correct client', () => {
    expect(getClientById('2').nombres).toBe('Jane');
    expect(getClientById('999')).toBeUndefined();
  });

  test('getClientsByCity returns clients by city (case-insensitive)', () => {
    const quitoClients = getClientsByCity('quito');
    expect(quitoClients.length).toBe(2);
    expect(quitoClients[0].ciudad.toLowerCase()).toBe('quito');
  });

  test('getClientsSortedByAge sorts by fecha_nacimiento descending', () => {
    const sorted = getClientsSortedByAge();
    expect(sorted[0].id).toBe('3'); // Youngest
    expect(sorted[2].id).toBe('2'); // Oldest
  });

  test('getClientsByAgeRange filters by age', () => {
    // Jane is ~34, John is ~25, Ana is ~14 (as of 2025)
    expect(getClientsByAgeRange(20, 30).map(c => c.id)).toContain('1');
    expect(getClientsByAgeRange(30, 40).map(c => c.id)).toContain('2');
    expect(getClientsByAgeRange(10, 15).map(c => c.id)).toContain('3');
    expect(getClientsByAgeRange(100, 200)).toEqual([]);
  });
});
