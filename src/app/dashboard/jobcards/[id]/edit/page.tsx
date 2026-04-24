import JobCardForm from "../../_components/JobCardForm";

export default async function EditJobCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <JobCardForm mode="edit" jobCardId={id} />;
}
