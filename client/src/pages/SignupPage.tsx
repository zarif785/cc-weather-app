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

const STRENGTH_LABELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];

function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const signup = useAuthStore((s) => s.signup);
  const navigate = useNavigate();

  // Live password checks
  const hasLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isValid = hasLength && hasLetter && hasNumber;
  const passwordsMatch = password === confirm;

  // Strength score 0–4: length, letters, numbers, symbols
  const strengthScore = [
    hasLength,
    hasLetter,
    hasNumber,
    /[^a-zA-Z0-9]/.test(password),
  ].filter(Boolean).length;

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError('');
    if (!isValid) {
      setError('Password must be 8+ characters with letters and numbers');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }
    try {
      await signup(username, password);
      navigate('/');
    } catch {
      setError('Username already taken');
    }
  }

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-sm"
      >
        <motion.h1
          variants={item}
          className="text-center font-display text-6xl font-light italic leading-none text-ink"
        >
          Weather
        </motion.h1>

        <motion.div variants={item} className="mx-auto mt-5 h-px w-full bg-rule" />

        <motion.p variants={item} className="mt-5 text-center text-sm text-ink-soft">
          Create an account.
        </motion.p>

        <motion.form
          variants={item}
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-6"
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="signup-username"
              className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-soft"
            >
              Username
            </label>
            <input
              id="signup-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-0 border-b border-rule bg-transparent pb-1 font-display text-lg text-ink outline-none transition-colors focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="signup-password"
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
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-0 border-b border-rule bg-transparent pb-1 font-display text-lg text-ink outline-none transition-colors focus:border-accent"
            />

            {password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={`h-0.5 flex-1 transition-colors ${
                        i < strengthScore ? 'bg-ink' : 'bg-rule'
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-[0.7rem] uppercase tracking-[0.2em] text-ink-soft">
                  {STRENGTH_LABELS[strengthScore]}
                </p>
              </div>
            )}

            <ul className="mt-2 flex flex-col gap-1">
              <li className="flex items-center gap-2 text-xs">
                <span
                  className={`h-1.5 w-1.5 ${hasLength ? 'bg-accent' : 'bg-rule'}`}
                />
                <span className={hasLength ? 'text-ink' : 'text-ink-soft'}>
                  At least 8 characters
                </span>
              </li>
              <li className="flex items-center gap-2 text-xs">
                <span
                  className={`h-1.5 w-1.5 ${
                    hasLetter && hasNumber ? 'bg-accent' : 'bg-rule'
                  }`}
                />
                <span
                  className={hasLetter && hasNumber ? 'text-ink' : 'text-ink-soft'}
                >
                  Letters and numbers
                </span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="signup-confirm"
              className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-soft"
            >
              Confirm password
            </label>
            <input
              id="signup-confirm"
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="border-0 border-b border-rule bg-transparent pb-1 font-display text-lg text-ink outline-none transition-colors focus:border-accent"
            />
            {confirm && !passwordsMatch && (
              <p className="mt-1 text-xs italic text-accent">
                Passwords do not match
              </p>
            )}
          </div>

          {error && <p className="text-sm italic text-accent">{error}</p>}

          <button
            type="submit"
            className="mt-2 border border-ink bg-ink py-3 text-xs uppercase tracking-[0.25em] text-paper transition-colors hover:border-accent hover:bg-accent"
          >
            Sign up
          </button>
        </motion.form>

        <motion.p variants={item} className="mt-8 text-center text-sm text-ink-soft">
          Have an account?{' '}
          <Link
            to="/login"
            className="text-accent underline underline-offset-4 hover:opacity-70"
          >
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}

export default SignupPage;
