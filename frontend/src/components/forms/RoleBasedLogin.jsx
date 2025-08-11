import { useState } from "react";
import FacultyAuth from "../auth/FacultyAuth";
import HODAuth from "../auth/HODAuth";
import AdminAuth from "../auth/AdminAuth";
import Button from "../ui/Button";

const RoleBasedLogin = () => {
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    { key: 'faculty', label: 'Faculty', color: 'bg-blue-500 hover:bg-blue-600' },
    { key: 'hod', label: 'HOD', color: 'bg-green-500 hover:bg-green-600' },
    { key: 'admin', label: 'Admin', color: 'bg-red-500 hover:bg-red-600' }
  ];

  if (!selectedRole) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center mb-6">Select User Type</h2>
        <div className="space-y-3">
          {roles.map(role => (
            <button
              key={role.key}
              onClick={() => setSelectedRole(role.key)}
              className={`w-full py-3 px-4 text-white font-medium rounded-lg transition-colors duration-200 ${role.color}`}
            >
              {role.label} Login/Signup
            </button>
          ))}
        </div>
      </div>
    );
  }

  const renderAuthForm = () => {
    switch (selectedRole) {
      case 'faculty':
        return <FacultyAuth />;
      case 'hod':
        return <HODAuth />;
      case 'admin':
        return <AdminAuth />;
      default:
        return null;
    }
  };

  return (
    <div>
      <Button 
        onClick={() => setSelectedRole(null)} 
        variant="secondary" 
        className="mb-4 text-sm"
      >
        ← Back to Role Selection
      </Button>
      {renderAuthForm()}
    </div>
  );
};

export default RoleBasedLogin;