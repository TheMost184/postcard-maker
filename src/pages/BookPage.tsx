import { useMemo, useRef, useEffect, useState } from "react";
import HTMLFlipBook from "react-pageflip";

/** ดึงรูปทั้งหมดจากโฟลเดอร์ assets/book แล้วเรียงตามชื่อไฟล์ */
const useBookPages = () => {
  const mods = import.meta.glob("../assets/book/*.{png,jpg,jpeg}", {
    eager: true,
    query: "?url",           // ให้ Vite คืนเป็น URL พร้อมใช้
  }) as Record<string, { default: string }>;
  const pages = Object.entries(mods)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, m]) => m.default);
  return pages;
};

export default function BookPage() {
  const pages = useBookPages();
  const [size, setSize] = useState({ w: 500, h: 700 });
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = Math.min(vw - 20, Math.round(vh * 0.8));
      const h = Math.round(w * 1.4);
      setSize({ w, h });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const handlePageFlip = (e: any) => {
    setCurrentPage(e.data.pageIndex);
  };

  return (
    <>
      {/* พื้นหลังเคลื่อนไหว = เลเยอร์แยก อยู่หลังทุกอย่าง */}
      <div className="fixed inset-0 -z-10 bg-animated-gradient pointer-events-none" />

      {/* เนื้อหา */}
      <div ref={containerRef} className="min-h-dvh flex items-center justify-center p-4">
        <div className="shadow-2xl rounded-lg overflow-hidden bg-white">
          <HTMLFlipBook
          width={size.w}
          height={size.h}
          showCover={true}
          maxShadowOpacity={0.3}
          className="book"
          useMouseEvents={true}  // คลิกที่มุมเพื่อพลิกได้
          swipeDistance={30}     // ปัดบนมือถือได้
          style={{ width: `${size.w}px`, height: `${size.h}px` }} // กำหนดขนาดให้เหมาะสม
          startPage={currentPage}  // ตั้งค่าหน้าเริ่มต้นจาก state
          minWidth={200}         // กำหนดขนาดหน้าให้เล็กที่สุด
          size="fixed"           // กำหนดขนาดเป็น "fixed"
          maxWidth={1000}        // ขนาดสูงสุดของหน้า
          minHeight={400}        // ขนาดต่ำสุดของหน้า
          maxHeight={800}        // ขนาดสูงสุดของหน้า
          drawShadow={true}      // ให้เงาของหน้า
          flippingTime={500}     // เวลาในการพลิกหน้า (มิลลิวินาที)
          usePortrait={true}     // ใช้แนวตั้ง (portrait)
          startZIndex={10}       // ค่า z-index เริ่มต้นของหนังสือ
          autoSize={true}        // ขนาดของหน้าปรับเองตามขนาดหน้าจอ
          mobileScrollSupport={true}  // รองรับการเลื่อนบนมือถือ
          clickEventForward={true}    // ให้คลิกไปข้างหน้า
          showPageCorners={true}      // แสดงมุมของหน้า
          disableFlipByClick={false}  // ให้สามารถพลิกหน้าด้วยการคลิก
          onFlip={handlePageFlip}  // ตรวจสอบเมื่อพลิกหน้า
        >
            {pages.map((src, i) => (
              <div key={i} className="w-full h-full">
                <img src={src} alt={`page-${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </HTMLFlipBook>
        </div>
      </div>
    </>
  );
}

