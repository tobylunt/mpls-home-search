import { useState } from 'react';
import type { Property } from './model';
import { assetUrl } from './assets';

export function PropertyPhotos({ property }: { property: Property }) {
  const [selected, setSelected] = useState(0);
  const photos = property.gallery?.length ? property.gallery : property.photo ? [property.photo] : [];
  const photo = photos[selected] ?? photos[0];
  if (!photo) return null;

  return <figure className="detail-photo">
    <img src={assetUrl(photo.src)} alt={`${property.address}${photo.caption ? ` — ${photo.caption}` : ''}`} />
    {photos.length > 1 && <div className="photo-thumbnails" role="group" aria-label="Property photos">
      {photos.map((item, index) => <button key={item.src} type="button"
        aria-label={`Show ${item.caption ?? `photo ${index + 1}`}`}
        aria-pressed={selected === index} onClick={() => setSelected(index)}>
        <img src={assetUrl(item.src)} alt="" loading="lazy" />
      </button>)}
    </div>}
    <figcaption>
      {photos.length > 1 && <span>{selected + 1} / {photos.length} · {photo.caption}<br /></span>}
      <a href={photo.sourceUrl} target="_blank" rel="noreferrer">{photo.credit}</a>
    </figcaption>
  </figure>;
}
