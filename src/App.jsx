import { useState, useRef, useCallback, useEffect } from "react";

const FILM_STOCKS = [
  {
    id: "provia",
    name: "Provia 100F",
    description: "Standard, faithful colors",
    tag: "Standard",
    css: "saturate(1.05) contrast(1.05) brightness(1.0)",
    tint: null,
  },
  {
    id: "velvia",
    name: "Velvia 50",
    description: "Vivid, punchy saturation",
    tag: "Vivid",
    css: "saturate(1.6) contrast(1.2) brightness(0.97)",
    tint: null,
  },
  {
    id: "classic_chrome",
    name: "Classic Chrome",
    description: "Muted, documentary look",
    tag: "Muted",
    css: "saturate(0.75) contrast(1.1) brightness(0.98) sepia(0.08)",
    tint: "rgba(40,50,70,0.07)",
  },
  {
    id: "acros",
    name: "Acros",
    description: "Rich black & white film",
    tag: "B&W",
    css: "grayscale(1) contrast(1.15) brightness(0.97)",
    tint: null,
  },
  {
    id: "eterna",
    name: "Eterna Cinema",
    description: "Cinematic, lifted shadows",
    tag: "Cinema",
    css: "saturate(0.85) contrast(0.92) brightness(1.05) sepia(0.05)",
    tint: "rgba(20,30,10,0.06)",
  },
  {
    id: "classic_neg",
    name: "Classic Neg.",
    description: "Warm, faded nostalgia",
    tag: "Retro",
    css: "saturate(0.9) contrast(1.05) brightness(1.03) sepia(0.18)",
    tint: "rgba(80,50,20,0.08)",
  },
  {
    id: "nostalgic_neg",
    name: "Nostalgic Neg.",
    description: "Warm shadows, cool highlights",
    tag: "Nostalgic",
    css: "saturate(1.1) contrast(1.08) brightness(1.02) sepia(0.12) hue-rotate(-5deg)",
    tint: "rgba(60,30,10,0.07)",
  },
  {
    id: "proviasoft",
    name: "Pro Neg. Std",
    description: "Soft skin tones, portraits",
    tag: "Portrait",
    css: "saturate(0.95) contrast(0.97) brightness(1.04)",
    tint: "rgba(255,220,190,0.04)",
  },
];

const TAG_COLORS = {
  Standard: { bg: "#E6F1FB", text: "#185FA5" },
  Vivid:    { bg: "#FAECE7", text: "#993C1D" },
  Muted:    { bg: "#F1EFE8", text: "#5F5E5A" },
  "B&W":    { bg: "#D3D1C7", text: "#2C2C2A" },
  Cinema:   { bg: "#EAF3DE", text: "#3B6D11" },
  Retro:    { bg: "#FAEEDA", text: "#854F0B" },
  Nostalgic:{ bg: "#FBEAF0", text: "#993556" },
  Portrait: { bg: "#F4C0D1", text: "#72243E" },
};

function FilmCard({ stock, imageUrl, selected, onClick }) {
  const tc = TAG_COLORS[stock.tag] || { bg: "#eee", text: "#333" };
  return (
    <div
      onClick={onClick}
      style={{
        cursor: "pointer",
        borderRadius: 12,
        border: selected ? "2px solid #185FA5" : "1px solid #e0e0e0",
        overflow: "hidden",
        background: "#fff",
        transition: "transform 0.15s, box-shadow 0.15s",
        transform: selected ? "scale(1.02)" : "scale(1)",
        boxShadow: selected ? "0 0 0 3px rgba(24,95,165,0.15)" : "none",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "3/2", overflow: "hidden", background: "#111" }}>
        <img
          src={imageUrl}
          alt={stock.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: stock.css }}
        />
        {stock.tint && (
          <div style={{ position: "absolute", inset: 0, background: stock.tint, mixBlendMode: "multiply", pointerEvents: "none" }} />
        )}
        {/* subtle scan-line grain */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.4,
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.015) 2px, rgba(0,0,0,0.015) 4px)",
        }} />
        <span style={{
          position: "absolute", top: 8, left: 8,
          fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
          background: tc.bg, color: tc.text, letterSpacing: "0.03em",
        }}>
          {stock.tag}
        </span>
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111" }}>{stock.name}</p>
        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#888" }}>{stock.description}</p>
      </div>
    </div>
  );
}

