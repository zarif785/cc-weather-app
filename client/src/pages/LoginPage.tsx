import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, type Variants } from 'motion/react';
import { useAuthStore } from '../store/authStore';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch {
      setError('Invalid username or password');
    }
  }

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-sm"
      >
        <motion.h1
          variants={item}
          className="text-center font-display text-6xl font-light leading-none text-ink"
        >
          Weather
        </motion.h1>

        <motion.div variants={item} className="mx-auto mt-5 h-px w-full bg-rule" />

        <motion.p variants={item} className="mt-5 text-center text-sm text-ink-soft">
          Sign in to continue.
        </motion.p>

        <motion.form
          variants={item}
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-6"
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="login-username"
              className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-soft"
            >
              Username
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-0 border-b border-rule bg-transparent pb-1 font-display text-lg text-ink outline-none transition-colors focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-soft"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-accent"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-0 border-b border-rule bg-transparent pb-1 font-display text-lg text-ink outline-none transition-colors focus:border-accent"
            />
          </div>

          {error && <p className="text-sm text-accent">{error}</p>}

          <button
            type="submit"
            className="mt-2 border border-ink bg-ink py-3 text-xs uppercase tracking-[0.25em] text-paper transition-colors hover:border-accent hover:bg-accent"
          >
            Sign in
          </button>
        </motion.form>

        <motion.p variants={item} className="mt-8 text-center text-sm text-ink-soft">
          No account?{' '}
          <Link
            to="/signup"
            className="text-accent underline underline-offset-4 hover:opacity-70"
          >
            Sign up
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}

export default LoginPage;
