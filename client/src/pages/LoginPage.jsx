import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { Coffee } from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';

const KELAS_INPUT =
  'w-full rounded-xl bg-latar px-4 py-3 ring-1 ring-garis outline-none focus:ring-2 focus:ring-jeruk-500';

export default function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tujuan = location.state?.from ?? '/kasir';

  if (status === 'authenticated') {
    return <Navigate to={tujuan} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(tujuan, { replace: true });
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-jeruk-500 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-white text-jeruk-500">
            <Coffee className="size-6" strokeWidth={2} />
          </span>
          <span className="text-xl font-extrabold tracking-tight">Kafe Senja</span>
        </div>

        <p className="max-w-md text-5xl leading-tight font-extrabold tracking-tight">
          Pesanan pertama hari ini sudah menunggu.
        </p>

        <div aria-hidden="true" className="absolute -right-24 -bottom-24 size-96 rounded-full bg-white/10" />
        <div aria-hidden="true" className="absolute top-1/3 -right-10 size-40 rounded-full bg-white/10" />
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="grid size-9 place-items-center rounded-full bg-jeruk-500 text-white">
              <Coffee className="size-5" strokeWidth={2} />
            </span>
            <span className="text-lg font-extrabold tracking-tight">Kafe Senja</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">Masuk</h1>
          <p className="mt-1 text-kopi-600">Gunakan akun yang diberikan pemilik kafe.</p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold">Email</span>
              <input
                type="email"
                autoComplete="username"
                autoFocus
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={KELAS_INPUT}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold">Password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={KELAS_INPUT}
              />
            </label>

            {error && (
              <p role="alert" className="rounded-xl bg-pastel-merah px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-jeruk-500 px-5 py-3 font-semibold text-white hover:bg-jeruk-600 disabled:opacity-60"
            >
              {isSubmitting ? 'Masuk…' : 'Masuk'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}