"use client";

import Image from "next/image";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type Props = {
  coupleNames: string;
  coverPath: string;
  profilePath: string;
  guestName: string | null;
  musicPath: string | null;
  initiallyOpened?: boolean;
  themeClassName?: string;
  themeStyle?: CSSProperties;
  children: ReactNode;
};

const InvitationOpenedContext = createContext(false);

export function useInvitationOpened() {
  return useContext(InvitationOpenedContext);
}

export function InvitationExperience({ coupleNames, coverPath, profilePath, guestName, musicPath, initiallyOpened = false, themeClassName, themeStyle, children }: Props) {
  const [opened, setOpened] = useState(initiallyOpened);
  const [playing, setPlaying] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    if (window.location.hash) {
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = opened ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [opened]);

  async function openInvitation() {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    setOpened(true);
    setCelebrating(true);
    window.setTimeout(() => setCelebrating(false), 4_500);
    if (!audioRef.current) return;
    try {
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
    } catch {
      setPlaying(false);
    }
  }

  async function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setPlaying(false);
      }
    } else {
      audio.pause();
    }
  }

  return (
    <InvitationOpenedContext.Provider value={opened}>
      <div className={themeClassName} style={themeStyle}>
      <div
        className={`invitation-cover ${opened ? "is-open" : ""}`}
        role="dialog"
        aria-modal={!opened}
        aria-label={`Buka undangan ${coupleNames}`}
        aria-hidden={opened}
      >
        <Image src={coverPath} alt="" fill priority className="cover-image" />
        <div className="cover-overlay" />
        <div className="cover-content">
          <p className="eyebrow light">The Wedding of</p>
          <div className="cover-portrait"><Image src={profilePath} alt="Foto pasangan" fill priority sizes="152px" /></div>
          <h1>{coupleNames}</h1>
          {guestName && <div className="cover-guest"><small>Kepada Yth.</small><strong>{guestName}</strong></div>}
          <button className="button cover-button" type="button" onClick={openInvitation}>Buka undangan</button>
        </div>
      </div>

      {celebrating && (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 28 }, (_, index) => (
            <i key={index} style={{ "--i": index, "--x": `${(index * 37) % 100}%`, "--delay": `${(index % 9) * 70}ms` } as CSSProperties} />
          ))}
        </div>
      )}

      {musicPath && (
        <audio
          ref={audioRef}
          src={musicPath}
          loop
          preload="auto"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      )}
      {opened && musicPath && (
        <button className={`music-toggle ${playing ? "is-playing" : ""}`} type="button" onClick={toggleMusic} aria-label={playing ? "Matikan musik" : "Putar musik"}>
          <span>♪</span>
        </button>
      )}
      <div
        className={`invitation-stage ${opened ? "is-open" : ""}`}
        aria-hidden={!opened}
        inert={!opened}
      >
        {children}
      </div>
      </div>
    </InvitationOpenedContext.Provider>
  );
}
