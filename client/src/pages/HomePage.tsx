import { motion, type Variants } from 'motion/react';
import { useAuthStore } from '../store/authStore';
import { useCityStore } from '../store/cityStore';
import { useSocket } from '../hooks/useSocket';
import CitySearch from '../components/CitySearch';
import WeatherCard from '../components/WeatherCard';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

function HomePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const unit = useCityStore((s) => s.unit);
  const setUnit = useCityStore((s) => s.setUnit);

  useSocket();

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="relative z-10 min-h-screen px-6 py-10">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto w-full max-w-2xl"
      >
        <motion.header
          variants={item}
          className="flex items-end justify-between border-b border-ink pb-4"
        >
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.3em] text-ink-soft">
              {today}
            </p>
            <h1 className="font-display text-4xl font-light text-ink">
              Weather
            </h1>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex border border-rule text-[0.7rem] uppercase tracking-[0.15em]">
              <button
                type="button"
                onClick={() => setUnit('C')}
                className={`px-2.5 py-1 transition-colors ${
                  unit === 'C' ? 'bg-ink text-paper' : 'text-ink-soft hover:text-accent'
                }`}
              >
                °C
              </button>
              <button
                type="button"
                onClick={() => setUnit('F')}
                className={`px-2.5 py-1 transition-colors ${
                  unit === 'F' ? 'bg-ink text-paper' : 'text-ink-soft hover:text-accent'
                }`}
              >
                °F
              </button>
            </div>

            <div className="text-right">
              <p className="text-xs text-ink-soft">{user?.username}</p>
              <button
                type="button"
                onClick={logout}
                className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-accent"
              >
                Sign out
              </button>
            </div>
          </div>
        </motion.header>

        <motion.div variants={item} className="mt-10">
          <CitySearch />
        </motion.div>

        <motion.div variants={item} className="mt-12">
          <WeatherCard />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default HomePage;
