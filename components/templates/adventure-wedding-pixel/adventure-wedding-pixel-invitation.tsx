"use client";

/* eslint-disable @next/next/no-img-element -- The game artwork is a small local WebP and must paint before the interactive canvas. */
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { resolveMediaUrl } from "@/lib/media";
import type { Greeting, Invitation } from "@/lib/types";
import { localizeSundaInvitation } from "../sunda-vibes/indonesian-copy";
import { PixelCharacter, PixelWorld } from "./pixel-world";
import { formatWeddingDate, PixelIcon, PixelPanels } from "./pixel-panels";
import { PixelEntryLoading, PixelWelcome } from "./pixel-entry";
import { PixelNavigation } from "./pixel-navigation";
import { ANIMALS, LOCATIONS, SPAWN, type AnimalId, type Character, type Point, type Section } from "./world";
import styles from "./pixel.module.css";

type Props = { invitation: Invitation; greetings: Greeting[]; guestName: string | null; initiallyOpened?: boolean };

export function AdventureWeddingPixelInvitation({ invitation: sourceInvitation, greetings, guestName, initiallyOpened = false }: Props) {
  const invitation = localizeSundaInvitation(sourceInvitation);
  const [opened, setOpened] = useState(initiallyOpened);
  const [entering, setEntering] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const [character, setCharacter] = useState<Character>("groom");
  const [section, setSection] = useState<Section | "help" | null>(null);
  const [near, setNear] = useState<Section | null>(null);
  const [animalMessage, setAnimalMessage] = useState<{ text: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [worldError, setWorldError] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [notice, setNotice] = useState("");
  const [visited, setVisited] = useState<Section[]>([]);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const input = useRef<Point>({ x: 0, y: 0 });
  const position = useRef<Point>({ ...SPAWN });
  const joystickPointer = useRef<number | null>(null);
  const enteredAt = useRef(0);
  const audio = useRef<HTMLAudioElement>(null);
  const game = useRef<HTMLDivElement>(null);
  const configuredMusic = invitation.music_path?.trim();
  const defaultMusic = "/media/adventure-wedding-pixel/gasmask-love.mp3";
  const musicPath = configuredMusic && !["/media/sunda-vibes/audio.mp3", defaultMusic].includes(configuredMusic) ? resolveMediaUrl(configuredMusic) : defaultMusic;
  const location = LOCATIONS.find(item => item.id === near);
  const interactionLabel = location?.label;

  useEffect(() => {
    if (!entering) return;
    const elapsed = performance.now() - enteredAt.current;
    const delay = ready || worldError ? Math.max(0, 700 - elapsed) : Math.max(0, 2500 - elapsed);
    const timeout = window.setTimeout(() => {
      setEntering(false); setWelcome(true); game.current?.focus({ preventScroll: true });
    }, delay);
    return () => window.clearTimeout(timeout);
  }, [entering, ready, worldError]);

  useEffect(() => {
    if (!animalMessage) return;
    const timeout = window.setTimeout(() => setAnimalMessage(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [animalMessage]);

  function greetAnimal(id: AnimalId) {
    setAnimalMessage({ text: ANIMALS.find(item => item.id === id)?.response ?? "" });
  }

  useEffect(() => {
    const music = audio.current;
    if (music) music.volume = .35;
    const hide = () => { joystickPointer.current = null; input.current = { x: 0, y: 0 }; setKnob({ x: 0, y: 0 }); if (document.hidden) music?.pause(); };
    window.addEventListener("blur", hide); document.addEventListener("visibilitychange", hide);
    return () => { window.removeEventListener("blur", hide); document.removeEventListener("visibilitychange", hide); music?.pause(); };
  }, []);

  async function toggleMusic() {
    if (!audio.current || !musicPath) return;
    if (!audio.current.paused) { audio.current.pause(); return; }
    try { await audio.current.play(); setNotice(""); }
    catch { setNotice("Musik belum dapat diputar. Sentuh tombol musik untuk mencoba lagi."); }
  }
  function enterGarden() {
    enteredAt.current = performance.now(); setOpened(true); setEntering(true); setNotice("");
    if (audio.current && musicPath) void audio.current.play().catch(() => setNotice("Petualangan dimulai. Kamu bisa menyalakan musik lewat tombol di atas."));
  }
  function openSection(next: Section | "help") {
    joystickPointer.current = null; input.current = { x: 0, y: 0 }; setKnob({ x: 0, y: 0 }); setNotice(""); setWelcome(false); setSection(next);
    if (next !== "help") setVisited(current => current.includes(next) ? current : [...current, next]);
  }
  function interact() {
    if (location) openSection(location.id);
    else setNotice("Dekati salah satu papan kayu. Kamu juga bisa langsung memakai menu di bawah.");
  }
  function moveJoystick(event: PointerEvent<HTMLDivElement>) {
    if (joystickPointer.current !== event.pointerId) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const deltaX = event.clientX - (bounds.left + bounds.width / 2);
    const deltaY = event.clientY - (bounds.top + bounds.height / 2);
    const radius = bounds.width * .3;
    const length = Math.hypot(deltaX, deltaY);
    const ratio = length > radius ? radius / length : 1;
    const x = deltaX * ratio, y = deltaY * ratio;
    input.current = length < 6 ? { x: 0, y: 0 } : { x: x / radius, y: y / radius };
    setKnob({ x, y });
  }
  function releaseJoystick(event: PointerEvent<HTMLDivElement>) {
    if (joystickPointer.current !== event.pointerId) return;
    joystickPointer.current = null; input.current = { x: 0, y: 0 }; setKnob({ x: 0, y: 0 });
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return <div className={styles.theme}>
    <div className={styles.desktopAtmosphere} aria-hidden="true"><span>ADVENTURE<br />WEDDING<br /><em>PIXEL</em></span><p>A little world.<br />A lifetime together.</p><small>InDif Digital · Wedding collection</small></div>
    <main className={styles.gameShell} aria-label={`Undangan pernikahan ${invitation.bride_short_name} dan ${invitation.groom_short_name}`}>
      {musicPath && <audio ref={audio} src={musicPath} loop preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setPlaying(false); setNotice("Musik belum tersedia. Undangan tetap bisa dijelajahi."); }} />}
      <div ref={game} className={styles.game} tabIndex={-1} inert={!opened || entering}>
        {opened && <h1 className={styles.srOnly}>Pernikahan {invitation.bride_short_name} dan {invitation.groom_short_name}</h1>}
        {opened && <PixelWorld active={opened && !section && !entering} character={character} input={input} position={position} onAnimalTouch={greetAnimal} onNear={setNear} onInteract={interact} onReady={setReady} onError={() => setWorldError(true)} />}
        <header className={styles.hud}><div className={styles.hudIdentity}><PixelIcon name="heart" /><div><strong>{invitation.bride_short_name} & {invitation.groom_short_name}</strong><span>{visited.length}/{LOCATIONS.length} tempat dikunjungi</span></div></div><div className={styles.hudButtons}>{musicPath && <button type="button" onClick={toggleMusic} aria-label={playing ? "Matikan musik" : "Putar musik"} aria-pressed={playing}><PixelIcon name="music" /><span>{playing ? "ON" : "OFF"}</span></button>}<button type="button" aria-label="Petunjuk dan peta" onClick={() => openSection("help")}><PixelIcon name="map" /><span>PETA</span></button></div></header>
        <div className={styles.locationRibbon}><span aria-hidden="true">✦</span> Taman janji selamanya <span aria-hidden="true">✦</span></div>
        {animalMessage && <p className={styles.wildlifeToast} role="status">{animalMessage.text}</p>}
        {!ready && <div className={styles.loading} role="status">{worldError ? <>Taman belum dapat dimuat.<br />Semua isi undangan tersedia di menu bawah.</> : "Menyiapkan taman…"}</div>}
        {notice && <p className={styles.notice} role="status">{notice}<button type="button" aria-label="Tutup petunjuk singkat" onClick={() => setNotice("")}>×</button></p>}
        {welcome && !notice && <PixelWelcome onClose={() => setWelcome(false)} />}
        <div className={styles.controls}>
          <div className={styles.joystickGroup}><span>GERAK</span><div className={styles.joystick} role="group" aria-label="Analog untuk menggerakkan karakter" onPointerDown={event => { if (joystickPointer.current !== null) return; event.preventDefault(); joystickPointer.current = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId); moveJoystick(event); }} onPointerMove={moveJoystick} onPointerUp={releaseJoystick} onPointerCancel={releaseJoystick} onLostPointerCapture={releaseJoystick}><i className={styles.up}>▲</i><i className={styles.right}>▶</i><i className={styles.down}>▼</i><i className={styles.left}>◀</i><div className={styles.joystickKnob} style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}><span /></div></div></div>
          <div className={styles.actionGroup}><span className={styles.interactionHint} role="status">{interactionLabel ?? "Jelajahi taman"}</span><button className={styles.actionButton} type="button" onClick={interact} aria-label={interactionLabel ? `Berinteraksi: ${interactionLabel}` : "Petunjuk interaksi"} data-ready={Boolean(interactionLabel)}>A</button><small>{location ? "BUKA CERITA" : "INTERAKSI"}</small></div>
        </div>
        <PixelNavigation visited={visited} current={section && section !== "help" ? section : near} onSelect={openSection} />
        <p className={styles.keyboardHint}>WASD / ← ↑ ↓ → untuk berjalan · E untuk berinteraksi</p>
      </div>
      {entering && <PixelEntryLoading />}
      {!opened && <section className={styles.cover} aria-labelledby="pixel-cover-title">
        <img className={styles.coverArt} src="/media/adventure-wedding-pixel/garden.webp" alt="Taman pernikahan pixel dengan pelaminan, bunga, jembatan, dan kolam" width={768} height={1152} fetchPriority="high" />
        <div className={styles.coverTop}><div className={styles.woodenPlaque}><span>ADVENTURE WEDDING PIXEL</span><strong>A new chapter begins</strong><div><i /> <PixelIcon name="heart" /> <i /></div></div><div className={styles.coverCharacters}><PixelCharacter character="groom" /><PixelCharacter character="bride" /></div></div>
        <div className={styles.coverCard}><p className={styles.coverEyebrow}>Undangan pernikahan</p><h1 id="pixel-cover-title">{invitation.bride_short_name}<span>&</span>{invitation.groom_short_name}</h1><p className={styles.coverDate}>{formatWeddingDate(invitation.event_date)}</p><div className={styles.guest}><span>Kepada Yth.</span><strong>{guestName || "Tamu Undangan"}</strong></div><p className={styles.coverIntro}>Ada cerita di setiap sudut taman.<br />Yuk, jadi bagian dari petualangan kami.</p><fieldset className={styles.characterPicker}><legend>Pilih karaktermu</legend><button type="button" aria-pressed={character === "groom"} onClick={() => setCharacter("groom")}><PixelCharacter character="groom" /><span><strong>Petualang pria</strong><small>Siap merayakan</small></span><i>{character === "groom" ? "✓" : ""}</i></button><button type="button" aria-pressed={character === "bride"} onClick={() => setCharacter("bride")}><PixelCharacter character="bride" /><span><strong>Petualang wanita</strong><small>Membawa doa</small></span><i>{character === "bride" ? "✓" : ""}</i></button></fieldset><button type="button" className={styles.startButton} onClick={enterGarden}><span aria-hidden="true">▶</span> Mulai petualangan</button><p className={styles.coverHint}>Analog & tombol · Bisa juga langsung lewat menu</p></div>
        <small className={styles.coverBrand}>Dibuat dengan cinta oleh InDif Digital</small>
      </section>}
      <PixelPanels section={section} invitation={invitation} greetings={greetings} guestName={guestName} onClose={() => setSection(null)} />
    </main>
  </div>;
}
