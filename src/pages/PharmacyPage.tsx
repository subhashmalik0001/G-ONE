import DashboardLayout from '@/components/dashboard/DashboardLayout';
import MedicineAvailability from '@/components/pharmacy/medicine-availability';

const PharmacyPage = () => {
  return (
    <DashboardLayout currentRole="patient">
      <div className="max-w-[1400px] mx-auto pb-16">
        <MedicineAvailability />
      </div>
    </DashboardLayout>
  );
};

export default PharmacyPage;