import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import InputField from "../ui/InputField";
import { loginUser } from "../../utils/api";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Too short!").required("Password is required"),
});

const HODLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsLoading(true);
    setApiError("");

    try {
      const response = await loginUser(values);
      
      if (response.user.role !== 'hod') {
        throw new Error('Invalid credentials for HOD login');
      }

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      navigate("/hod/dashboard");
    } catch (error) {
      setApiError(error.message || "HOD login failed");
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
          <h2 className="text-2xl font-bold text-center mb-6">HOD Login</h2>

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
            {isLoading ? "Logging in..." : "Login as HOD"}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default HODLogin;