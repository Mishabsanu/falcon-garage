import VehicleForm from "../_components/VehicleForm";

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VehicleForm mode="edit" vehicleId={id} />;
}
