import SalaryForm from "../../_components/SalaryForm";

export default async function EditSalaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SalaryForm mode="edit" salaryId={id} />;
}
