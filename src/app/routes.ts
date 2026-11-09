import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Home from "./pages/Home";
import { createElement } from "react";
import { Navigate } from "react-router";
import { landingEnabled } from "./lib/landing";
import GraphismePage from "./pages/GraphismePage";
import EntryPage from "./pages/EntryPage";

export const router = createBrowserRouter([
  // Page de gestion, chargée seulement quand on y va (rien de plus à télécharger pour les visiteurs)
  { path: "/admin", lazy: async () => ({ Component: (await import("./admin/AdminPage")).default }) },
  {
    path: "/",
    Component: Root,
    children: [
      // Accueil : la bulle d'encre (site d'essai), ou directement les illustrations
      // (lesraleurs.com, tant que la bulle est mise de côté — voir lib/landing.ts).
      landingEnabled
        ? { index: true, lazy: async () => ({ Component: (await import("./pages/LandingPage")).default }) }
        : { index: true, Component: () => createElement(Navigate, { to: "/illustrations", replace: true }) },
      { path: "illustrations", Component: Home },
      { path: "about", lazy: async () => ({ Component: (await import("./pages/AboutPage")).default }) },
      { path: "commissions", lazy: async () => ({ Component: (await import("./pages/CommissionsPage")).default }) },
      { path: "graphisme", Component: GraphismePage },
      { path: "mentions-legales", lazy: async () => ({ Component: (await import("./pages/MentionsLegalesPage")).default }) },
      { path: "cgv", lazy: async () => ({ Component: (await import("./pages/CGVPage")).default }) },
      // Œuvres et projets : lesraleurs.com/<slug>, voir content/defaultContent.ts
      { path: ":slug", Component: EntryPage },
      { path: "*", Component: EntryPage },
    ],
  },
]);
