import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import ArticlePage from "./pages/ArticlePage";
import SearchPage from "./pages/SearchPage";
import PhotoGalleryPage from "./pages/PhotoGalleryPage";
import VideoGalleryPage from "./pages/VideoGalleryPage";
import AuthorsPage from "./pages/AuthorsPage";
import AuthorDetailPage from "./pages/AuthorDetailPage";
import EventsPage from "./pages/EventsPage";
import MuhabirimizPage from "./pages/MuhabirimizPage";
import ArsivPage from "./pages/ArsivPage";
// Admin
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminArticlesList from "./pages/admin/ArticlesList";
import AdminArticleEditor from "./pages/admin/ArticleEditor";
import AdminComments from "./pages/admin/CommentsModeration";
import AdminReports from "./pages/admin/ReportsModeration";
import AdminUsers from "./pages/admin/UsersList";
import AdminIssues from "./pages/admin/IssuesList";
import AdminAudit from "./pages/admin/AuditLog";

function Router() {
  return (
    <Switch>
      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/articles" component={AdminArticlesList} />
      <Route path="/admin/articles/new" component={AdminArticleEditor} />
      <Route path="/admin/articles/:id/edit" component={AdminArticleEditor} />
      <Route path="/admin/comments" component={AdminComments} />
      <Route path="/admin/reports" component={AdminReports} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/issues" component={AdminIssues} />
      <Route path="/admin/audit" component={AdminAudit} />

      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/kategori/:slug" component={CategoryPage} />
      <Route path="/haber/:slug" component={ArticlePage} />
      <Route path="/arama" component={SearchPage} />
      <Route path="/foto-galeri" component={PhotoGalleryPage} />
      <Route path="/video-galeri" component={VideoGalleryPage} />
      <Route path="/yazarlar" component={AuthorsPage} />
      <Route path="/yazar/:id" component={AuthorDetailPage} />
      <Route path="/etkinlikler" component={EventsPage} />
      <Route path="/muhabirimiz-ol" component={MuhabirimizPage} />
      <Route path="/arsiv" component={ArsivPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <AccessibilityProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
