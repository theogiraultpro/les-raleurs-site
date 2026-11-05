import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage";
import CommissionsPage from "./pages/CommissionsPage";
import GraphismePage from "./pages/GraphismePage";
import MentionsLegalesPage from "./pages/MentionsLegalesPage";
import CGVPage from "./pages/CGVPage";
import EntryPage from "./pages/EntryPage";

export const router = createBrowserRouter([
  // Page de gestion, chargée seulement quand on y va (rien de plus à télécharger pour les visiteurs)
  { path: "/admin", lazy: async () => ({ Component: (await import("./admin/AdminPage")).default }) },
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LandingPage },
      { path: "illustrations", Component: Home },
      { path: "about", Component: AboutPage },
      { path: "commissions", Component: CommissionsPage },
      { path: "graphisme", Component: GraphismePage },
      { path: "mentions-legales", Component: MentionsLegalesPage },
      { path: "cgv", Component: CGVPage },
      // Œuvres et projets : lesraleurs.com/<slug>, voir content/defaultContent.ts
      { path: ":slug", Component: EntryPage },
      { path: "*", Component: EntryPage },
    ],
  },
]);
