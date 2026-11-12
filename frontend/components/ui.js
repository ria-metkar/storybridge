import { LANGUAGE_OPTIONS, langNative } from '@/lib/languages';

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="spinner-wrap" role="status">
      <span className="spinner" aria-hidden="true" />
      <span className="muted">{label}</span>
    </div>
  );
}

export function Alert({ error, tone = 'error', children }) {
  if (!error && !children) return null;
  return (
    <div className={`alert alert-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children ?? error.message}
      {error?.details?.length > 1 && (
        <ul>
          {error.details.map((d) => (
            <li key={`${d.path}-${d.message}`}>{d.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className="empty">
      <p className="empty-title">{title}</p>
      {children}
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function LanguageSelect({ value, onChange, exclude, ...rest }) {
  return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)} {...rest}>
      {LANGUAGE_OPTIONS.filter((o) => o.code !== exclude).map((o) => (
        <option key={o.code} value={o.code}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Two language pickers for a {primary, secondary} pair; picking the other side's language swaps them. */
export function LanguagePairFields({ value, onChange, labels = ['Home language', 'Second language'] }) {
  const set = (key) => (code) => {
    const other = key === 'primary' ? 'secondary' : 'primary';
    onChange(value[other] === code ? { [key]: code, [other]: value[key] } : { ...value, [key]: code });
  };
  return (
    <div className="form-grid">
      <Field label={labels[0]}>
        <LanguageSelect value={value.primary} onChange={set('primary')} />
      </Field>
      <Field label={labels[1]}>
        <LanguageSelect value={value.secondary} onChange={set('secondary')} />
      </Field>
    </div>
  );
}

export function LanguagePair({ languages }) {
  if (!languages) return null;
  return (
    <span className="pair">
      <span lang={languages.primary}>{langNative(languages.primary)}</span>
      <span aria-label="and">⇄</span>
      <span lang={languages.secondary}>{langNative(languages.secondary)}</span>
    </span>
  );
}
