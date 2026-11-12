const HELLOS = [
  ['en', 'Hello'],
  ['es', 'Hola'],
  ['hi', 'नमस्ते'],
  ['zh', '你好'],
  ['fr', 'Bonjour'],
  ['ar', 'مرحبا'],
  ['pt', 'Olá'],
  ['de', 'Hallo'],
  ['tl', 'Kamusta'],
  ['vi', 'Xin chào'],
  ['ur', 'سلام'],
];

/** Endless scrolling strip of "hello" in every language we publish. */
export default function Marquee() {
  const items = [...HELLOS, ...HELLOS];
  return (
    <div className="marquee" aria-label="Hello in eleven languages">
      <div className="marquee-track">
        {items.map(([lang, word], i) => (
          <span key={i} lang={lang} aria-hidden={i >= HELLOS.length ? 'true' : undefined}>
            {word}
            <b aria-hidden="true">✦</b>
          </span>
        ))}
      </div>
    </div>
  );
}
