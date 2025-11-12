import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import InfoPage from "./pages/InfoPage";
import PostcardPage from "./pages/PostcardPage";
import BookPage from "./pages/BookPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<InfoPage />} />
        <Route path="/postcard" element={<PostcardPage />} />
        <Route path="/book" element={<BookPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}