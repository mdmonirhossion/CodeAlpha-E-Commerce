import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  const { login, loginWithGoogle, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  // If user is already logged in, redirect them
  useEffect(() => {
    if (user) {
      navigate(redirect);
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await login(email, password);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setErrorMsg(err.message || 'Google Sign-In failed.');
      setLoading(false);
    }
  };

  return (
    <div className="py-12 flex items-center justify-center min-h-[70vh]">
      <div className="card w-full max-w-md bg-base-100 border border-base-200 shadow-xl p-8 rounded-3xl space-y-6">
        {/* Brand/Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="text-3xl font-black tracking-tight text-primary">
            E<span className="text-secondary font-light">SHOP</span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
          <p className="text-gray-400 text-sm">Please sign in to continue shopping.</p>
        </div>

        {errorMsg && (
          <div className="alert alert-error text-sm rounded-xl py-2 px-3">
            <span className="break-all">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold text-xs uppercase text-gray-400">Email Address</span>
            </label>
            <input
              type="email"
              placeholder="user@example.com"
              className="input input-bordered rounded-xl w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold text-xs uppercase text-gray-400">Password</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="input input-bordered rounded-xl w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full rounded-full h-11 text-white font-bold tracking-wide mt-2"
          >
            {loading ? <span className="loading loading-spinner"></span> : 'Login'}
          </button>
        </form>

        <div className="divider text-xs text-gray-400 font-bold uppercase">or</div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="btn btn-outline btn-base-content w-full rounded-full h-11 gap-2.5 font-bold tracking-wide hover:bg-base-200"
        >
          <FcGoogle className="text-xl" /> Sign in with Google
        </button>

        <div className="text-center text-sm text-gray-500 pt-2 border-t border-base-200">
          Don't have an account?{' '}
          <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-primary font-bold hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
