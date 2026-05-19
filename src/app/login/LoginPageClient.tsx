'use client'
import React, { useState } from 'react'
import { createClient as createBrowserSupabase } from '@/utils/supabase/client';
import { Eye, EyeClosed } from 'lucide-react';

export default function LoginPageClient() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showPassword, setShowPassword] = useState(false);



    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const supabase = await createBrowserSupabase();
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }

            window.location.href = '/admin';
        } catch (err) {
            console.log(err)
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <section style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 'var(--section-padding)' }}>
            <div className="card-glass card-glow-hover" style={{ maxWidth: 520, width: '100%', padding: 28 }}>
                <h2 className="text-gold-shimmer" style={{ fontFamily: 'var(--font-display)', fontSize: 28, margin: 0 }}>Sign in</h2>
                <p style={{ color: 'var(--ivory-dim)', marginTop: 8, marginBottom: 18 }}>Sign in with email and password</p>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
                    <label style={{ display: 'grid', gap: 6 }}>
                        <span style={{ color: 'var(--ivory-dim)', fontSize: 12 }}>Email</span>
                        <input
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="you@example.com"
                            style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ivory)' }}
                        />
                    </label>

                    <label style={{ display: 'grid', gap: 6 }}>
                        <span style={{ color: 'var(--ivory-dim)', fontSize: 12 }}>Password</span>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    padding: '12px 42px 12px 14px', // ← right padding makes room for icon
                                    borderRadius: 10,
                                    border: '1px solid var(--border)',
                                    background: 'transparent',
                                    color: 'var(--ivory)',
                                    boxSizing: 'border-box',
                                }}
                            />
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: 14,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                {showPassword
                                    ? <Eye size={18} color="var(--ivory-dim)" />
                                    : <EyeClosed size={18} color="var(--ivory-dim)" />
                                }
                            </span>
                        </div>
                    </label>

                    {error && <div style={{ color: 'var(--price-down)', fontSize: 13 }}>{error}</div>}

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 6 }}>
                        <button className="btn-gold" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                            <span>{loading ? 'Signing in…' : 'Sign in'}</span>
                        </button>
                        <button type="button" className="btn-facebook" onClick={() => (window.location.href = '/')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </section>
    )
}
