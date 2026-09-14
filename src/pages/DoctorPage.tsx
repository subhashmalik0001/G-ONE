import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DoctorDashboardView from "@/components/dashboard/DoctorDashboardView";

export default function DoctorPage() {
    return (
        <DashboardLayout currentRole="doctor">
            <DoctorDashboardView />
        </DashboardLayout>
    );
}
