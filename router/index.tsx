import { Home } from "@/modules/home";
import { AppHeader } from "@/modules/layout/AppHeader";
import { Upload } from "@/modules/upload";
import { HashRouter, Route, Routes } from "react-router-dom";

export const AppRouter = () => (
  <HashRouter>
    <Routes>
      <Route path={"/"} element={<Home />} />
      <Route path={"/upload"} element={<Upload />} />
    </Routes>
  </HashRouter>
);
