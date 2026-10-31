"use client";

import { useState } from "react";
import { readImage } from "./image";

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
    <path d="M12 15V3m0 0l4 4m-4-4L8 7M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * An optional photo for a site form. The picked file is shrunk to 1600px and travels as a data URL in the
 * hidden "image" field, so postForm sends it with the text fields; WordPress makes it the draft's featured image.
 */
export default function ImageField({ id, label, boxClass }: { id: string; label: string; boxClass: "co-upload" | "pg-upload" }) {
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const onPick = async (input: HTMLInputElement) => {
    const file = input.files?.[0];
    input.value = ""; // the same file can be picked again after removing it
    if (!file) return;
    try {
      setImage(await readImage(file, { maxSide: 1600 }));
      setName(file.name);
      setError("");
    } catch (e) {
      setImage("");
      setError(e instanceof Error ? e.message : "לא הצלחנו לקרוא את התמונה.");
    }
  };

  return (
    <>
      <label>{label}</label>
      {image ? (
        <div className={`${boxClass} v6-upload-picked`}>
          <img src={image} alt="" />
          <span className="v6-upload-picked__name">{name}</span>
          <button type="button" className="v6-upload-picked__x" onClick={() => { setImage(""); setName(""); }}>הסרה</button>
        </div>
      ) : (
        <label className={boxClass} htmlFor={id}><UploadIcon /> גררו תמונה לכאן או לחצו להעלאה</label>
      )}
      <input id={id} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => onPick(e.currentTarget)} />
      <input type="hidden" name="image" value={image} />
      {error && <p className="v6-upload-error" role="alert">{error}</p>}
    </>
  );
}
