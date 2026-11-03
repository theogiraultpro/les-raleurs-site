import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import RingSurUnRing from "./pages/RingSurUnRing";
import FestivalPage from "./pages/FestivalPage";
import HostilesPage from "./pages/HostilesPage";
import ParisEstPage from "./pages/ParisEstPage";
import TeufPage from "./pages/TeufPage";
import RaleursPage from "./pages/RaleursPage";
import RaleursMetroPage from "./pages/RaleursMetroPage";
import RaleursBarPage from "./pages/RaleursBarPage";
import Rave99Page from "./pages/Rave99Page";
import OffScreenPage from "./pages/OffScreenPage";
import AboutPage from "./pages/AboutPage";
import CommissionsPage from "./pages/CommissionsPage";
import GraphismePage from "./pages/GraphismePage";
import LadalEvent2Page from "./pages/LadalEvent2Page";
import LadalEvent1Page from "./pages/LadalEvent1Page";
import CollectifAttunedPage from "./pages/CollectifAttunedPage";
import TNFPage from "./pages/TNFPage";
import FixeLeMouvementPage from "./pages/FixeLeMouvementPage";
import SolvayPage from "./pages/SolvayPage";
import RaleursGraffPage from "./pages/RaleursGraffPage";
import MentionsLegalesPage from "./pages/MentionsLegalesPage";
import CGVPage from "./pages/CGVPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LandingPage },
      { path: "illustrations", Component: Home },
      { path: "ring", Component: RingSurUnRing },
      { path: "festival", Component: FestivalPage },
      { path: "hostiles", Component: HostilesPage },
      { path: "paris-est", Component: ParisEstPage },
      { path: "teuf", Component: TeufPage },
      { path: "raleurs", Component: RaleursPage },
      { path: "metro", Component: RaleursMetroPage },
      { path: "bar", Component: RaleursBarPage },
      { path: "graff", Component: RaleursGraffPage },
      { path: "rave-99", Component: Rave99Page },
      { path: "off-screen", Component: OffScreenPage },
      { path: "ladal-event-2", Component: LadalEvent2Page },
      { path: "ladal-event-1", Component: LadalEvent1Page },
      { path: "collectif-attuned", Component: CollectifAttunedPage },
      { path: "tnf", Component: TNFPage },
      { path: "ligne-81", Component: FixeLeMouvementPage },
      { path: "la-friche-de-solvay", Component: SolvayPage },
      { path: "about", Component: AboutPage },
      { path: "commissions", Component: CommissionsPage },
      { path: "graphisme", Component: GraphismePage },
      { path: "mentions-legales", Component: MentionsLegalesPage },
      { path: "cgv", Component: CGVPage },
    ],
  },
]);
