import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminPage from "./AdminPage";
import MatchesPage from "./MatchesPage";
import NewProductsMatchesPage from "./NewProductsMatchesPage";
import IndividualScrapePage from "./IndividualScrapePage";
import ScrapingPage from "./ScrapingPage";
import AdminReceiptVerificationPage from "./AdminReceiptVerificationPage";
import ImageManagerPage from "./ImageManagerPage";
import DuplicateStoreLinksPage from "./DuplicateStoreLinksPage";
import LoginPage from "./LoginPage";
import RequireAuth from "./RequireAuth";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/matches"
          element={
            <RequireAuth>
              <MatchesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/new-product-matches"
          element={
            <RequireAuth>
              <NewProductsMatchesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/receipt-verification"
          element={
            <RequireAuth>
              <AdminReceiptVerificationPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/scrape-stores"
          element={
            <RequireAuth>
              <IndividualScrapePage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/complete-scrape"
          element={
            <RequireAuth>
              <ScrapingPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/image-manager"
          element={
            <RequireAuth>
              <ImageManagerPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/duplicate-store-links"
          element={
            <RequireAuth>
              <DuplicateStoreLinksPage />
            </RequireAuth>
          }
        />
        <Route
          path="/scraping"
          element={<Navigate to="/admin/complete-scrape" replace />}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
