import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import InputField from "../ui/ImputField";
import { loginUser, registerUser } from "../../utils/api";

const departments = [
  "Computer Science",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Information Technology",
  "Chemical Engineering",
  "Biotechnology",
  "Mathematics",
  "Physics",
  "Chemistry",
  "English",
  "Management Studies"
];

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Too short!").required("Password is required"),
});

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  employeeCode: Yup.string().required("Employee code is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Too short!").required("Password is required"),
  department: Yup.string().required("Department is required"),
});

const HODAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsLoading(true);
    setApiError("");
    setSuccessMessage("");

    try {
      let response;
      if (isLogin) {
        response = await loginUser(values);
        if (response.user.role !== 'hod') {
          throw new Error('Invalid credentials for HOD login');
        }
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        navigate("/hod/dashboard");
      } else {
        await registerUser({ ...values, role: 'hod' });
        setSuccessMessage("HOD registration successful! Please login.");
        setIsLogin(true);
        resetForm();
      }
    } catch (error) {
      setApiError(error.message || `${isLogin ? 'Login' : 'Registration'} failed`);
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={isLogin ? 
        { email: "", password: "" } : 
        { name: "", employeeCode: "", email: "", password: "", department: "" }
      }
      validationSchema={isLogin ? LoginSchema : RegisterSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {() => (
        <Form className="space-y-4">
          <h2 className="text-2xl font-bold text-center mb-6">
            HOD {isLogin ? 'Login' : 'Registration'}
          </h2>

          {apiError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {apiError}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}

          {!isLogin && (
            <>
              <div>
                <Field name="name" placeholder="Full Name" as={InputField} />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <Field name="employeeCode" placeholder="Employee Code" as={InputField} />
                <ErrorMessage name="employeeCode" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <Field name="department">
                  {({ field }) => (
                    <div className="relative">
                      <select
                        {...field}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm appearance-none cursor-pointer hover:border-gray-400"
                      >
                        <option value="" className="text-gray-500 text-xs">
                          🏢 Select Department
                        </option>
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
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </Field>
                <ErrorMessage name="department" component="div" className="text-red-500 text-sm mt-1" />
              </div>
            </>
          )}

          <div>
            <Field name="email" type="email" placeholder="Email" as={InputField} />
            <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
          </div>

          <div>
            <Field name="password" type="password" placeholder="Password" as={InputField} />
            <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 
              (isLogin ? "Logging in..." : "Registering...") : 
              (isLogin ? "Login as HOD" : "Register as HOD")
            }
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setApiError("");
                setSuccessMessage("");
              }}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              {isLogin ? "Need to register? Click here" : "Already have an account? Login"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default HODAuth;
