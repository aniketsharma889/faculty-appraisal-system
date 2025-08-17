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
import ManageFaculty from "./pages/hod/ManageFaculty";
import AdminViewAppraisals from "./pages/admin/ViewAppraisals";
import AdminReviewAppraisal from "./pages/admin/ReviewAppraisal";
import ManageUsers from "./pages/admin/ManageUsers";
import ViewUser from "./pages/admin/ViewUser";
import EditUser from "./pages/admin/EditUser";
import Departments from "./pages/admin/Departments";
import HODProfile from "./pages/hod/Profile";
import HODEditProfile from "./pages/hod/EditProfile";
import AdminProfile from "./pages/admin/Profile";
import AdminEditProfile from "./pages/admin/EditProfile";
import ViewAppraisalDetails from "./pages/faculty/ViewAppraisalDetails";
import HODReports from "./pages/hod/Reports";
import FacultyAppraisals from "./pages/hod/FacultyAppraisals";
import AdminAnalyticsDashboard from "./pages/admin/AdminAnalyticsDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/submit-appraisal" element={<SubmitAppraisal />} />
        <Route path="/faculty/view-appraisals" element={<ViewAppraisals />} />
        <Route path="/faculty/appraisal/:id" element={<ViewAppraisalDetails />} />
        <Route path="/faculty/edit-appraisal/:id" element={<EditAppraisal />} />
        <Route path="/faculty/profile" element={<FacultyProfile />} />
        <Route path="/faculty/edit-profile/:id" element={<EditProfile />} />
        {/* HOD Routes */}
        <Route path="/hod/dashboard" element={<HODDashboard />} />
        <Route path="/hod/view-appraisals" element={<HODViewAppraisals />} />
        <Route path="/hod/appraisal/:id" element={<HODReviewAppraisal />} />
        <Route path="/hod/manage-faculty" element={<ManageFaculty />} />
        <Route path="/hod/faculty/:facultyId/appraisals" element={<FacultyAppraisals />} />
        <Route path="/hod/reports" element={<HODReports />} />
        <Route path="/hod/profile" element={<HODProfile />} />
        <Route path="/hod/edit-profile/:id" element={<HODEditProfile />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/view-appraisals" element={<AdminViewAppraisals />} />
        <Route path="/admin/appraisal/:id" element={<AdminReviewAppraisal />} />
        <Route path="/admin/manage-users" element={<ManageUsers />} />
        <Route path="/admin/user/:id" element={<ViewUser />} />
        <Route path="/admin/departments" element={<Departments />} />
        <Route path="/admin/edit-user/:id" element={<EditUser />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/edit-profile/:id" element={<AdminEditProfile />} />
        <Route path="/admin/reports" element={<AdminAnalyticsDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
