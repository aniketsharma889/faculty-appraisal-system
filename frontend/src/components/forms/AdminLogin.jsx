import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import InputField from "../ui/ImputField";
import { loginUser } from "../../utils/api";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Too short!").required("Password is required"),
});

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsLoading(true);
    setApiError("");

    try {
      const response = await loginUser(values);
      
      if (response.user.role !== 'admin') {
        throw new Error('Invalid credentials for admin login');
      }

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      navigate("/admin/dashboard");
    } catch (error) {
      setApiError(error.message || "Admin login failed");
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={LoginSchema}
      onSubmit={handleSubmit}
    >
      {() => (
        <Form className="space-y-4">
          <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>

          {apiError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {apiError}
            </div>
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
            {isLoading ? "Logging in..." : "Login as Admin"}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default AdminLogin;