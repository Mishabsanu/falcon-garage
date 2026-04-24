import VendorForm from "../_components/VendorForm";

export default async function EditVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VendorForm mode="edit" vendorId={id} />;
}
