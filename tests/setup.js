import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock window.ethereum for Web3 tests
global.window = global.window || {};
global.window.ethereum = {
  request: jest.fn().mockImplementation(({ method, params }) => {
    switch (method) {
      case 'eth_requestAccounts':
        return Promise.resolve(['0x1234567890123456789012345678901234567890']);
      case 'eth_accounts':
        return Promise.resolve(['0x1234567890123456789012345678901234567890']);
      case 'eth_chainId':
        return Promise.resolve('0x38'); // BSC Mainnet
      case 'personal_sign':
        return Promise.resolve('0xmockedsignature');
      case 'wallet_switchEthereumChain':
        return Promise.resolve(null);
      case 'wallet_addEthereumChain':
        return Promise.resolve(null);
      default:
        return Promise.resolve(null);
    }
  }),
  on: jest.fn(),
  removeListener: jest.fn(),
  isMetaMask: true,
  selectedAddress: '0x1234567890123456789012345678901234567890',
  chainId: '0x38',
};

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock crypto for wallet tests
global.crypto = {
  getRandomValues: (arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  },
  subtle: {
    digest: jest.fn(),
  },
  randomUUID: () => '00000000-0000-0000-0000-000000000000',
};

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue(''),
  },
});

// Mock fetch for API calls
global.fetch = jest.fn().mockImplementation((url) => {
  if (url.includes('/api/private-sale/purchase')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        purchaseId: 'test-purchase-123',
        transactionHash: '0xtesthash',
      }),
    });
  }
  if (url.includes('/api/private-sale/stats')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        currentAmount: 500000,
      }),
    });
  }
  if (url.includes('/api/private-sale/purchases')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        purchases: [],
      }),
    });
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
});

// Suppress console errors/warnings in tests (but keep log for debugging)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
