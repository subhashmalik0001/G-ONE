import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PatientDashboardView from "@/components/dashboard/PatientDashboardView";

export default function PatientPage() {
    return (
        <DashboardLayout currentRole="patient">
            <PatientDashboardView />
        </DashboardLayout>
    );
}
