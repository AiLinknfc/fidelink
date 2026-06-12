import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicBioBySlug } from '@/services/publicService';

export default function PublicBio() {
  const { slug } = useParams();
  const [bio, setBio] = useState<any | null>(null);

  useEffect(() => {
    if (!slug) return;
    getPublicBioBySlug(slug).then(({ data }) => setBio(data));
  }, [slug]);

  if (!bio) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <p className="text-on-surface-variant">Mini-bio no encontrada.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">{bio.name}</h1>
      <div className="mt-4 text-body-md text-on-surface-variant">{bio.public_bio}</div>
    </div>
  );
}
