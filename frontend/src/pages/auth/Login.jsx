import AuthLayout from "../../components/layout/AuthLayout";
import RoleBasedLogin from "../../components/forms/RoleBasedLogin";

const Login = () => {
  return (
    <AuthLayout>
      <RoleBasedLogin />
    </AuthLayout>
  );
};

export default Login;
