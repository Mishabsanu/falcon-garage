import ItemForm from "../_components/ItemForm";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ItemForm mode="edit" itemId={id} />;
}
