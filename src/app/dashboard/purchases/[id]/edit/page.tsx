"use client";

import { use } from "react";
import PurchaseForm from "../../_components/PurchaseForm";

export default function EditPurchasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="p-8">
      <PurchaseForm purchaseId={id} />
    </div>
  );
}
