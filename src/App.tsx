import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminLayout from "./AdminLayout";
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
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminPage />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="new-product-matches" element={<NewProductsMatchesPage />} />
          <Route path="receipt-verification" element={<AdminReceiptVerificationPage />} />
          <Route path="scrape-stores" element={<IndividualScrapePage />} />
          <Route path="complete-scrape" element={<ScrapingPage />} />
          <Route path="image-manager" element={<ImageManagerPage />} />
          <Route path="duplicate-store-links" element={<DuplicateStoreLinksPage />} />
        </Route>
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
