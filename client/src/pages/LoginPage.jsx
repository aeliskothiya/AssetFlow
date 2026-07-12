import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { BuildingOffice2Icon, LockClosedIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      if (isLogin) {
        await login({ email: values.email, password: values.password });
        toast.success('Signed in successfully');
      } else {
        await signup(values);
        toast.success('Account created and signed in successfully');
      }
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || (isLogin ? 'Login failed' : 'Signup failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/40 shadow-2xl backdrop-blur xl:grid-cols-[1.05fr_0.95fr]">
        <div className="relative overflow-hidden bg-radial-grid px-8 py-12 md:px-12 md:py-16">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(79,209,197,0.08),transparent_45%,rgba(125,211,252,0.08))]" />
          <div className="relative z-10 flex h-full flex-col justify-between gap-12">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200 shadow-glow">
                <BuildingOffice2Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">AssetFlow</p>
                <p className="text-sm text-slate-300">Enterprise asset intelligence</p>
              </div>
            </div>

            <div className="max-w-xl">
              <p className="subtle-label">Department management</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight text-white md:text-6xl">
                Operate departments with precision and control.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-300 md:text-lg">
                Clean workflows, protected access, and a management interface built for teams that need visibility without clutter.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                'Protected by JWT',
                'RBAC enforced',
                'Audit-friendly changes',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-10 md:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-cyan-200">
                <LockClosedIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="subtle-label">{isLogin ? 'Secure sign in' : 'Join the platform'}</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">
                  {isLogin ? 'Access AssetFlow' : 'Create an Account'}
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
              {!isLogin && (
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Jane Doe"
                  error={errors.name?.message}
                  {...register('name', { required: !isLogin ? 'Name is required' : false })}
                />
              )}
              <Input
                label="Email"
                type="email"
                placeholder={isLogin ? "admin@assetflow.local" : "name@company.com"}
                error={errors.email?.message}
                {...register('email', { required: 'Email is required' })}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register('password', { required: 'Password is required' })}
              />
              <Button type="submit" className="w-full py-3" disabled={submitting}>
                {submitting ? (isLogin ? 'Signing in...' : 'Signing up...') : (isLogin ? 'Sign in' : 'Sign up')}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-cyan-400 hover:text-cyan-300"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
