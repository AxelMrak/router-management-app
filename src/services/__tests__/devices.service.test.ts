import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as routerService from '@/services/router.service';

// Mock the router.service module before importing devices.service
vi.mock('@/services/router.service', () => ({
  jsonRpcCall: vi.fn(),
  createRouterClient: vi.fn(() => ({})),
}));

// Import devices.service after mocking
const { getDevices, blockDevice, setDeviceSchedule } = await import('../devices.service');

describe('devices.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDevices', () => {
    it('should call jsonRpcCall with correct service/method', async () => {
      const mockResult = {
        success: true as const,
        data: {
          devices: [
            { mac: 'AA:BB:CC:DD:EE:01', ip: '192.168.1.10', hostname: 'Device1', online: true },
          ],
        },
      };
      vi.mocked(routerService.jsonRpcCall).mockResolvedValueOnce(mockResult);

      const result = await getDevices('test-token');

      expect(routerService.jsonRpcCall).toHaveBeenCalledWith(
        expect.any(Object),
        'test-token',
        'devices_app',
        'FwBase_get',
        { action: 'dump' }
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toEqual({
          mac: 'AA:BB:CC:DD:EE:01',
          ip: '192.168.1.10',
          hostname: 'Device1',
          status: 'online',
          blocked: false,
        });
      }
    });

    it('should normalize device fields correctly', async () => {
      const mockResult = {
        success: true as const,
        data: {
          devices: [
            {
              mac: 'aa:bb:cc:dd:ee:02',
              ip: '192.168.1.11',
              hostname: '',
              online: 1,
              blocked: 0,
              band: '2.4g',
            },
          ],
        },
      };
      vi.mocked(routerService.jsonRpcCall).mockResolvedValueOnce(mockResult);

      const result = await getDevices('test-token');

      expect(result.success).toBe(true);
      if (result.success) {
        const device = result.data[0];
        expect(device.mac).toBe('AA:BB:CC:DD:EE:02'); // uppercase
        expect(device.hostname).toBe('Unknown'); // empty -> Unknown
        expect(device.status).toBe('online'); // 1 -> online
        expect(device.blocked).toBe(false); // 0 -> false
        expect(device.band).toBe('2.4g');
      }
    });

    it('should handle empty devices list', async () => {
      const mockResult = {
        success: true as const,
        data: { devices: [] },
      };
      vi.mocked(routerService.jsonRpcCall).mockResolvedValueOnce(mockResult);

      const result = await getDevices('test-token');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    it('should propagate errors from jsonRpcCall', async () => {
      const mockError = {
        success: false as const,
        error: { message: 'Access denied', code: -1 },
      };
      vi.mocked(routerService.jsonRpcCall).mockResolvedValueOnce(mockError);

      const result = await getDevices('test-token');

      expect(result).toEqual(mockError);
    });

    it('should handle missing devices property in response', async () => {
      const mockResult = {
        success: true as const,
        data: {},
      };
      vi.mocked(routerService.jsonRpcCall).mockResolvedValueOnce(mockResult);

      const result = await getDevices('test-token');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });
  });

  describe('blockDevice', () => {
    it('should pass token and MAC address for blocking', async () => {
      const mockResult = { success: true as const, data: {} };
      vi.mocked(routerService.jsonRpcCall).mockResolvedValueOnce(mockResult);

      const result = await blockDevice('test-token', 'AA:BB:CC:DD:EE:01', true);

      expect(routerService.jsonRpcCall).toHaveBeenCalledWith(
        expect.any(Object),
        'test-token',
        'devices_app',
        'FwBase_set',
        { action: 'block', mac: 'AA:BB:CC:DD:EE:01' }
      );
      expect(result).toEqual(mockResult);
    });

    it('should pass unblock action when blocked is false', async () => {
      const mockResult = { success: true as const, data: {} };
      vi.mocked(routerService.jsonRpcCall).mockResolvedValueOnce(mockResult);

      await blockDevice('test-token', 'AA:BB:CC:DD:EE:01', false);

      expect(routerService.jsonRpcCall).toHaveBeenCalledWith(
        expect.any(Object),
        'test-token',
        'devices_app',
        'FwBase_set',
        { action: 'unblock', mac: 'AA:BB:CC:DD:EE:01' }
      );
    });
  });

  describe('setDeviceSchedule', () => {
    it('should set schedule with given ID', async () => {
      const mockResult = { success: true as const, data: {} };
      vi.mocked(routerService.jsonRpcCall).mockResolvedValueOnce(mockResult);

      await setDeviceSchedule('test-token', 'AA:BB:CC:DD:EE:01', 'schedule-1');

      expect(routerService.jsonRpcCall).toHaveBeenCalledWith(
        expect.any(Object),
        'test-token',
        'devices_app',
        'FwBase_set',
        { action: 'set_schedule', mac: 'AA:BB:CC:DD:EE:01', schedule: 'schedule-1' }
      );
    });

    it('should clear schedule when scheduleId is null', async () => {
      const mockResult = { success: true as const, data: {} };
      vi.mocked(routerService.jsonRpcCall).mockResolvedValueOnce(mockResult);

      await setDeviceSchedule('test-token', 'AA:BB:CC:DD:EE:01', null);

      expect(routerService.jsonRpcCall).toHaveBeenCalledWith(
        expect.any(Object),
        'test-token',
        'devices_app',
        'FwBase_set',
        { action: 'set_schedule', mac: 'AA:BB:CC:DD:EE:01', schedule: '' }
      );
    });
  });
});
