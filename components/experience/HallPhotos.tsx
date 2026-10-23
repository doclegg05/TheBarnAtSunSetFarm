import React from 'react';
import { HALL_PHOTOS, type HallPhoto } from './insidePhotos';
import { pic } from './photos';

interface PhotoDialogProps {
  photo: HallPhoto;
  onClose: () => void;
}

/** One photo, large, over the film's last frame. */
const PhotoDialog: React.FC<PhotoDialogProps> = ({ photo, onClose }) => {
  const close = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => close.current?.focus({ preventScroll: true }), []);
  return (
    <div
      role="dialog"
      aria-label={photo.label}
      onKeyDown={(event) => event.key === 'Escape' && onClose()}
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 p-4 sm:p-10"
    >
      <figure className="w-full max-w-4xl overflow-hidden rounded-3xl bg-brand-cream text-brand-charcoal shadow-2xl">
        <img
          {...pic(photo.image, '(min-width: 1024px) 56rem, 100vw')}
          alt={photo.alt}
          className="max-h-[70svh] w-full object-cover"
        />
        <figcaption className="flex items-center justify-between gap-4 p-4 sm:p-5">
          <span className="font-serif text-xl sm:text-2xl">{photo.label}</span>
          <button
            ref={close}
            type="button"
            onClick={onClose}
            className="rounded-full border border-current/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]"
          >
            Close
          </button>
        </figcaption>
      </figure>
    </div>
  );
};

/**
 * Real photos of the hall and the porch that pop in one after another once
 * the walk inside ends: a row to swipe on phones, a loose grid beside the
 * last line on wide screens. A tap opens a photo large.
 */
const HallPhotos: React.FC = () => {
  const [open, setOpen] = React.useState<HallPhoto | null>(null);
  return (
    <>
      <div className="absolute inset-x-0 top-24 z-20 lg:inset-x-auto lg:right-[max(11vw,11rem)] lg:top-[15vh] lg:w-[min(34vw,32rem)]">
        <p className="px-4 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white drop-shadow motion-safe:animate-[xp-photo-in_0.6s_ease-out_both] lg:px-0">
          Real weddings in the hall and on the porch
        </p>
        <ul className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] lg:grid lg:grid-cols-2 lg:gap-5 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
          {HALL_PHOTOS.map((photo, index) => (
            <li
              key={photo.label}
              className="w-[62vw] max-w-72 shrink-0 snap-start motion-safe:animate-[xp-photo-in_0.8s_cubic-bezier(0.2,0.8,0.2,1)_both] lg:w-auto lg:max-w-none"
              style={{ animationDelay: `${200 + index * 180}ms` }}
            >
              <button
                type="button"
                aria-label={photo.label}
                onClick={() => setOpen(photo)}
                className={`block w-full rounded-2xl bg-brand-cream p-1.5 shadow-2xl transition-transform duration-300 hover:scale-[1.03] ${
                  index % 2 === 0 ? 'lg:-rotate-2' : 'lg:rotate-2'
                }`}
              >
                <img
                  {...pic(photo.image, '(min-width: 1024px) 16rem, 62vw')}
                  alt={photo.alt}
                  className="aspect-[4/3] w-full rounded-xl object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
      {open && <PhotoDialog photo={open} onClose={() => setOpen(null)} />}
    </>
  );
};

export default HallPhotos;
