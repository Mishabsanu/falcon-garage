"use client";

import { useEffect, useState } from "react";

export default function CustomerLedger({ params }: { params: Promise<{ id: string }> }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { id } = await params;
      fetch("/api/customers/ledger", {
        method: "POST",

        body: JSON.stringify({
          customerId: id,
        }),
      })
        .then((res) => res.json())
        .then(setData);
    };
    fetchData();
  }, [params]);

  if (!data) return <p>Loading ledger...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Customer Ledger</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white shadow p-4">
          Total Invoice ₹{data.summary.totalInvoiceAmount}
        </div>

        <div className="bg-white shadow p-4">
          Total Paid ₹{data.summary.totalPaidAmount}
        </div>

        <div className="bg-white shadow p-4">
          Pending Balance ₹{data.summary.totalPendingAmount}
        </div>
      </div>

      <h3 className="mt-6 font-semibold">Invoices</h3>

      <table className="w-full mt-2">
        <thead>
          <tr>
            <th>Invoice</th>

            <th>Total</th>

            <th>Paid</th>

            <th>Balance</th>
          </tr>
        </thead>

        <tbody>
          {data.invoices.map((inv: any) => (
            <tr key={inv._id}>
              <td>{inv.invoiceNumber}</td>

              <td>₹{inv.grandTotal}</td>

              <td>₹{inv.paidAmount}</td>

              <td>₹{inv.balanceAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
