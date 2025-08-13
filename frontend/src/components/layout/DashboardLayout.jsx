import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "./Navigation";

const DashboardLayout = ({ children, allowedRole }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (!token || !storedUser) {
      navigate("/");
      return;
    }
    
    const userData = JSON.parse(storedUser);
    if (allowedRole && userData.role !== allowedRole) {
      navigate("/");
      return;
    }
    
    setUser(userData);
    setLoading(false);
  }, [navigate, allowedRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 transition-colors duration-300">
      <Navigation user={user} />
      <main className="py-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
