import { RouterProvider, createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import InteractiveQuiz from "./pages/InteractiveQuiz";
import Home from "./pages/Home";
import Map from "./pages/Map";
import Passport from "./pages/Passport";
import ARWalk from "./pages/ARWalk";
import Dashboard from "./pages/Dashboard";
import AdminHeatmap from "./pages/AdminHeatmap";
import Preserve from "./pages/Preserve";
import StoryDetail from "./pages/StoryDetail";
import Explore from "./pages/Explore";
import TraditionDetail from "./pages/TraditionDetail";
import VitalityDashboard from "./pages/VitalityDashboard";

import Virtual360Page from "./virtual360/Virtual360Page";
import TourGuidePage from "./tour-guide/TourGuidePage";
import PhotoDetection from "./pages/PhotoDetection";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "map", Component: Map },
      { path: "passport", Component: Passport },
      { path: "ar-walk", Component: ARWalk },
      { path: "tour-guide", Component: TourGuidePage },
      { path: "virtual-heritage", Component: Virtual360Page },
      { path: "dashboard", Component: Dashboard },
      { path: "dashboard/:id", Component: VitalityDashboard },
      { path: "admin-heatmap", Component: AdminHeatmap },
      { path: "preserve", Component: Preserve },
      { path: "story/:id", Component: StoryDetail },
      { path: "photo-detection", Component: PhotoDetection },
      { path: "explore", Component: Explore },
      { path: "explore/:id", Component: TraditionDetail },
    ],
  },
  { path: "/interactive-quiz", Component: InteractiveQuiz },
  { path: "/quiz", Component: InteractiveQuiz },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
