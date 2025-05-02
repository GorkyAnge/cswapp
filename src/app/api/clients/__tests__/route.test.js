// Unit tests for route.js (API handlers)

import * as data from '../../../lib/data';
import { POST, GET } from '../route';

// Define the mock before jest.mock is called
const mockJson = jest.fn((body, opts) => ({ body, ...opts }));

// Mock next/server and inject mockJson
jest.mock('next/server', () => ({
  NextResponse: {
    json: (...args) => mockJson(...args),
  },
}));

// Mock the data module
jest.mock('../../../lib/data');

describe('api/clients/route.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('calls setClients with mapped data and returns ok', async () => {
      const body = [
        { id: '1', nombres: 'A', apellidos: 'B', fecha_nacimiento: '2000-01-01', ciudad: 'X', fecha_registro: '2020-01-01', email: 'a@b.com' },
      ];
      const request = { json: jest.fn().mockResolvedValue(body) };
      const res = await POST(request);
      expect(data.setClients).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: '1', nombres: 'A', apellidos: 'B', ciudad: 'X', email: 'a@b.com' })
        ])
      );
      expect(mockJson).toHaveBeenCalledWith({ ok: true });
      expect(res.body.ok).toBe(true);
    });
  });

  describe('GET', () => {
    const makeRequest = (params = {}) => {
      const url = new URL('http://localhost');
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
      return { url: url.toString() };
    };

    it('returns client by id', async () => {
      data.getClientById.mockReturnValue({ id: '1' });
      const req = makeRequest({ id: '1' });
      await GET(req);
      expect(data.getClientById).toHaveBeenCalledWith('1');
      expect(mockJson).toHaveBeenCalledWith({ id: '1' }, { status: 200 });
    });

    it('returns 404 if client not found', async () => {
      data.getClientById.mockReturnValue(undefined);
      const req = makeRequest({ id: '999' });
      await GET(req);
      expect(mockJson).toHaveBeenCalledWith({}, { status: 404 });
    });

    it('returns clients by city with pagination', async () => {
      const cityClients = [{ id: '2' }, { id: '5' }];
      data.getClientsByCity.mockReturnValue(cityClients);
      const req = makeRequest({ city: 'Quito' });
      await GET(req);
      expect(data.getClientsByCity).toHaveBeenCalledWith('Quito');
      expect(mockJson).toHaveBeenCalledWith({
        data: cityClients,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      });
    });

    it('returns clients sorted by age with pagination', async () => {
      const sortedClients = [{ id: '3' }, { id: '1' }, { id: '4' }];
      data.getClientsSortedByAge.mockReturnValue(sortedClients);
      const req = makeRequest({ sort: 'age' });
      await GET(req);
      expect(data.getClientsSortedByAge).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        data: sortedClients,
        total: 3,
        page: 1,
        pageSize: 10,
        totalPages: 1
      });
    });

    it('returns clients by age range with pagination', async () => {
      const filteredClients = [{ id: '4' }, { id: '7' }];
      data.getClientsByAgeRange.mockReturnValue(filteredClients);
      const req = makeRequest({ ageMin: '20', ageMax: '30' });
      await GET(req);
      expect(data.getClientsByAgeRange).toHaveBeenCalledWith('20', '30');
      expect(mockJson).toHaveBeenCalledWith({
        data: filteredClients,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      });
    });

    it('returns all clients with pagination by default', async () => {
      const allClients = [{ id: '1' }, { id: '2' }, { id: '3' }];
      data.getClients.mockReturnValue(allClients);
      const req = makeRequest();
      await GET(req);
      expect(data.getClients).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        data: allClients,
        total: 3,
        page: 1,
        pageSize: 10,
        totalPages: 1
      });
    });

    it('handles custom pagination parameters', async () => {
      const allClients = Array.from({ length: 25 }, (_, i) => ({ id: String(i + 1) }));
      data.getClients.mockReturnValue(allClients);
      const req = makeRequest({ page: '2', pageSize: '5' });
      await GET(req);
      expect(mockJson).toHaveBeenCalledWith({
        data: allClients.slice(5, 10),
        total: 25,
        page: 2,
        pageSize: 5,
        totalPages: 5
      });
    });
  });
});
