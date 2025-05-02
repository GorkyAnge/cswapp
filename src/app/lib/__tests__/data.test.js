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
      fecha_nacimiento: '01/01/2000',
      ciudad: 'Quito',
      fecha_registro: '01/01/2023',
      email: 'john@example.com',
    },
    {
      id: '2',
      nombres: 'Jane',
      apellidos: 'Smith',
      fecha_nacimiento: '05/10/1990',
      ciudad: 'Guayaquil',
      fecha_registro: '02/01/2023',
      email: 'jane@example.com',
    },
    {
      id: '3',
      nombres: 'Ana',
      apellidos: 'Perez',
      fecha_nacimiento: '07/15/2010',
      ciudad: 'Quito',
      fecha_registro: '03/01/2023',
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

  test('setClients validates date format', () => {
    const invalidDateClients = [
      {
        id: '5',
        nombres: 'Invalid',
        apellidos: 'Date',
        fecha_nacimiento: '2000-01-01', // Invalid format (should be MM/DD/YYYY)
        ciudad: 'Test',
        fecha_registro: '01/01/2023',
        email: 'test@example.com',
      },
      {
        id: '6',
        nombres: 'Valid',
        apellidos: 'Client',
        fecha_nacimiento: '05/15/1995', // Valid format
        ciudad: 'Test',
        fecha_registro: '05/20/2022',
        email: 'valid@example.com',
      }
    ];
    
    setClients(invalidDateClients);
    const clients = getClients();
    
    // Only the valid client should be included
    expect(clients.length).toBe(1);
    expect(clients[0].id).toBe('6');
  });

  test('setClients handles missing optional date fields', () => {
    const partialDateClients = [
      {
        id: '7',
        nombres: 'No',
        apellidos: 'Birthdate',
        // fecha_nacimiento omitted
        ciudad: 'Test',
        fecha_registro: '06/01/2023',
        email: 'nobirth@example.com',
      },
      {
        id: '8',
        nombres: 'No',
        apellidos: 'Regdate',
        fecha_nacimiento: '10/10/2000',
        ciudad: 'Test',
        // fecha_registro omitted
        email: 'noreg@example.com',
      }
    ];
    
    setClients(partialDateClients);
    const clients = getClients();
    
    expect(clients.length).toBe(2);
    expect(clients[0].fecha_nacimiento).toBeNull();
    expect(clients[1].fecha_registro).toBeNull();
  });

  test('getClientById returns correct client', () => {
    expect(getClientById('2').nombres).toBe('Jane');
    expect(getClientById('999')).toBeUndefined();
  });

  test('getClientsByCity returns clients by city (case-insensitive)', () => {
    const quitoClients = getClientsByCity('quito');
    expect(quitoClients.length).toBe(2);
    expect(quitoClients[0].ciudad.toLowerCase()).toBe('quito');
    expect(quitoClients.map(c => c.id)).toContain('1');
    expect(quitoClients.map(c => c.id)).toContain('3');
  });

  test('getClientsSortedByAge sorts by fecha_nacimiento descending', () => {
    const sorted = getClientsSortedByAge();
    expect(sorted[0].id).toBe('3'); // Youngest (born 2010)
    expect(sorted[1].id).toBe('1'); // Middle (born 2000)
    expect(sorted[2].id).toBe('2'); // Oldest (born 1990)
  });

  test('getClientsByAgeRange filters by age', () => {
    // Mock the current date to May 1, 2025 for consistent age calculations
    const originalDate = Date;
    global.Date = class extends Date {
      constructor(...args) {
        if (args.length === 0) {
          return new originalDate(2025, 4, 1); // May 1, 2025 (month is 0-indexed)
        }
        return new originalDate(...args);
      }
    };
    
    try {
      // Jane is ~34-35, John is ~25, Ana is ~14-15 (as of 2025)
      const age20to30 = getClientsByAgeRange('20', '30');
      const age30to40 = getClientsByAgeRange('30', '40');
      const age10to15 = getClientsByAgeRange('10', '15');
      
      expect(age20to30.map(c => c.id)).toContain('1');
      expect(age20to30.map(c => c.id)).not.toContain('2'); // Jane is older than 30
      expect(age30to40.map(c => c.id)).toContain('2');
      expect(age10to15.map(c => c.id)).toContain('3');
      expect(getClientsByAgeRange('100', '200')).toEqual([]);
    } finally {
      global.Date = originalDate; // Restore original Date
    }
  });
  
  test('getClientsByAgeRange handles only min or max age', () => {
    // Mock the current date to May 1, 2025 for consistent age calculations
    const originalDate = Date;
    global.Date = class extends Date {
      constructor(...args) {
        if (args.length === 0) {
          return new originalDate(2025, 4, 1); // May 1, 2025 (month is 0-indexed)
        }
        return new originalDate(...args);
      }
    };
    
    try {
      const olderThan20 = getClientsByAgeRange('20', null);
      const youngerThan20 = getClientsByAgeRange(null, '20');
      
      expect(olderThan20.length).toBe(2); // John and Jane are older than 20
      expect(youngerThan20.length).toBe(1); // Ana is younger than 20
      expect(olderThan20.map(c => c.id)).not.toContain('3');
      expect(youngerThan20.map(c => c.id)).toContain('3');
    } finally {
      global.Date = originalDate; // Restore original Date
    }
  });
});
