import StaffForm from "../../_components/StaffForm";

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StaffForm mode="edit" userId={id} />;
}
