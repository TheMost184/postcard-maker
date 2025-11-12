// src/pages/InfoPage.tsx
import { Link } from "react-router-dom";

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-[#a47148] text-center p-8 flex flex-col items-center justify-center">
      <h1 className="font-kodchasan text-6xl font-bold text-[#fdf3e7] mb-4">อิ่วปึ่ง</h1>
      <p className="text-3xl text-[#fdf3e7] mb-10">จังหวัดภูเก็ต</p>

      {/* ปุ่มไปหน้าโปสการ์ด */}
<button
  className="mt-8 inline-block rounded-xl bg-white/90 px-6 py-3 font-semibold shadow hover:bg-blue-100 transition"
  onClick={() => window.open("https://docs.google.com/forms/d/e/1FAIpQLSewADoC5YWuUD_37VqBB3OUS_aOBZ07xTNvvDPYw8TRUfbtbA/viewform?usp=publish-editor", "_blank")}
>
  ทำแบบทดสอบ ➜
</button>
<p className="text-xl text-[#fdf3e7] mb-10"></p>
<p className="text-xl text-[#fdf3e7] mb-5"> ขอขอบคุณข้อมูลจาก</p>
<p className="text-xl text-[#fdf3e7] mb-5"> 1. กรมส่งเสริมวัฒนธรรม สำหรับข้อมูลเกี่ยวกับอาหารพื้นถิ่น อิ่วปึ่งจังหวัดภูเก็ต ในเอกสารแบบเสนอรายการอาหารเพื่อเข้ารับการคัดเลือก “๑ จังหวัด ๑ เมนู เชิดชูอาหารถิ่น” </p>
<p className="text-xl text-[#fdf3e7] mb-5"> 2. มรดกภูมิปัญญาทางวัฒนธรรมของชาติ สำหรับข้อมูลเกี่ยวกับ พิธีหมั่วโง๊ย (พิธีครบเดือน) </p>
    </div>
  );
}
