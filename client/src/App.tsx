import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Redirect, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Guidelines from "./pages/Guidelines";
import Login from "./pages/Login";
import MediaLibrary from "./pages/MediaLibrary";
import MyEvent from "./pages/MyEvent";
import Organizer from "./pages/Organizer";
import SocialRequests from "./pages/SocialRequests";
import Updates from "./pages/Updates";


function ProtectedRoutes() {
  const { loading, user } = useAuth();
  if (loading) return <main className="auth-page" aria-label="Loading portal" />;
  if (!user) return <Redirect to="/login" />;
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/my-event"} component={MyEvent} />
      <Route path={"/organizer"} component={Organizer} />
      <Route path={"/guidelines"} component={Guidelines} />
      <Route path={"/media-library"} component={MediaLibrary} />
      <Route path={"/social-requests"} component={SocialRequests} />
      <Route path={"/updates"} component={Updates} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route><ProtectedRoutes /></Route>
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
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
