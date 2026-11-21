import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, ExternalLink, Video as VideoIcon, RefreshCw } from 'lucide-react';
import { resolveVideoSources } from '../lib/imageUtils';

interface SmartVideoProps {
  src?: string | null;
  poster?: string | null;
  title?: string;
  className?: string;
  aspectClassName?: string;
}

const formatTime = (secs: number) => {
  if (!Number.isFinite(secs) || secs < 0) return '0:00';
  const mins = Math.floor(secs / 60);
  const rem = Math.floor(secs % 60);
  return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
};

/**
 * Adaptive video player supporting Google Drive share links, direct MP4/WebM files, and YouTube embeds.
 * Provides interactive user Play/Pause, seek, mute, and fullscreen controls, with automatic Drive preview fallback.
 */
export const SmartVideo: React.FC<SmartVideoProps> = ({
  src,
  poster,
  title = 'Video Player',
  className = '',
  aspectClassName = 'aspect-video',
}) => {
  const resolved = useMemo(() => resolveVideoSources(src), [src]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [attemptIndex, setAttemptIndex] = useState(0);
  const [useEmbedMode, setUseEmbedMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setAttemptIndex(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHasError(false);
    setUseEmbedMode(resolved.directUrls.length === 0 && Boolean(resolved.embedPreviewUrl));
  }, [src, resolved.directUrls.length, resolved.embedPreviewUrl]);

  if (!resolved.originalUrl) {
    return null;
  }

  const activeDirectUrl = resolved.directUrls[attemptIndex];

  const handleTogglePlay = async () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused || vid.ended) {
      try {
        await vid.play();
      } catch (err) {
        console.warn('Video play notice:', err);
      }
    } else {
      vid.pause();
    }
  };

  const handleToggleMute = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setIsMuted(vid.muted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vid = videoRef.current;
    if (!vid) return;
    const nextTime = Number(e.target.value);
    vid.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleFullscreen = () => {
    const el = containerRef.current || videoRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      el.requestFullscreen?.();
    }
  };

  const handleDirectError = () => {
    if (attemptIndex + 1 < resolved.directUrls.length) {
      setAttemptIndex((prev) => prev + 1);
    } else if (resolved.embedPreviewUrl) {
      setUseEmbedMode(true);
    } else {
      setHasError(true);
    }
  };

  if (useEmbedMode && resolved.embedPreviewUrl) {
    return (
      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden rounded-2xl bg-navy-950 border border-slate-800 shadow-lg ${aspectClassName} ${className}`}
      >
        <iframe
          src={resolved.embedPreviewUrl}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 bg-navy-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/15">
            <VideoIcon className="w-3 h-3 text-brand-400" />
            <span>{resolved.isGoogleDrive ? 'Google Drive Video' : 'Video Player'}</span>
          </span>
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {resolved.directUrls.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setAttemptIndex(0);
                  setHasError(false);
                  setUseEmbedMode(false);
                }}
                className="inline-flex items-center gap-1 bg-navy-950/85 hover:bg-navy-900 text-slate-100 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/15 transition-colors"
                title="Try Direct HTML5 Controls"
              >
                <RefreshCw className="w-3 h-3" />
                <span>HTML5 Mode</span>
              </button>
            )}
            <a
              href={resolved.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-navy-950/85 hover:bg-navy-900 text-slate-100 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/15 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`group relative w-full overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-lg select-none ${aspectClassName} ${className}`}
    >
      {hasError || !activeDirectUrl ? (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 text-slate-300 space-y-2">
          <VideoIcon className="w-8 h-8 text-brand-400 opacity-80" />
          <p className="text-xs font-semibold">Unable to stream video directly in this browser.</p>
          <a
            href={resolved.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Video Link</span>
          </a>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            key={activeDirectUrl}
            src={activeDirectUrl}
            poster={poster || undefined}
            playsInline
            preload="metadata"
            onClick={handleTogglePlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
            onError={handleDirectError}
            className="w-full h-full object-contain cursor-pointer bg-black"
          />

          {/* Top bar badge & Drive player switcher */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 bg-navy-950/75 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/15">
              <VideoIcon className="w-3 h-3 text-brand-400" />
              <span>{isPlaying ? 'Playing' : 'Ready to Play'}</span>
            </span>

            {resolved.embedPreviewUrl && (
              <button
                type="button"
                onClick={() => setUseEmbedMode(true)}
                className="pointer-events-auto inline-flex items-center gap-1 bg-navy-950/80 hover:bg-navy-900 text-slate-100 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/15 transition-colors"
              >
                <span>Drive Player</span>
              </button>
            )}
          </div>

          {/* Center Play/Pause overlay button */}
          {!isPlaying && (
            <button
              type="button"
              onClick={handleTogglePlay}
              aria-label="Play video"
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-brand-500/95 hover:bg-brand-400 text-white shadow-2xl shadow-brand-500/40 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ring-4 ring-white/25"
            >
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </button>
          )}

          {/* User Control Bar (Play/Pause, Seek, Mute, Fullscreen) */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 pt-6 pb-2.5 flex items-center gap-2.5 text-white">
            <button
              type="button"
              onClick={handleTogglePlay}
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
              className="w-8 h-8 rounded-lg bg-white/15 hover:bg-brand-500 flex items-center justify-center transition-colors shrink-0"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              aria-label="Seek video"
              className="flex-1 h-1.5 accent-brand-400 cursor-pointer"
            />

            <span className="text-[10px] font-mono text-slate-200 tabular-nums shrink-0">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <button
              type="button"
              onClick={handleToggleMute}
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleFullscreen}
              aria-label="Toggle fullscreen"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
