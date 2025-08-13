import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { 
  ArrowLeft,
  User,
  Save,
  Shield,
  Crown,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ChevronDown
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import { getUserById, updateUserAsAdmin, promoteUser } from "../../utils/api";


const UserSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  role: Yup.string().oneOf(['faculty', 'hod'], 'Invalid role selected').required("Role is required"),
  employeeCode: Yup.string().required("Employee code is required"),
  department: Yup.string().required("Department is required")
});

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await getUserById(id);
      setUser(response.user);
    } catch (err) {
      setError(err.message || "Failed to fetch user details");
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-5 h-5 text-red-500" />;
      case 'hod':
        return <Crown className="w-5 h-5 text-purple-500" />;
      case 'faculty':
        return <GraduationCap className="w-5 h-5 text-blue-500" />;
      default:
        return <User className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRoleChangeAction = (currentRole, newRole) => {
    if (currentRole === newRole) return null;
    
    // Only faculty and HOD transitions allowed
    if (currentRole === 'faculty' && newRole === 'hod') {
      return { type: 'promotion', icon: TrendingUp, color: 'text-emerald-600' };
    } else if (currentRole === 'hod' && newRole === 'faculty') {
      return { type: 'demotion', icon: TrendingDown, color: 'text-amber-600' };
    }
    
    return null;
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsSubmitting(true);
    setError("");

    try {
      const roleChanged = values.role !== user.role;
      
      if (roleChanged) {
        // Use role change endpoint
        await promoteUser(id, {
          newRole: values.role,
          department: values.department,
          employeeCode: values.employeeCode
        });
      } else {
        // Use regular update endpoint
        await updateUserAsAdmin(id, values);
      }

      navigate(`/admin/user/${id}`, { 
        state: { message: "User updated successfully!" }
      });
    } catch (error) {
      setError(error.message || "Failed to update user");
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout allowedRole="admin">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">Loading user details...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !user) {
    return (
      <DashboardLayout allowedRole="admin">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
            <Button onClick={() => navigate('/admin/manage-users')} variant="secondary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRole="admin">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
            <div className="mb-4 sm:mb-0">
              <Button 
                onClick={() => navigate(`/admin/user/${id}`)} 
                variant="outline"
                className="mb-4 border-red-200 text-red-600 hover:bg-red-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to User Details
              </Button>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 flex items-center">
                <User className="w-8 h-8 mr-3 text-red-500" />
                Edit User
              </h1>
              <p className="text-gray-600 mt-2">Update user information and manage roles</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {user && (
            <Formik
              initialValues={{
                name: user.name || "",
                email: user.email || "",
                role: user.role || "faculty",
                employeeCode: user.employeeCode || "",
                department: user.department || ""
              }}
              validationSchema={UserSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, setFieldValue }) => {
                const roleChange = getRoleChangeAction(user.role, values.role);
                
                return (
                  <Form className="space-y-6">
                    {/* User Profile Header */}
                    <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-6 mb-8">
                      <div className="flex items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-base sm:text-xl font-bold text-gray-800">
                            Editing: {user.name}
                          </h2>
                          <div className="flex items-center mt-1">
                            {getRoleIcon(user.role)}
                            <span className="ml-2 text-gray-600 capitalize">
                              Current Role: {user.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Role Change Warning */}
                    {roleChange && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-amber-800">
                              Role Change Detected
                            </h4>
                            <p className="text-amber-700 text-sm mt-1">
                              You are {roleChange.type === 'promotion' ? 'promoting' : 'demoting'} this user from {user.role} to {values.role}.
                            </p>
                          </div>
                          <roleChange.icon className={`w-5 h-5 ml-auto ${roleChange.color}`} />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* Basic Information */}
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <Field
                          name="name"
                          type="text"
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          placeholder="Enter full name"
                        />
                        <ErrorMessage name="name" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <Field
                          name="email"
                          type="email"
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          placeholder="Enter email address"
                        />
                        <ErrorMessage name="email" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
                      </div>

                      {/* Enhanced Role Selection */}
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role *
                        </label>
                        <Field name="role">
                          {({ field }) => (
                            <div className="relative">
                              <select
                                {...field}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 
               rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 
               focus:border-red-500 transition-all duration-200 text-sm sm:text-base 
               appearance-none cursor-pointer hover:border-red-400 hover:bg-red-50"
                                onChange={(e) => {
                                  setFieldValue('role', e.target.value);
                                }}
                              >
                                <option value="faculty" className="py-2">
                                  👨‍🏫 Faculty Member
                                </option>
                                <option value="hod" className="py-2">
                                  👑 Head of Department (HOD)
                                </option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                              </div>
                            </div>
                          )}
                        </Field>
                        <ErrorMessage name="role" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
                      </div>

                      {/* Employee Code */}
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Employee Code *
                        </label>
                        <Field
                          name="employeeCode"
                          type="text"
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          placeholder="Enter employee code"
                        />
                        <ErrorMessage name="employeeCode" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
                      </div>

                      {/* Enhanced Department Selection */}
                      <div className="space-y-1 lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department *
                        </label>
                        <Field name="department">
                          {({ field }) => (
                            <div className="relative">
                              <select
                                {...field}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 
               rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 
               focus:border-red-500 transition-all duration-200 text-sm sm:text-base 
               appearance-none cursor-pointer hover:border-red-400 hover:bg-red-50"
                              >
                                <option value="" className="text-gray-500 py-2">
                                  🏢 Select Department
                                </option>
                                <optgroup label="🔬 Engineering & Technology">
                                  <option value="Computer Science" className="py-2">
                                    💻 Computer Science
                                  </option>
                                  <option value="Electronics & Communication" className="py-2">
                                    📡 Electronics & Communication
                                  </option>
                                  <option value="Mechanical Engineering" className="py-2">
                                    ⚙️ Mechanical Engineering
                                  </option>
                                  <option value="Civil Engineering" className="py-2">
                                    🏗️ Civil Engineering
                                  </option>
                                  <option value="Electrical Engineering" className="py-2">
                                    ⚡ Electrical Engineering
                                  </option>
                                  <option value="Information Technology" className="py-2">
                                    🌐 Information Technology
                                  </option>
                                  <option value="Chemical Engineering" className="py-2">
                                    🧪 Chemical Engineering
                                  </option>
                                  <option value="Biotechnology" className="py-2">
                                    🧬 Biotechnology
                                  </option>
                                </optgroup>
                                <optgroup label="📚 Sciences & Liberal Arts">
                                  <option value="Mathematics" className="py-2">
                                    🔢 Mathematics
                                  </option>
                                  <option value="Physics" className="py-2">
                                    ⚛️ Physics
                                  </option>
                                  <option value="Chemistry" className="py-2">
                                    🧪 Chemistry
                                  </option>
                                  <option value="English" className="py-2">
                                    📖 English
                                  </option>
                                </optgroup>
                                <optgroup label="💼 Management & Business">
                                  <option value="Management Studies" className="py-2">
                                    📊 Management Studies
                                  </option>
                                </optgroup>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                              </div>
                            </div>
                          )}
                        </Field>
                        <ErrorMessage name="department" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
                        <p className="text-xs text-gray-500 mt-1">
                          Select the department where this user will be assigned
                        </p>
                      </div>
                    </div>

                    {/* Role Information Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-6">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {getRoleIcon(values.role)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-blue-900 text-sm sm:text-base mb-2">
                            {values.role === 'hod' ? 'Head of Department' : 'Faculty Member'} Information
                          </h4>
                          <p className="text-blue-800 text-xs sm:text-sm leading-relaxed">
                            {values.role === 'hod' 
                              ? 'HODs have departmental administrative privileges and can review faculty appraisals within their department.'
                              : 'Faculty members can submit and manage their own performance appraisals.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                      <Button
                        type="button"
                        onClick={() => navigate(`/admin/user/${id}`)}
                        variant="secondary"
                        className="w-full sm:w-auto order-2 sm:order-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-red-500 hover:bg-red-600 w-full sm:w-auto order-1 sm:order-2 transition-all duration-200"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSubmitting ? "Updating..." : "Update User"}
                      </Button>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditUser;
