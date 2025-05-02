// Unit tests for route.js (API handlers)
import * as data from '../../lib/data';
import { POST, GET } from '../route';

jest.mock('../../lib/data');
const mockJson = jest.fn((body, opts) => ({ body, ...opts }));
jest.mock('next/server', () => ({ NextResponse: { json: mockJson } }));

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
      expect(mockJson).toHaveBeenCalledWith({ error: 'Not found' }, { status: 404 });
    });

    it('returns clients by city', async () => {
      data.getClientsByCity.mockReturnValue([{ id: '2' }]);
      const req = makeRequest({ city: 'Quito' });
      await GET(req);
      expect(data.getClientsByCity).toHaveBeenCalledWith('Quito');
      expect(mockJson).toHaveBeenCalledWith([{ id: '2' }]);
    });

    it('returns clients sorted by age', async () => {
      data.getClientsSortedByAge.mockReturnValue([{ id: '3' }]);
      const req = makeRequest({ sort: 'age' });
      await GET(req);
      expect(data.getClientsSortedByAge).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith([{ id: '3' }]);
    });

    it('returns clients by age range', async () => {
      data.getClientsByAgeRange.mockReturnValue([{ id: '4' }]);
      const req = makeRequest({ ageMin: '20', ageMax: '30' });
      await GET(req);
      expect(data.getClientsByAgeRange).toHaveBeenCalledWith('20', '30');
      expect(mockJson).toHaveBeenCalledWith([{ id: '4' }]);
    });

    it('returns all clients by default', async () => {
      data.getClients.mockReturnValue([{ id: '5' }]);
      const req = makeRequest();
      await GET(req);
      expect(data.getClients).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith([{ id: '5' }]);
    });
  });
});
