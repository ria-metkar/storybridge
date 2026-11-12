import { Field } from './ui';

export const EMPTY_ADDRESS = {
  fullName: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
};

const FIELDS = [
  { name: 'fullName', label: 'Full name', autoComplete: 'name', required: true, wide: true },
  { name: 'line1', label: 'Address line 1', autoComplete: 'address-line1', required: true, wide: true },
  { name: 'line2', label: 'Address line 2 (optional)', autoComplete: 'address-line2', wide: true },
  { name: 'city', label: 'City', autoComplete: 'address-level2', required: true },
  { name: 'state', label: 'State / region', autoComplete: 'address-level1' },
  { name: 'postalCode', label: 'Postal code', autoComplete: 'postal-code', required: true },
  { name: 'country', label: 'Country', autoComplete: 'country-name', required: true },
];

/** Strips empty optional fields so the API doesn't receive "". */
export const cleanAddress = (a) => Object.fromEntries(Object.entries(a).filter(([, v]) => v?.trim()));

export default function AddressFields({ value, onChange }) {
  const set = (name) => (e) => onChange({ ...value, [name]: e.target.value });
  return (
    <div className="form-grid">
      {FIELDS.map((f) => (
        <div key={f.name} className={f.wide ? 'span-2' : undefined}>
          <Field label={f.label}>
            <input
              className="input"
              name={f.name}
              value={value[f.name] ?? ''}
              onChange={set(f.name)}
              autoComplete={f.autoComplete}
              required={f.required}
              maxLength={120}
            />
          </Field>
        </div>
      ))}
    </div>
  );
}
