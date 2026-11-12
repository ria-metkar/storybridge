'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LanguagePair } from './ui';
import { isRtl, langNative, speechTag } from '@/lib/languages';

function pickVoice(tag) {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  const lower = tag.toLowerCase();
  const base = lower.split('-')[0];
  return (
    voices.find((v) => v.lang.toLowerCase() === lower) ||
    voices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(base)) ||
    null
  );
}

const hasTiming = (line) => typeof line.start === 'number' && typeof line.end === 'number';

/**
 * Read-along player. Each page holds lines in both languages.
 * - If a page has `audioUrl`, the recorded native-speaker narration plays and
 *   lines highlight using their start/end timestamps.
 * - Otherwise it narrates with the device's speech synthesis, line by line.
 * Readers can show both languages or focus on one (the other is skipped in playback).
 */
export default function ReadAlongPlayer({ book }) {
  const { pages, languages } = book;
  const [pageIndex, setPageIndex] = useState(0);
  const [activeLine, setActiveLine] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [mode, setMode] = useState('both'); // 'both' | 'primary' | 'secondary'
  const [rate, setRate] = useState(1);
  const [autoTurn, setAutoTurn] = useState(true);
  const [ttsSupported, setTtsSupported] = useState(true);
  const [missingVoices, setMissingVoices] = useState([]);

  const audioRef = useRef(null);
  const runRef = useRef(0); // bumping this cancels any in-flight speech chain
  const autoplayNextRef = useRef(false);

  const page = pages[pageIndex];
  const lastPage = pages.length - 1;
  const recorded = Boolean(page.audioUrl);
  const focusLang = mode === 'both' ? null : languages[mode];

  const visibleLines = useMemo(
    () =>
      page.lines.map((line, index) => ({ ...line, index })).filter((l) => !focusLang || l.lang === focusLang),
    [page, focusLang],
  );

  // Detect speech support and which of the book's languages lack an installed voice.
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) {
      setTtsSupported(false);
      return undefined;
    }
    const check = () => {
      if (!synth.getVoices().length) return;
      setMissingVoices([languages.primary, languages.secondary].filter((c) => !pickVoice(speechTag(c))));
    };
    check();
    synth.addEventListener?.('voiceschanged', check);
    return () => synth.removeEventListener?.('voiceschanged', check);
  }, [languages]);

  const stop = useCallback(() => {
    runRef.current += 1;
    window.speechSynthesis?.cancel();
    audioRef.current?.pause();
    setPlaying(false);
    setActiveLine(-1);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const finishPage = useCallback(() => {
    if (autoTurn && pageIndex < lastPage) {
      autoplayNextRef.current = true;
      setPageIndex((i) => i + 1);
    } else {
      setPlaying(false);
      setActiveLine(-1);
    }
  }, [autoTurn, pageIndex, lastPage]);

  const speakFrom = useCallback(
    (position) => {
      const synth = window.speechSynthesis;
      if (!synth) return;
      const run = ++runRef.current;
      synth.cancel();
      setPlaying(true);

      const speakNext = (k) => {
        if (run !== runRef.current) return;
        if (k >= visibleLines.length) {
          finishPage();
          return;
        }
        const line = visibleLines[k];
        const utterance = new SpeechSynthesisUtterance(line.text);
        utterance.lang = speechTag(line.lang);
        const voice = pickVoice(utterance.lang);
        if (voice) utterance.voice = voice;
        utterance.rate = rate * 0.9; // a touch slower than default suits young listeners
        utterance.onend = () => speakNext(k + 1);
        utterance.onerror = (e) => {
          if (e.error !== 'interrupted' && e.error !== 'canceled') speakNext(k + 1);
        };
        setActiveLine(line.index);
        synth.speak(utterance);
      };
      speakNext(position);
    },
    [visibleLines, rate, finishPage],
  );

  const playRecordedFrom = useCallback(
    (position) => {
      const audio = audioRef.current;
      if (!audio) return;
      runRef.current += 1;
      window.speechSynthesis?.cancel();
      const line = visibleLines[position];
      audio.currentTime = line && hasTiming(line) ? line.start : 0;
      audio.playbackRate = rate;
      setPlaying(true);
      audio.play().catch(() => setPlaying(false));
    },
    [visibleLines, rate],
  );

  const playFrom = useCallback(
    (position = 0) => (recorded ? playRecordedFrom(position) : speakFrom(position)),
    [recorded, playRecordedFrom, speakFrom],
  );

  // Continue playback after an automatic page turn.
  useEffect(() => {
    if (autoplayNextRef.current) {
      autoplayNextRef.current = false;
      playFrom(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex]);

  // Changing focus language restarts cleanly.
  useEffect(() => {
    stop();
  }, [mode, stop]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate]);

  const goTo = useCallback(
    (index) => {
      stop();
      setPageIndex(Math.min(Math.max(index, 0), lastPage));
    },
    [stop, lastPage],
  );

  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowRight') goTo(pageIndex + 1);
      if (e.key === 'ArrowLeft') goTo(pageIndex - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo, pageIndex]);

  const togglePlay = () => {
    if (playing) {
      if (recorded) {
        audioRef.current?.pause();
        setPlaying(false);
      } else {
        stop();
      }
      return;
    }
    const audio = audioRef.current;
    if (recorded && audio && audio.currentTime > 0 && !audio.ended) {
      setPlaying(true);
      audio.play().catch(() => setPlaying(false));
    } else {
      playFrom(0);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    const t = audio.currentTime;
    const timed = page.lines.map((l, index) => ({ ...l, index })).filter(hasTiming);
    const current = timed.find((l) => t >= l.start && t < l.end);
    if (!current) return;
    if (focusLang && current.lang !== focusLang) {
      const next = timed.find((l) => l.start >= current.end && l.lang === focusLang);
      if (next) audio.currentTime = next.start;
      else {
        audio.pause();
        finishPage();
      }
      return;
    }
    setActiveLine(current.index);
  };

  const canPlay = recorded || ttsSupported;

  return (
    <section className="player" aria-label={`Read along: ${book.title.primary}`}>
      <header className="player-head">
        <div>
          <h1 lang={languages.primary}>{book.title.primary}</h1>
          <p className="player-subtitle" lang={languages.secondary} dir={isRtl(languages.secondary) ? 'rtl' : undefined}>
            {book.title.secondary}
          </p>
        </div>
        <LanguagePair languages={languages} />
      </header>

      <div className="player-stage" style={{ '--cover': book.coverColor || '#f4a261' }}>
        <div className="illustration" aria-hidden="true">
          {page.illustration || book.coverEmoji || '📖'}
        </div>
        <ol className="lines">
          {visibleLines.map((line, k) => {
            const active = activeLine === line.index;
            return (
              <li key={line.index}>
                <button
                  type="button"
                  className={`line ${line.lang === languages.primary ? 'line-a' : 'line-b'} ${active ? 'active' : ''}`}
                  lang={line.lang}
                  dir={isRtl(line.lang) ? 'rtl' : 'ltr'}
                  aria-current={active ? 'true' : undefined}
                  onClick={() => canPlay && playFrom(k)}
                  title="Play from this line"
                >
                  <span className="line-lang">{langNative(line.lang)}</span>
                  <span className="line-text">{line.text}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {recorded && (
        <audio
          ref={audioRef}
          src={page.audioUrl}
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onEnded={finishPage}
        />
      )}

      <div className="player-controls">
        <button className="btn btn-outline" onClick={() => goTo(pageIndex - 1)} disabled={pageIndex === 0}>
          ← Previous
        </button>
        <button className="btn btn-primary btn-play" onClick={togglePlay} disabled={!canPlay}>
          {playing ? '❚❚ Pause' : '▶ Play'}
        </button>
        <button className="btn btn-outline" onClick={() => goTo(pageIndex + 1)} disabled={pageIndex === lastPage}>
          Next →
        </button>
      </div>

      <div className="page-dots" role="tablist" aria-label="Pages">
        {pages.map((p, i) => (
          <button
            key={p.number}
            role="tab"
            aria-selected={i === pageIndex}
            aria-label={`Page ${p.number}`}
            className={`dot ${i === pageIndex ? 'active' : ''}`}
            onClick={() => goTo(i)}
          />
        ))}
        <span className="muted small">
          Page {pageIndex + 1} of {pages.length}
        </span>
      </div>

      <div className="player-settings">
        <div className="segmented" role="radiogroup" aria-label="Languages shown">
          {[
            ['both', 'Both'],
            ['primary', langNative(languages.primary)],
            ['secondary', langNative(languages.secondary)],
          ].map(([value, label]) => (
            <button
              key={value}
              role="radio"
              aria-checked={mode === value}
              className={mode === value ? 'on' : ''}
              onClick={() => setMode(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="row gap-sm small">
          Speed
          <select className="input input-sm" value={rate} onChange={(e) => setRate(Number(e.target.value))}>
            <option value={0.75}>Slow</option>
            <option value={1}>Normal</option>
            <option value={1.25}>Fast</option>
          </select>
        </label>
        <label className="row gap-sm small">
          <input type="checkbox" checked={autoTurn} onChange={(e) => setAutoTurn(e.target.checked)} />
          Turn pages automatically
        </label>
      </div>

      {!recorded && (
        <p className="muted small player-note">
          {ttsSupported
            ? 'This page has no studio recording yet, so it is read by your device’s voice. Tap any line to hear it.'
            : 'Your browser does not support speech playback. Try Chrome, Edge or Safari.'}
          {missingVoices.length > 0 &&
            ` No ${missingVoices.map(langNative).join(' / ')} voice is installed on this device, so those lines may sound off — add one in your system’s language settings.`}
        </p>
      )}
    </section>
  );
}
