import { locationService } from '../../src/services/location';
import type { Context } from '../../src/types';

const mockFindAll = jest.fn();
const mockFindOne = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDestroy = jest.fn();
const mockTransaction = jest.fn();
const mockCommit = jest.fn();
const mockRollback = jest.fn();
const mockAddLocation = jest.fn();

const service = locationService();

jest.mock('../models/location', () => ({
  Location: {
    findAll: mockFindAll,
    findOne: mockFindOne,
    create: mockCreate,
    update: mockUpdate,
    destroy: mockDestroy
  }
}));

jest.mock('../models/sequelize', () => ({
  transaction: () => ({
    commit: mockCommit,
    rollback: mockRollback
  })
}));

describe('locationService', () => {
  let service: ReturnType<typeof locationService>;
  let context: Context;

  beforeEach(() => {
    context = {
      models: {
        Location: {
          findAll: mockFindAll,
          findOne: mockFindOne
        },
        sequelize: {
          transaction: async () => ({
            commit: async () => { },
            rollback: async () => { }
          })
        }
      }
    } as unknown as Context;

    service = locationService();
  });

  describe('getLocations', () => {
    it('should return an array of locations', async () => {
      mockFindAll.mockResolvedValue([{ id: 1, name: 'Test Location' }]);
      const tenantId = 1;
      const locations = await service.getLocations(context, tenantId);

      expect(locations).toEqual([{ id: 1, name: 'Test Location' }]);
      expect(mockFindAll).toHaveBeenCalledWith({
        attributes: ["id", "name", "country", "region", "city", "address", "zipCode", "status", "notes"],
        where: { tenantId }
      });
    });
  });
});