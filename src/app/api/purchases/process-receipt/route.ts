import { connectDB } from "@/lib/mongodb";
import Purchase from "@/models/Purchase";
import Part from "@/models/Part";
import StockTransaction from "@/models/StockTransaction";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { id, receivedItems } = await req.json();
    
    const purchase = await Purchase.findById(id);
    if (!purchase) {
      return NextResponse.json({ success: false, message: "PO not found" }, { status: 404 });
    }

    for (const recItem of receivedItems) {
      const itemInPO = purchase.items.find((i: any) => i.partId.toString() === recItem.partId);
      if (itemInPO) {
        await Part.findByIdAndUpdate(recItem.partId, {
          $inc: { stock: recItem.qty }
        });
        
        itemInPO.receivedQty = (itemInPO.receivedQty || 0) + Number(recItem.qty);

        await StockTransaction.create({
          partId: recItem.partId,
          type: "IN",
          quantity: recItem.qty,
          referenceType: "purchase",
          referenceId: purchase.purchaseNumber
        });
      }
    }

    purchase.markModified('items');

    const allReceived = purchase.items.every((i: any) => (i.receivedQty || 0) >= i.qty);
    purchase.status = allReceived ? "received" : "partial";
    
    if (allReceived) {
      purchase.receivedDate = new Date();
    }

    await purchase.save();

    return NextResponse.json({ success: true, status: purchase.status });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
// FORCE REFRESH CACHE
