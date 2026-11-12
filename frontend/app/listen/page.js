'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Field } from '@/components/ui';

export default function EnterCodePage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const normalized = code.trim().toUpperCase();
  const valid = /^[A-Z0-9-]{3,24}$/.test(normalized);

  return (
    <div className="container section narrow">
      <h1>Listen to your book</h1>
      <p className="lead muted">
        Find the audio code inside the back cover (it’s under the QR code) and enter it below.
      </p>
      <form
        className="card stack"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) router.push(`/listen/${encodeURIComponent(normalized)}`);
        }}
      >
        <Field label="Audio code" hint="For example: MOON-ES">
          <input
            className="input input-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            maxLength={24}
            required
          />
        </Field>
        <button className="btn btn-primary" disabled={!valid}>
          Open story
        </button>
      </form>
      <p className="muted small">
        No book yet? <Link href="/listen/MOON-ES">Try our free sample story</Link>.
      </p>
    </div>
  );
}
