import { useEffect, useRef, useState ,useLayoutEffect , useCallback} from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Group, Text } from "react-konva";
import useImage from "use-image";
type GalleryItem = { src: string; name: string };

// แก้ชื่อหมวดได้ตามต้องการ
const CATEGORY_GLOBS: Record<string, Record<string, any>> = {
  "หมวด 1": import.meta.glob("../assets/images1/*.{png,jpg,jpeg,gif,svg}", { eager: true }),
  "หมวด 2": import.meta.glob("../assets/images2/*.{png,jpg,jpeg,gif,svg}", { eager: true }),
  // ตัวอย่างเพิ่มหมวด:
  // "หมวด 3": import.meta.glob("./assets/images3/*.{png,jpg,jpeg,gif,svg}", { eager: true }),
};

const GALLERIES: Record<string, GalleryItem[]> = Object.fromEntries(
  Object.entries(CATEGORY_GLOBS).map(([cat, mods]) => {
    const arr: GalleryItem[] = Object.entries(mods).map(([path, mod]: any) => ({
      src: mod.default,
      name: path.split("/").pop() || "image",
    }));
    // เรียงตามชื่อไฟล์ (สวยงามขึ้น)
    arr.sort((a, b) => a.name.localeCompare(b.name));
    return [cat, arr];
  })
);

