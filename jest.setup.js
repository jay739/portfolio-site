// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure React Testing Library
configure({
  asyncUtilTimeout: 5000,
  defaultHidden: true,
});

// Mock next/router (pages router)
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {},
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
      isFallback: false,
    };
  },
}));

// Mock next/navigation (app router)
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), prefetch: jest.fn() })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, prefetch, ...props }) => <a href={href} {...props}>{children}</a>,
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock framer-motion globally — avoids matchMedia/IntersectionObserver issues in jsdom
const React = require('react');
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_target, tag) => {
      const tagName = typeof tag === 'string' ? tag : 'div';
      return React.forwardRef(
        ({ children, initial, animate, exit, variants, transition,
           whileHover, whileTap, whileInView, viewport, layoutId, ...rest }, ref) =>
          React.createElement(tagName, { ...rest, ref }, children)
      );
    },
  }),
  AnimatePresence: ({ children }) => children,
  useReducedMotion: jest.fn(() => false),
  useAnimation: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
  useMotionValue: jest.fn((v) => ({ get: () => v, set: jest.fn() })),
  useTransform: jest.fn(() => ({ get: jest.fn() })),
}));

// Mock ResizeObserver — not available in jsdom; use a plain class so resetMocks doesn't clear it
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

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
