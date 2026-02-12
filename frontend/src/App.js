import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import SellPage from "@/pages/SellPage";
import PriceRevealPage from "@/pages/PriceRevealPage";
import BuyPage from "@/pages/BuyPage";
import PhoneDetailPage from "@/pages/PhoneDetailPage";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sell" element={<SellPage />} />
          <Route path="/sell/price" element={<PriceRevealPage />} />
          <Route path="/buy" element={<BuyPage />} />
          <Route path="/buy/:id" element={<PhoneDetailPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
