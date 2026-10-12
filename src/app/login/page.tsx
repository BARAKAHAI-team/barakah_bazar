'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { clientStore } from '@/lib/store';
import { ShieldCheck, Truck, Gem, ArrowLeft, ArrowRight, Lock, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/';
  const { toast } = useToast();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);

  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && resendSeconds > 0) {
      timer = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    } else if (step === 'otp' && resendSeconds === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, resendSeconds]);

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || 'Failed to send OTP.');
      } else {
        setStep('otp');
        setResendSeconds(30);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '', '']);

        if (data.devOtp) {
          console.log('[DEV OTP]', data.devOtp);
          setDevOtpCode(String(data.devOtp));
        }
        toast('Verification code sent via SMS.', 'success');
        // Auto-focus first digit
        setTimeout(() => {
          digitInputRefs.current[0]?.focus();
        }, 100);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    // If pasted multiple digits
    if (clean.length > 1) {
      const pasteArray = clean.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasteArray.forEach((char, i) => {
        if (index + i < 6) newDigits[index + i] = char;
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(5, index + pasteArray.length);
      digitInputRefs.current[nextFocus]?.focus();
      return;
    }

    // Single digit
    const newDigits = [...otpDigits];
    newDigits[index] = clean[0];
    setOtpDigits(newDigits);

    // Auto advance
    if (index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    }
  };

  const fullOtp = otpDigits.join('');

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: fullOtp }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || 'Verification failed. Please try again.');
      } else {
        toast('Welcome back! Logged in successfully.', 'success');
        clientStore.setAuth(true, data.phone);

        // Check if new profile
        if (!data.profileCompleted) {
          router.push(`/login/profile?next=${encodeURIComponent(nextUrl)}`);
        } else {
          // Replay pending action if any
          const pending = sessionStorage.getItem('bz_pending_action');
          if (pending) {
            sessionStorage.removeItem('bz_pending_action');
            try {
              const act = JSON.parse(pending);
              if (act.type === 'cart') {
                await fetch('/api/cart/items', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ variantId: act.variantId, qty: act.qty }),
                });
                toast('Saved item added to your cart!', 'success');
              } else if (act.type === 'wishlist') {
                await fetch('/api/wishlist', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ productId: act.productId }),
                });
                toast('Item added to your wishlist!', 'success');
              }
            } catch {
              // ignore
            }
          }
          router.push(nextUrl);
        }
      }
    } catch {
      setError('Verification failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillDevOtp = () => {
    if (devOtpCode) {
      const digits = devOtpCode.slice(0, 6).split('');
      setOtpDigits(digits);
      toast('Demo OTP auto-filled!', 'info');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="max-w-md w-full bg-[var(--surface)] border border-[var(--line)] p-6 sm:p-8 rounded-[2px]">
        {/* Sign In Form */}
        <div className="flex flex-col justify-center">
          {step === 'phone' ? (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B1D2F] block mb-1">
                  Seamless Sign In
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 m-0">
                  Log in or Register
                </h1>
                <p className="text-xs text-stone-500 mt-2">
                  Enter your 10-digit Indian mobile number to receive a secure 6-digit OTP via SMS.
                </p>
              </div>

              <form onSubmit={handleRequestOtp} className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="phone-input" className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Mobile Number
                  </label>
                  <div className="flex rounded-[2px] border border-[var(--line)] focus-within:border-[var(--ink)] overflow-hidden transition-all bg-[var(--surface)]">
                    <div className="flex items-center gap-1.5 px-3.5 bg-[var(--surface-subtle)] border-r border-[var(--line)] text-xs font-semibold text-[var(--ink)] select-none">
                      <span className="text-base leading-none">🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      id="phone-input"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-4 py-3 bg-transparent text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] outline-hidden font-medium"
                      autoFocus
                      required
                    />
                  </div>
                  {error && (
                    <p className="text-xs text-rose-700 font-medium mt-1.5">{error}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full py-3 bg-[var(--ink)] hover:bg-black text-[var(--bg)] font-medium text-xs uppercase tracking-wider rounded-[2px] cursor-pointer"
                >
                  Request OTP &rarr;
                </Button>

                <p className="text-[11px] text-[var(--ink-muted)] text-center leading-relaxed m-0">
                  By clicking continue, you agree to Barakah Bazaar&apos;s{' '}
                  <Link href="/policies/terms" className="text-[var(--ink)] underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/policies/privacy" className="text-[var(--ink)] underline">
                    Privacy Policy
                  </Link>.
                </p>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setError(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ink-muted)] hover:text-[var(--ink)] mb-3 cursor-pointer transition-colors"
                >
                  <ArrowLeft size={14} /> Change Number
                </button>
                <h1 className="font-serif text-2xl font-bold text-[var(--ink)] m-0">
                  Verify Mobile Number
                </h1>
                <p className="text-xs text-[var(--ink-muted)] mt-2">
                  Enter the 6-digit OTP code sent to{' '}
                  <strong className="text-[var(--ink)] font-bold">+91 {phone}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                {/* 6 Individual Digit Boxes */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink)]">
                    6-Digit Security Code
                  </label>
                  <div className="flex items-center justify-between gap-2 sm:gap-3">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          digitInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-10 h-12 text-center text-lg font-semibold text-[var(--ink)] bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--ink)] rounded-[2px] outline-hidden"
                      />
                    ))}
                  </div>
                  {error && (
                    <p className="text-xs text-rose-700 font-medium mt-1.5">{error}</p>
                  )}
                </div>

                {/* Dev Mode One-Click Auto-fill Helper */}
                {devOtpCode && (
                  <div className="p-3 bg-[var(--surface-subtle)] border border-[var(--line)] rounded-[2px] flex items-center justify-between text-xs text-[var(--ink)]">
                    <div>
                      <span className="font-semibold">Dev Mode:</span> Code is{' '}
                      <code className="font-mono font-bold bg-[var(--surface)] px-1.5 py-0.5 rounded-[2px] border border-[var(--line)]">
                        {devOtpCode}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={handleQuickFillDevOtp}
                      className="px-2.5 py-1 bg-[var(--ink)] text-[var(--bg)] font-medium text-[11px] rounded-[2px] uppercase tracking-wider cursor-pointer"
                    >
                      Fill
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  disabled={fullOtp.length !== 6}
                  className="w-full py-3 bg-[var(--ink)] hover:bg-black disabled:opacity-50 text-[var(--bg)] font-medium text-xs uppercase tracking-wider rounded-[2px] cursor-pointer"
                >
                  Verify &amp; Proceed &rarr;
                </Button>

                {/* Resend actions */}
                <div className="pt-2 flex items-center justify-between text-xs text-stone-500">
                  <span>Didn&apos;t receive code?</span>
                  <button
                    type="button"
                    disabled={!canResend || loading}
                    onClick={() => handleRequestOtp()}
                    className="font-bold text-[#6B1D2F] hover:underline disabled:text-stone-400 disabled:no-underline cursor-pointer disabled:cursor-not-allowed transition-colors"
                  >
                    {canResend ? (
                      <span className="flex items-center gap-1">
                        <RefreshCw size={12} /> Resend OTP
                      </span>
                    ) : (
                      `Resend in ${resendSeconds}s`
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-sm text-stone-400">Loading checkout authentication...</div>}>
      <LoginForm />
    </Suspense>
  );
}
