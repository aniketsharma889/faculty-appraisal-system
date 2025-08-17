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
      <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="bg-white rounded-2xl shadow-xl p-0 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 via-red-700 to-orange-600 px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div>
                <Button 
                  onClick={() => navigate(`/admin/user/${id}`)} 
                  variant="outline"
                  className="mb-4 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to User Details
                </Button>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center">
                  <User className="w-8 h-8 mr-3 text-red-200" />
                  Edit User
                </h1>
                <p className="text-red-100 mt-2 text-sm sm:text-base">Update user information and manage roles</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 mx-4 mt-4">
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
                    {/* User Profile Card */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 mb-6 mx-4 mt-4 shadow-sm">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                          Editing: {user.name}
                        </h2>
                        <div className="flex items-center justify-center sm:justify-start mt-2 gap-2">
                          {getRoleIcon(user.role)}
                          <span className="px-3 py-1 rounded-full text-xs font-medium border bg-red-100 text-red-800 border-red-300 shadow-sm capitalize">
                            {user.role}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{user.email}</p>
                      </div>
                    </div>

                    {/* Role Change Warning */}
                    {roleChange && (
                      <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 mx-4 mb-6 flex flex-col sm:flex-row items-center gap-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                          <span className="font-semibold text-amber-800">Role Change Detected</span>
                        </div>
                        <div className="flex-1 text-amber-700 text-sm mt-2 sm:mt-0">
                          You are {roleChange.type === 'promotion' ? 'promoting' : 'demoting'} this user from <b>{user.role}</b> to <b>{values.role}</b>.
                        </div>
                        <roleChange.icon className={`w-5 h-5 ${roleChange.color}`} />
                      </div>
                    )}

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <Field
                          name="name"
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                          placeholder="Enter full name"
                        />
                        <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <Field
                          name="email"
                          type="email"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                          placeholder="Enter email address"
                        />
                        <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role *
                        </label>
                        <Field name="role">
                          {({ field }) => (
                            <div className="relative">
                              <select
                                {...field}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 appearance-none cursor-pointer"
                                onChange={(e) => setFieldValue('role', e.target.value)}
                              >
                                <option value="faculty">👨‍🏫 Faculty Member</option>
                                <option value="hod">👑 Head of Department (HOD)</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                          )}
                        </Field>
                        <ErrorMessage name="role" component="div" className="text-red-500 text-xs mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Employee Code *
                        </label>
                        <Field
                          name="employeeCode"
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                          placeholder="Enter employee code"
                        />
                        <ErrorMessage name="employeeCode" component="div" className="text-red-500 text-xs mt-1" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department *
                        </label>
                        <Field name="department">
                          {({ field }) => (
                            <div className="relative">
                              <select
                                {...field}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 appearance-none cursor-pointer"
                              >
                                <option value="">🏢 Select Department</option>
                                <optgroup label="🔬 Engineering & Technology">
                                  <option value="Computer Science">💻 Computer Science</option>
                                  <option value="Electronics & Communication">📡 Electronics & Communication</option>
                                  <option value="Mechanical Engineering">⚙️ Mechanical Engineering</option>
                                  <option value="Civil Engineering">🏗️ Civil Engineering</option>
                                  <option value="Electrical Engineering">⚡ Electrical Engineering</option>
                                  <option value="Information Technology">🌐 Information Technology</option>
                                  <option value="Chemical Engineering">🧪 Chemical Engineering</option>
                                  <option value="Biotechnology">🧬 Biotechnology</option>
                                </optgroup>
                                <optgroup label="📚 Sciences & Liberal Arts">
                                  <option value="Mathematics">🔢 Mathematics</option>
                                  <option value="Physics">⚛️ Physics</option>
                                  <option value="Chemistry">🧪 Chemistry</option>
                                  <option value="English">📖 English</option>
                                </optgroup>
                                <optgroup label="💼 Management & Business">
                                  <option value="Management Studies">📊 Management Studies</option>
                                </optgroup>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                          )}
                        </Field>
                        <ErrorMessage name="department" component="div" className="text-red-500 text-xs mt-1" />
                        <p className="text-xs text-gray-500 mt-1">
                          Select the department where this user will be assigned
                        </p>
                      </div>
                    </div>

                    {/* Role Information Card */}
                    <div className="mx-4 mt-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-6 flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
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

                    {/* Actions - sticky on mobile */}
                    <div className="sticky bottom-0 bg-white z-10 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200 mx-4 pb-4">
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