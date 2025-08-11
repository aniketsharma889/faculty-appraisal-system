import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import FacultyDashboard from "./pages/faculty/Dashboard";
import SubmitAppraisal from "./pages/faculty/SubmitAppraisal";
import ViewAppraisals from "./pages/faculty/ViewAppraisals";
import EditAppraisal from "./pages/faculty/EditAppraisal";
import FacultyProfile from "./pages/faculty/Profile";
import EditProfile from "./pages/faculty/EditProfile";
import HODDashboard from "./pages/hod/Dashboard";
import HODViewAppraisals from "./pages/hod/ViewAppraisals";
import HODReviewAppraisal from "./pages/hod/ReviewAppraisal";
import AdminDashboard from "./pages/admin/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/submit-appraisal" element={<SubmitAppraisal />} />
        <Route path="/faculty/view-appraisals" element={<ViewAppraisals />} />
        <Route path="/faculty/edit-appraisal/:id" element={<EditAppraisal />} />
        <Route path="/faculty/profile" element={<FacultyProfile />} />
        <Route path="/faculty/edit-profile/:id" element={<EditProfile />} />
        <Route path="/hod/dashboard" element={<HODDashboard />} />
        <Route path="/hod/view-appraisals" element={<HODViewAppraisals />} />
        <Route path="/hod/appraisal/:id" element={<HODReviewAppraisal />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