function Modal({ stocks, currentIndex, imageUrl, onClose, onNavigate }) {
  const stock = stocks[currentIndex];
  const touchStartX = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") onNavigate((currentIndex + 1) % stocks.length);
      else if (e.key === "ArrowLeft") onNavigate((currentIndex - 1 + stocks.length) % stocks.length);
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentIndex, stocks.length, onNavigate, onClose]);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      onNavigate(dx < 0
        ? (currentIndex + 1) % stocks.length
        : (currentIndex - 1 + stocks.length) % stocks.length);
    }
    touchStartX.current = null;
  };

  const navBtn = (label, onClick) => (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        position: "absolute", top: "50%", transform: "translateY(-50%)",
        background: "rgba(0,0,0,0.45)", border: "none", borderRadius: "50%",
        color: "#fff", width: 40, height: 40, fontSize: 20, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(4px)", flexShrink: 0,
        ...(label === "‹" ? { left: -20 } : { right: -20 }),
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 100,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 700, position: "relative" }}>
        {navBtn("‹", () => onNavigate((currentIndex - 1 + stocks.length) % stocks.length))}
        {navBtn("›", () => onNavigate((currentIndex + 1) % stocks.length))}

        <div style={{ borderRadius: 10, overflow: "hidden", position: "relative" }}>
          <img
            src={imageUrl}
            alt={stock.name}
            style={{ width: "100%", display: "block", filter: stock.css, maxHeight: "72vh", objectFit: "contain" }}
          />
          {stock.tint && (
            <div style={{ position: "absolute", inset: 0, background: stock.tint, mixBlendMode: "multiply", pointerEvents: "none" }} />
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
          <div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#fff" }}>{stock.name}</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{stock.description}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
              {currentIndex + 1} / {stocks.length}
            </span>
            <button
              onClick={onClose}
              style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 6, color: "#fff", padding: "7px 16px", fontSize: 13, cursor: "pointer" }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Dot indicators */}
        <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 12 }}>
          {stocks.map((s, i) => (
            <div
              key={s.id}
              onClick={(e) => { e.stopPropagation(); onNavigate(i); }}
              style={{
                width: i === currentIndex ? 16 : 6, height: 6, borderRadius: 3,
                background: i === currentIndex ? "#fff" : "rgba(255,255,255,0.3)",
                cursor: "pointer", transition: "all 0.2s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [imageUrl, setImageUrl] = useState(null);
  const [selected, setSelected] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef();

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setImageUrl(e.target.result);
    reader.readAsDataURL(file);
    setSelected(null);
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const selectedStock = FILM_STOCKS.find((s) => s.id === selected);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f4f0", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {["#E24B4A","#EF9F27","#639922"].map((c) => (
              <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#111", letterSpacing: "-0.02em" }}>
            Film Simulation Studio
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#888" }}>
            Preview your photo across 8 Fujifilm film stocks
          </p>
        </div>

        {/* Upload zone */}
        {!imageUrl ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current.click()}
            style={{
              border: dragging ? "2px dashed #185FA5" : "2px dashed #ccc",
              borderRadius: 14,
              padding: "4rem 2rem",
              textAlign: "center",
              cursor: "pointer",
              background: dragging ? "rgba(24,95,165,0.03)" : "#fff",
              transition: "all 0.15s",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#111" }}>Drop a photo here</p>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#aaa" }}>or tap to browse — JPG, PNG, WebP</p>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
          </div>
        ) : (
          <>
            {/* Change photo button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 12, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                {FILM_STOCKS.length} simulations — tap to expand
              </p>
              <button
                onClick={() => fileInputRef.current.click()}
                style={{ fontSize: 12, padding: "5px 12px", cursor: "pointer", borderRadius: 6, border: "1px solid #ddd", background: "#fff", color: "#555" }}
              >
                Change photo
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
            </div>

            {/* Film grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 14 }}>
              {FILM_STOCKS.map((stock) => (
                <FilmCard
                  key={stock.id}
                  stock={stock}
                  imageUrl={imageUrl}
                  selected={selected === stock.id}
                  onClick={() => setSelected(stock.id === selected ? null : stock.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {selected && imageUrl && selectedStock && (
        <Modal
          stocks={FILM_STOCKS}
          currentIndex={FILM_STOCKS.findIndex((s) => s.id === selected)}
          imageUrl={imageUrl}
          onClose={() => setSelected(null)}
          onNavigate={(i) => setSelected(FILM_STOCKS[i].id)}
        />
      )}
    </div>
  );
}
