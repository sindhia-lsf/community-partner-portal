import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import MediaLibrary from "./pages/MediaLibrary";
import MyEvent from "./pages/MyEvent";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import OrganizerEventDetail from "./pages/OrganizerEventDetail";
import OrganizerEvents from "./pages/OrganizerEvents";
import OrganizerLogin from "./pages/OrganizerLogin";
import OrganizerMediaDetail from "./pages/OrganizerMediaDetail";
import OrganizerMedia from "./pages/OrganizerMedia";
import OrganizerSocialDetail from "./pages/OrganizerSocialDetail";
import OrganizerSocial from "./pages/OrganizerSocial";
import SocialRequests from "./pages/SocialRequests";
import Updates from "./pages/Updates";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/my-event"} component={MyEvent} />
      <Route path={"/media-library"} component={MediaLibrary} />
      <Route path={"/social-requests"} component={SocialRequests} />
      <Route path={"/updates"} component={Updates} />
      <Route path={"/login"} component={OrganizerLogin} />
      <Route path={"/organizer/login"} component={OrganizerLogin} />
      <Route path={"/organizer"} component={OrganizerDashboard} />
      <Route path={"/organizer/events/:id"} component={OrganizerEventDetail} />
      <Route path={"/organizer/events"} component={OrganizerEvents} />
      <Route path={"/organizer/media/:id"} component={OrganizerMediaDetail} />
      <Route path={"/organizer/media"} component={OrganizerMedia} />
      <Route path={"/organizer/social/:id"} component={OrganizerSocialDetail} />
      <Route path={"/organizer/social"} component={OrganizerSocial} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
