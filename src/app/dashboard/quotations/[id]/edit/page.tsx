import QuotationForm from "../../_components/QuotationForm";

export default async function EditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <QuotationForm mode="edit" quotationId={id} />;
}
