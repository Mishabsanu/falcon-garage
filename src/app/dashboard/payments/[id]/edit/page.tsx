import PaymentForm from "../../_components/PaymentForm";

export default async function EditPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PaymentForm mode="edit" paymentId={id} />;
}
