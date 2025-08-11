import DashboardLayout from "../../components/layout/DashboardLayout";
import AppraisalForm from "../../components/forms/AppraisalForm";

const SubmitAppraisal = () => {
  return (
    <DashboardLayout allowedRole="faculty">
      <AppraisalForm />
    </DashboardLayout>
  );
};

export default SubmitAppraisal;
