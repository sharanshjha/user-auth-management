import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState('register');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const modeConfig = useMemo(
    () => ({
      register: {
        title: 'Build your operator profile',
        subtitle: 'First signup becomes admin. Choose wisely, Commander.',
        button: 'Create account',
      },
      login: {
        title: 'Welcome back to command center',
        subtitle: 'Authenticate and continue running the user universe.',
        button: 'Log in',
      },
    }),
    [],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleModeSwitch = (nextMode) => {
    setMode(nextMode);
    setToast(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setToast(null);

    try {
      if (mode === 'register') {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
        });
      } else {
        await login({
          email: form.email,
          password: form.password,
        });
      }

      navigate('/app', { replace: true });
    } catch (error) {
      setToast({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell auth-shell">
      <section className="hero-card panel fade-up">
        <span className="badge">Future-ready auth stack</span>
        <h1>PulseAuth Console</h1>
        <p>
          Your original starter app has evolved into a modern control room with secure APIs,
          role-aware access, and a dashboard that looks like it time-traveled from 2030.
        </p>

        <div className="feature-grid">
          <article>
            <h3>Neon clean UI</h3>
            <p>Glass panels, kinetic gradients, and intentional motion without visual noise.</p>
          </article>
          <article>
            <h3>Production backend</h3>
            <p>JWT auth, security middleware, validation, structured errors, and role controls.</p>
          </article>
          <article>
            <h3>Admin console</h3>
            <p>Search users, edit roles, update records, and keep profile settings synced.</p>
          </article>
        </div>
      </section>

      <section className="auth-card panel fade-up delay-1">
        <div className="auth-toggle" role="tablist" aria-label="Choose auth mode">
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => handleModeSwitch('register')}
          >
            Register
          </button>
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => handleModeSwitch('login')}
          >
            Login
          </button>
        </div>

        <h2>{modeConfig[mode].title}</h2>
        <p className="auth-subtitle">{modeConfig[mode].subtitle}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' ? (
            <label>
              Name
              <input
                name="name"
                type="text"
                placeholder="Alicia Orbit"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </label>
          ) : null}

          <label>
            Email
            <input
              name="email"
              type="email"
              placeholder="you@future.dev"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              placeholder="At least 8 chars + number"
              value={form.password}
              onChange={handleChange}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              required
            />
          </label>

          <button type="submit" className="cta-button" disabled={loading}>
            {loading ? 'Working...' : modeConfig[mode].button}
          </button>
        </form>
      </section>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </main>
  );
};

export default AuthPage;
