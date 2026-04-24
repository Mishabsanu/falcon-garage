import InventoryForm from "../_components/InventoryForm";

export default async function EditInventoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InventoryForm mode="edit" partId={id} />;
}
