import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { EditorPage } from "./pages/EditorPage";
import { ConverterPage } from "./pages/ConverterPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<EditorPage />} />
          <Route path="/convert" element={<ConverterPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
