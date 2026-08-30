import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to authenticate. Check your configuration.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center items-center p-6 relative font-sans">
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/40 hover:text-white transition-colors group z-20">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium text-sm">Back</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-[400px] relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 text-xl font-medium tracking-tight text-white">
            <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain rounded-xl overflow-hidden" />
            <span>JobsForHire<span className="text-[#4642ff]">*</span></span>
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 shadow-sm">
          
          <div className="mb-8">
            <h1 className="text-2xl font-medium tracking-tight mb-1">{isLogin ? 'Welcome back' : 'Create an account'}</h1>
            <p className="text-white/50 text-sm">{isLogin ? 'Enter your details to access your account.' : 'Join to find your perfect role.'}</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/80">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Jane Doe" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/80">Email</label>
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/80">Password</label>
                {isLogin && (
                  <a href="#" className="text-xs text-white/50 hover:text-white transition-colors">Forgot password?</a>
                )}
              </div>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all"
                required
                minLength={6}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black text-sm font-medium rounded-lg py-2.5 mt-2 hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Log in' : 'Sign up')}
            </button>
          </form>

          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#111111] px-3 text-white/40">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button" 
              onClick={async () => {
                try {
                  setError("");
                  await loginWithGoogle();
                  navigate("/");
                } catch (err: any) {
                  setError(err.message || "Failed to authenticate with Google.");
                }
              }}
              className="flex items-center justify-center gap-2 bg-transparent border border-white/10 hover:bg-white/5 rounded-lg py-2.5 transition-colors text-sm font-medium text-white/80"
            >
              Google
            </button>
            <button type="button" className="flex items-center justify-center gap-2 bg-transparent border border-white/10 hover:bg-white/5 rounded-lg py-2.5 transition-colors text-sm font-medium text-white/80">
              Github
            </button>
          </div>
          
        </div>

        <p className="text-center mt-6 text-sm text-white/40">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }} 
            className="text-white font-medium hover:underline decoration-white/30 underline-offset-4"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>

      </motion.div>
    </div>
  );
}
