"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

export function getProductImageSrc(img) {
  if (!img) return "/placeholder.png";
  if (typeof img === "string") return img;
  return img.url || img.uri || "/placeholder.png";
}

export default function ProductImageManager({
  images = [],
  onChange,
  max = 6,
  label = "Product Images",
}) {
  const inputRef = useRef(null);
  const remaining = Math.max(0, max - (images?.length || 0));

  const moveImage = (index, dir) => {
    const nextIndex = index + dir;
    if (nextIndex < 0 || nextIndex >= images.length) return;
    const next = [...images];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next);
  };

  const removeImage = (index) => {
    onChange(images.filter((_, i) => i !== index));
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (remaining <= 0) {
      toast.error(`You can upload a maximum of ${max} images.`);
      e.target.value = "";
      return;
    }
    if (files.length > remaining) {
      toast.error(`You can add ${remaining} more image${remaining === 1 ? "" : "s"}.`);
      e.target.value = "";
      return;
    }

    try {
      const encoded = await Promise.all(
        files.map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
        )
      );
      onChange([...(images || []), ...encoded]);
    } catch {
      toast.error("Error processing images.");
    }
    e.target.value = "";
  };

  return (
    <div className="mb-3">
      <label className="text-gray-600 text-sm d-block mb-1">
        {label} (Max {max})
        {" "}
        <Link href="https://www.iloveimg.com/compress-image" target="_blank">
          click here to compress image
        </Link>
      </label>
      <input
        ref={inputRef}
        type="file"
        className="form-control"
        accept="image/*"
        multiple
        onChange={handleFiles}
        disabled={remaining <= 0}
      />
      {images.length > 0 && (
        <div className="mt-3 d-flex flex-wrap gap-3">
          {images.map((img, index) => (
            <div
              key={`${getProductImageSrc(img)}-${index}`}
              className="position-relative border rounded p-1 bg-white"
              style={{ width: 112 }}
            >
              {index === 0 && (
                <span
                  className="badge bg-primary position-absolute"
                  style={{ top: 6, left: 6, zIndex: 2, fontSize: 10 }}
                >
                  Cover
                </span>
              )}
              <Image
                src={getProductImageSrc(img)}
                alt={`Preview ${index + 1}`}
                width={104}
                height={90}
                className="rounded"
                unoptimized
                style={{ width: "100%", height: 90, objectFit: "cover" }}
              />
              <div className="d-flex justify-content-between align-items-center mt-1">
                <button
                  type="button"
                  className="btn btn-sm btn-light border px-2 py-0"
                  disabled={index === 0}
                  onClick={() => moveImage(index, -1)}
                  title="Move left"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger px-2 py-0"
                  onClick={() => removeImage(index)}
                  title="Remove image"
                >
                  ×
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-light border px-2 py-0"
                  disabled={index === images.length - 1}
                  onClick={() => moveImage(index, 1)}
                  title="Move right"
                >
                  ›
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-muted small mt-2 mb-0">
        Wrong photo? Remove it and upload again. Use arrows to change order. First image is the cover.
      </p>
    </div>
  );
}
