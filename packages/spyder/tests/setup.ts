import { vi } from 'vitest';

// Shared mock implementation for axios — returns an object with get/post/request creating resolved { data: {} }
const mockAxios = {
  get: vi.fn(async () => ({ data: {} })),
  post: vi.fn(async () => ({ data: {} })),
  request: vi.fn(async () => ({ data: {} })),
  create: () => mockAxios,
};

// Register the mock for Vitest
vi.mock('axios', () => ({ default: mockAxios, ...mockAxios, __esModule: true }));

export default mockAxios;
