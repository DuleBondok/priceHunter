import "./App.css";
import Homepage from "./Homepage";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminPage from "./AdminPage";
import MatchesPage from "./MatchesPage";
import IndividualScrapePage from "./IndividualScrapePage";
import DairyCategory from "./DairyCategory";
import SearchResults from "./SearchResults";
import ScrapingPage from "./ScrapingPage";
import AdminReceiptVerificationPage from "./AdminReceiptVerificationPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/matches" element={<MatchesPage />} />
        <Route
          path="/admin/receipt-verification"
          element={<AdminReceiptVerificationPage />}
        />
        <Route path="/admin/scrape-stores" element={<IndividualScrapePage />} />
        <Route path="/admin/complete-scrape" element={<ScrapingPage />} />
        <Route
          path="/scraping"
          element={<Navigate to="/admin/complete-scrape" replace />}
        />
        <Route path="/dairyCategory" element={<DairyCategory />} />
        <Route path="/search" element={<SearchResults />} />
      </Routes>
    </Router>
  );
}

export default App;