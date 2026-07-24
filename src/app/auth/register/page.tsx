"use client";

import { useForm, FieldValues } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: FieldValues) => {
    try {
      setLoading(true);
      setError("");
      await axios.post("/api/auth/register", data);
      router.push("/auth/login");
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:flex-none lg:w-1/2 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-xl leading-none">CA</span>
            </div>
            <h2 className="font-headline text-2xl font-bold text-on-surface tracking-tight">Career Architect</h2>
          </Link>

          <div>
            <h2 className="text-3xl font-headline font-bold text-on-surface tracking-tight">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant font-body">
              Join to start building your AI-powered resume.
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-error/10 text-error p-3 rounded-lg text-sm font-medium border border-error/20">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-on-surface">
                    Full Name
                  </label>
                  <div className="mt-2">
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      {...register("name", { required: true })}
                      className="block w-full rounded-xl border-0 py-3 px-4 text-on-surface shadow-sm ring-1 ring-inset ring-outline-variant placeholder:text-outline focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm bg-white outline-none transition-all"
                      placeholder="Jane Doe"
                    />
                    {errors.name && <span className="text-error text-xs mt-1 block">Name is required</span>}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-on-surface">
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...register("email", { required: true })}
                      className="block w-full rounded-xl border-0 py-3 px-4 text-on-surface shadow-sm ring-1 ring-inset ring-outline-variant placeholder:text-outline focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm bg-white outline-none transition-all"
                      placeholder="you@company.com"
                    />
                    {errors.email && <span className="text-error text-xs mt-1 block">Email is required</span>}
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-on-surface">
                    Password
                  </label>
                  <div className="mt-2">
                    <input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      {...register("password", { required: true, minLength: 6 })}
                      className="block w-full rounded-xl border-0 py-3 px-4 text-on-surface shadow-sm ring-1 ring-inset ring-outline-variant placeholder:text-outline focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm bg-white outline-none transition-all"
                      placeholder="••••••••"
                    />
                    {errors.password && <span className="text-error text-xs mt-1 block">Password must be at least 6 characters</span>}
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center items-center gap-2 rounded-xl bg-primary px-3 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70 transition-all active:scale-[0.98]"
                >
                  {loading ? "Creating account..." : "Sign up"}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </div>
            </form>
          </div>

          <p className="mt-10 text-center text-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold leading-6 text-primary hover:text-primary-fixed-variant">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 relative bg-surface-container-low border-l border-outline-variant/30 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-multiply"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 blur-[100px] rounded-full"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-container/50 blur-[100px] rounded-full"></div>
        
        <div className="relative z-10 max-w-lg px-8 text-center">
          <div className="mb-8 flex justify-center">
            <div className="bg-white/60 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white inline-flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h2 className="text-4xl font-headline font-bold tracking-tight text-on-surface mb-6">
            Build a resume that stands out.
          </h2>
          <p className="text-lg text-on-surface-variant font-body leading-relaxed">
            Our AI understands exactly what recruiters are looking for. We'll help you craft the perfect profile in minutes.
          </p>
        </div>
      </div>
    </div>
  );
}