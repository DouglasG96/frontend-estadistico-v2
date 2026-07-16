import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';

// Mock the auth service
vi.mock('../services/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  getToken: vi.fn(() => null),
  getUser: vi.fn(() => null),
  isAuthenticated: vi.fn(() => false),
}));

function renderWithProviders(ui) {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <MemoryRouter>
          {ui}
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

describe('Login Page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders login form', () => {
    renderWithProviders(<Login />);

    expect(screen.getByPlaceholderText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('shows error on empty submit', async () => {
    renderWithProviders(<Login />);

    const button = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/por favor ingrese usuario y contraseña/i)).toBeInTheDocument();
    });
  });
});

describe('Theme Context', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('applies dark mode from localStorage', () => {
    localStorage.setItem('theme', 'dark');

    renderWithProviders(<div>Test</div>);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('defaults to light mode', () => {
    renderWithProviders(<div>Test</div>);

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});