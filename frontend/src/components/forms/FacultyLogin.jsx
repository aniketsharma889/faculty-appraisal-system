import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import InputField from "../ui/InputField";
import { loginUser, registerUser } from "../../utils/api";

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

const FacultyLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsLoading(true);
    setApiError("");

    try {
      let response;
      if (isLogin) {
        response = await loginUser(values);
        if (response.user.role !== 'faculty') {
          throw new Error('Invalid credentials for faculty login');
        }
      } else {
        response = await registerUser({ ...values, role: 'faculty' });
        setIsLogin(true);
        setApiError("");
        return;
      }

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      navigate("/faculty/dashboard");
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
                <Field name="department" placeholder="Department" as={InputField} />
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
              onClick={() => setIsLogin(!isLogin)}
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

export default FacultyLogin;