/* =========================
   2) ประเภทของชิ้นงานบนโปสการ์ด (ใช้ width/height แทน scale)
========================= */
type Item = {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

/* =========================
   3) คอมโพเนนต์รูปบนแคนวาส (ย่อ/ขยาย/หมุนได้แบบเสถียร)
========================= */
function CanvasImage({
  item,
  isSelected,
  onSelect,
  onChange,
  onDelete,          // <-- เพิ่ม prop นี้
}: {
  item: Item;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (attrs: Partial<Item>) => void;
  onDelete: () => void;         // <-- เพิ่ม type นี้
}) {
  const [image] = useImage(item.src);
  const groupRef = useRef<any>(null);
  const imageRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  // ตั้งขนาดเริ่มต้นเมื่อรูปโหลดเสร็จ (ครั้งเดียว)
  useEffect(() => {
    if (!image) return;
    const INIT_W = 300, INIT_H = 200;
    const isInitial =
      Math.abs(item.width - INIT_W) < 1 && Math.abs(item.height - INIT_H) < 1;
    if (isInitial) {
      const maxW = 360;
      const scale = Math.min(maxW / image.width, 1);
      const w = Math.max(50, image.width * scale);
      const h = Math.max(50, image.height * scale);
      onChange({ width: w, height: h });
    }
  }, [image]);

  // ผูก Transformer กับกลุ่ม
  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Group
        ref={groupRef}
        x={item.x}
        y={item.y}
        rotation={item.rotation}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const g = groupRef.current;
          const img = imageRef.current;
          const newW = Math.max(50, img.width() * g.scaleX());
          const newH = Math.max(50, img.height() * g.scaleY());
          onChange({
            x: g.x(),
            y: g.y(),
            rotation: g.rotation(),
            width: newW,
            height: newH,
          });
          g.scaleX(1);
          g.scaleY(1);
        }}
      >
        {/* รูป */}
        <KonvaImage ref={imageRef} image={image} x={0} y={0} width={item.width} height={item.height} />

        {/* ปุ่มลบ: มุมซ้ายบน (ทับขอบนิด ๆ) */}
         {isSelected && (
            <Group
              x={0}
              y={0}
              onClick={(e) => {
                e.cancelBubble = true;
                onDelete();
              }}
              onTap={(e) => {
                e.cancelBubble = true;
                onDelete();
              }}
            >
              <Rect x={-10} y={-10} width={22} height={22} fill="#ef4444" cornerRadius={6} shadowBlur={2} />
              <Text x={-6} y={-8} text="✕" fontSize={14} fill="#fff" />
            </Group>
          )}
      </Group>

      {isSelected && (
        <Transformer
          ref={trRef}
          keepRatio
          flipEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            const MIN = 50;
            const MAX = 4000;
            if (newBox.width < MIN || newBox.height < MIN) return oldBox;
            if (newBox.width > MAX || newBox.height > MAX) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
}

/* =========================
   4) แอปหลัก
========================= */
export default function App() {
  const postcardWidth = 900;
  const postcardHeight = 600;
  const stageRef = useRef<any>(null);
  
  // ✅ สำหรับ responsive
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [stageSize, setStageSize] = useState({ width: 900, height: 600 });
  const [showQuizMessage, setShowQuizMessage] = useState(false);

  // คำนวณสเกลตามความกว้าง container
  useLayoutEffect(() => {
  const fit = () => {
    const vw = Math.min(window.innerWidth - 24, postcardWidth);
    const s = Math.min(vw / postcardWidth, 1); // ย่อเมื่อจอเล็ก, ไม่ขยายเกิน 1
    setScale(s);
    setStageSize({ width: postcardWidth * s, height: postcardHeight * s });
  };
  fit();
  window.addEventListener("resize", fit);
  return () => window.removeEventListener("resize", fit);
}, [postcardWidth, postcardHeight]);
  
  const [items, setItems] = useState<Item[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false); // เพิ่ม state สำหรับการยืนยัน

    // forceUpdate function
  const forceUpdate = useCallback(() => {
    setSelectedId((prev) => prev); // Trigger re-render immediately
  }, []); 

  // หมวดที่ active
  const categoryNames = Object.keys(GALLERIES);
  const [activeCat, setActiveCat] = useState<string>(categoryNames[0] || "");

  // --- pagination settings ---
const pageSize = 3;

// เก็บ index เริ่มของแต่ละหมวด
const [catIndex, setCatIndex] = useState<Record<string, number>>(
  Object.fromEntries(categoryNames.map((c) => [c, 0]))
);

// คืนรูป "3 รูป" ตามหน้าปัจจุบันของหมวด
function visibleGallery(cat: string) {
  const arr = GALLERIES[cat] || [];
  if (!arr.length) return [];
  const start = ((catIndex[cat] ?? 0) % arr.length + arr.length) % arr.length;
  const out: typeof arr = [];
  const limit = Math.min(pageSize, arr.length);
  for (let i = 0; i < limit; i++) out.push(arr[(start + i) % arr.length]);
  return out;
}

// ปุ่มเลื่อนซ้าย/ขวา (หมวดเดียวกัน)
function prev(cat: string) {
  const arr = GALLERIES[cat] || [];
  if (!arr.length) return;
  setCatIndex((p) => ({ ...p, [cat]: ((p[cat] ?? 0) - pageSize + arr.length) % arr.length }));
}
function next(cat: string) {
  const arr = GALLERIES[cat] || [];
  if (!arr.length) return;
  setCatIndex((p) => ({ ...p, [cat]: ((p[cat] ?? 0) + pageSize) % arr.length }));
}

  const addImage = (src: string) => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        src,
        x: 200,
        y: 150,
        width: 300, // ค่าตั้งต้น (จะถูกปรับหลังรูปโหลดเสร็จ)
        height: 200,
        rotation: 0,
      },
    ]);
    
  };

  const exportAsImage = () => {
    // ถ้า Stage ถูกย่อด้วย scale < 1 ให้ขยาย pixelRatio ชดเชย
    const pr = Math.max(2, Math.round(2 / Math.max(scale, 0.001)));
    const uri = stageRef.current.toDataURL({ pixelRatio: pr });
    const a = document.createElement("a");
    a.href = uri;
    a.download = `postcard-${Date.now()}.png`;
    a.click();

        // ✅ หลังจากดาวน์โหลดเสร็จ ให้ขึ้นข้อความ
    setTimeout(() => {
      setShowQuizMessage(true);
    }, 800); // หน่วงนิดนึงเพื่อให้แน่ใจว่าภาพโหลดแล้ว
  };

  
  const handleSaveClick = () => {
    if (isConfirming) {
      // เมื่อคลิกครั้งที่สอง: ยกเลิกการเลือกและเซฟภาพ
      setSelectedId(null);  // ยกเลิกการเลือก
      forceUpdate();        // force re-render immediately
      exportAsImage();      // เซฟภาพ
    } else {
      // เมื่อคลิกครั้งแรก: ยกเลิกกรอบ Transformer และแสดงข้อความให้ยืนยัน
      setSelectedId(null);  // ยกเลิกการเลือก
      setIsConfirming(true); // เปลี่ยนเป็นโหมดยืนยัน
      setTimeout(() => setIsConfirming(false), 3000); // รีเซ็ตยืนยันหลัง 3 วินาที
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 p-4 "
    style={{
    background: `
      linear-gradient(193deg, rgba(234, 210, 174, 0.20) 0%, rgba(222, 187, 141, 0.20) 100%),
      linear-gradient(239deg, rgba(222, 187, 141, 0) 0%, rgba(222, 187, 141, 0) 100%),
      radial-gradient(ellipse 50% 50% at 50% 50%, rgba(237, 218, 188, 0) 0%, #EAD2AE 100%),
      rgba(236, 213, 179, 0.34)
    `,
  }}>
      <h1 className="text-3xl font-bold text-gray-800 mt-2 text-center">ออกแบบโปสการ์ด</h1>

      {/* ปุ่มเครื่องมือ */}
      <div className="flex gap-2">
        <button
          className="px-4 py-2 rounded bg-blue-500 text-black hover:bg-blue-600 "
        onClick={handleSaveClick}
      >
        {isConfirming ? "Click again to confirm" : "Save PNG"}
        </button>

          {selectedId && (
    <button
      className="px-4 py-2 rounded bg-red-500 text-black hover:bg-red-600"
      onClick={() =>
        setItems((prev) => prev.filter((i) => i.id !== selectedId))
      }
    >
      Delete
    </button>
  )}
      </div>

      {/* พื้นที่โปสการ์ด */}
{/* พื้นที่โปสการ์ด (responsive) */}
    <div
  ref={containerRef}
  className="w-full mx-auto flex justify-center touch-none border rounded-lg shadow bg-white px-2 sm:px-4"
  style={{ maxWidth: `min(${postcardWidth}px, 100vw - 16px)` }}
>
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale}
        scaleY={scale}
        onMouseDown={(e) => {
          const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === "bg";
          if (clickedOnEmpty) setSelectedId(null);
        }}
        onTouchStart={(e) => {
          const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === "bg";
          if (clickedOnEmpty) setSelectedId(null);
        }}
      >
        <Layer>
          <Rect
            x={0}
            y={0}
            width={postcardWidth}
            height={postcardHeight}
            fill="#F3F3F3"
            cornerRadius={12}
            shadowBlur={5}
            name="bg"
          />
          {items.map((item) => (
            <CanvasImage
              key={item.id}
              item={item}
              isSelected={item.id === selectedId}
              onSelect={() => setSelectedId(item.id)}
              onChange={(attrs) =>
                setItems((prev) =>
                  prev.map((it) => (it.id === item.id ? { ...it, ...attrs } : it))
                )
              }
              onDelete={() => setItems((prev) => prev.filter((it) => it.id !== item.id))}
            />
          ))}
        </Layer>
      </Stage>
    </div>

      {/* ===== แถบเลือกหมวด (Tabs) ===== */}
      <div className="flex gap-2 mt-2">
        {categoryNames.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={[
              "px-3 py-1.5 rounded-full border",
              activeCat === cat
                ? "bg-blue-600 text-black border-black-600"
                : "bg-white text-gray-700 hover:bg-gray-50",
            ].join(" ")}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* แกลเลอรี: แสดงตามหมวดที่เลือก */}
  <div className="flex items-center gap-3 mt-2">

  {/* แกลเลอรี: แนวนอนเลื่อนบนมือถือ */}
  <div className="w-full max-w-[900px] overflow-x-auto pb-2">
    <div className="flex gap-3 w-max">
      {visibleGallery(activeCat).map(({ src, name }) => (
        <button
          key={src}
          title={name}
          onClick={() => addImage(src)}
          className="border rounded hover:shadow-md p-1 bg-white min-w-24"
        >
          <img src={src} className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover rounded" />
        </button>
      ))}
    </div>   
  </div>
</div>

      {/* ลูกศรเลื่อน ซ้าย-ขวา */}
  <div className="flex gap-4 justify-center mt-1">
    <button
      onClick={() => prev(activeCat)}
      className="px-4 py-2 border rounded bg-white hover:bg-gray-50 shadow"
      aria-label="Previous"
    >
      ←
    </button>
    <button
      onClick={() => next(activeCat)}
      className="px-4 py-2 border rounded bg-white hover:bg-gray-50 shadow"
      aria-label="Next"
    >
      →
    </button>
  </div>
      {showQuizMessage && (
  <div className="mt-6 text-center animate-fade-in">
    <p className="text-xl font-semibold text-gray-800 mb-2">
      ✅ รูปถูกบันทึกเรียบร้อยแล้ว!
    </p>
<button
  className="px-5 py-2 bg-blue-500 text-black rounded-lg shadow hover:bg-blue-600 transition"
  onClick={() => window.open("https://docs.google.com/forms/d/e/1FAIpQLScSmsP0ebCpapNuxLK0QuhL-9cuuoFmzgxdNF1R_RU2Ek4OBw/viewform?usp=publish-editor", "_blank")}
>
  ทำแบบทดสอบต่อ ➜
</button>
  </div>
)}
    </div>
    
  );
}
