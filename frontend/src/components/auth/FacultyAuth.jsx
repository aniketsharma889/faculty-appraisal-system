import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import InputField from "../ui/InputField";
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

const FacultyAuth = () => {
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
        if (response.user.role !== 'faculty') {
          throw new Error('Invalid credentials for faculty login');
        }
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        navigate("/faculty/dashboard");
      } else {
        await registerUser({ ...values, role: 'faculty' });
        setSuccessMessage("Registration successful! Please login.");
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
            Faculty {isLogin ? 'Login' : 'Registration'}
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
                    <select
                      {...field}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  )}
                </Field>
                <ErrorMessage name="department" component="div" className="text-red-500 text-sm" />
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
              (isLogin ? "Login" : "Register")
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

export default FacultyAuth;
