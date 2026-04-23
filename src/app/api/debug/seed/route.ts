import { connectDB } from "@/lib/mongodb";
import Counter from "@/models/Counter";
import Customer from "@/models/Customer";
import Vehicle from "@/models/Vehicle";
import Part from "@/models/Part";
import Vendor from "@/models/Vendor";
import User from "@/models/User";
import Notification from "@/models/Notification";
import JobCard from "@/models/JobCard";
import Quotation from "@/models/Quotation";
import Invoice from "@/models/Invoice";
import Payment from "@/models/Payment";
import Salary from "@/models/Salary";
import Purchase from "@/models/Purchase";
import StockTransaction from "@/models/StockTransaction";
import { hashPassword } from "@/utils/hash";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    // 1. Clear existing data
    await Promise.all([
      Counter.deleteMany({}),
      Customer.deleteMany({}),
      Vehicle.deleteMany({}),
      Part.deleteMany({}),
      Vendor.deleteMany({}),
      User.deleteMany({}),
      Notification.deleteMany({}),
      JobCard.deleteMany({}),
      Quotation.deleteMany({}),
      Invoice.deleteMany({}),
      Payment.deleteMany({}),
      Salary.deleteMany({}),
      Purchase.deleteMany({}),
      StockTransaction.deleteMany({}),
    ]);

    const hashedPass = await hashPassword("password123");
    const adminPass = await hashPassword("admin123");

    // 2. Seed Counters
    await Counter.insertMany([
      { name: "customer", value: 1000 },
      { name: "jobcard", value: 5000 },
      { name: "invoice", value: 8000 },
      { name: "quotation", value: 3000 },
      { name: "purchase", value: 2000 },
    ]);

    // 3. Seed Users
    const users = await User.insertMany([
      { name: "Admin User", email: "admin@garage.sys", password: adminPass, role: "ADMIN" },
      { name: "Suresh Accountant", email: "accountant@garage.sys", password: hashedPass, role: "ACCOUNTANT" },
      { name: "Manoj Store", email: "store@garage.sys", password: hashedPass, role: "STORE_MANAGER" },
      { name: "Rajesh Kumar", email: "tech1@garage.sys", password: hashedPass, role: "TECHNICIAN" },
      { name: "Amit Sharma", email: "tech2@garage.sys", password: hashedPass, role: "TECHNICIAN" },
      { name: "Vikram Singh", email: "tech3@garage.sys", password: hashedPass, role: "TECHNICIAN" },
    ]);

    // 4. Seed Vendors
    const vendors = await Vendor.insertMany([
      { name: "Super Spare Parts Co.", phone: "1122334455", email: "sales@superspares.com", address: "Kashmere Gate, Delhi" },
      { name: "Elite Oil & Lubes", phone: "2233445566", email: "orders@eliteoil.com", address: "Industrial Area, Pune" },
      { name: "Tyre World", phone: "3344556677", email: "info@tyreworld.com", address: "Salt Lake, Kolkata" },
    ]);

    // 5. Seed Parts
    const parts = await Part.insertMany([
      { name: "Synthetic Engine Oil (5L)", sku: "OIL-SYN-001", stock: 50, minStock: 10, price: 4500, vendorId: vendors[1]._id, location: "Shelf A1" },
      { name: "Brake Pads (Front)", sku: "BRK-F-001", stock: 20, minStock: 5, price: 3200, vendorId: vendors[0]._id, location: "Shelf B2" },
      { name: "Oil Filter", sku: "FLT-OIL-001", stock: 40, minStock: 15, price: 850, vendorId: vendors[0]._id, location: "Shelf A2" },
      { name: "Air Filter", sku: "FLT-AIR-001", stock: 30, minStock: 10, price: 1200, vendorId: vendors[0]._id, location: "Shelf A3" },
      { name: "Spark Plugs (Set 4)", sku: "SPK-SET-001", stock: 15, minStock: 5, price: 2800, vendorId: vendors[0]._id, location: "Shelf C1" },
    ]);

    // 6. Seed Customers
    const customers = await Customer.insertMany([
      { customerNumber: "CUS-1001", name: "Anil Ambani", phone: "9876543210", email: "anil@example.com", address: "Antilia, Mumbai", customerType: "cash" },
      { customerNumber: "CUS-1002", name: "Ratan Tata", phone: "9876543211", email: "ratan@example.com", address: "Colaba, Mumbai", customerType: "credit" },
      { customerNumber: "CUS-1003", name: "Shah Rukh Khan", phone: "9876543213", email: "srk@example.com", address: "Mannat, Bandra", customerType: "cash" },
    ]);

    // 7. Seed Vehicles
    const vehicles = await Vehicle.insertMany([
      { vehicleNumber: "MH 01 AB 1234", brand: "Mercedes-Benz", model: "S-Class", customerId: customers[0]._id, vin: "VIN123456789", color: "Obsidian Black" },
      { vehicleNumber: "MH 02 CD 5678", brand: "Jaguar", model: "XJ", customerId: customers[1]._id, vin: "VIN987654321", color: "British Racing Green" },
      { vehicleNumber: "MH 04 GH 3456", brand: "BMW", model: "7 Series", customerId: customers[2]._id, vin: "VIN456789123", color: "Alpine White" },
    ]);

    // 8. Seed Operations (Quotation, JobCard, Invoice)

    // 8a. A pending Job Card
    const jc1 = await JobCard.create({
      jobCardNumber: "JC-5001",
      customerId: customers[0]._id,
      vehicleId: vehicles[0]._id,
      status: "open",
      complaints: ["Engine noise", "Oil leak check"],
      mileage: 45000,
    });

    // 8b. An in-progress Job Card with Quotation
    const jc2 = await JobCard.create({
      jobCardNumber: "JC-5002",
      customerId: customers[1]._id,
      vehicleId: vehicles[1]._id,
      status: "in_progress",
      technicians: [users[3]._id],
      complaints: ["Brake squeaking", "General service"],
      mileage: 12000,
      startTime: new Date(),
    });

    const quote1 = await Quotation.create({
      quotationNumber: "QT-3001",
      customerId: customers[1]._id,
      vehicleId: vehicles[1]._id,
      jobCardId: jc2._id,
      items: [
        { partId: parts[1]._id, name: parts[1].name, qty: 1, price: 3200 },
        { partId: parts[2]._id, name: parts[2].name, qty: 1, price: 850 },
      ],
      laborCost: 1500,
      subtotal: 5550,
      gstPercent: 18,
      gstAmount: 999,
      grandTotal: 6549,
      status: "approved",
    });

    await JobCard.findByIdAndUpdate(jc2._id, { $push: { quotationIds: quote1._id } });

    // 8c. A completed Job Card and paid Invoice
    const jc3 = await JobCard.create({
      jobCardNumber: "JC-5003",
      customerId: customers[2]._id,
      vehicleId: vehicles[2]._id,
      status: "closed",
      technicians: [users[4]._id],
      complaints: ["Annual Maintenance"],
      items: [
        { name: "Service Labor", qty: 1, price: 2000 },
      ],
      mileage: 8000,
      startTime: new Date(Date.now() - 86400000),
      endTime: new Date(),
    });

    const invoice1 = await Invoice.create({
      invoiceNumber: "INV-8001",
      jobCardId: jc3._id,
      customerId: customers[2]._id,
      vehicleId: vehicles[2]._id,
      items: [
        { name: "Service Labor", qty: 1, price: 2000, total: 2000 },
      ],
      laborCost: 2000,
      subtotal: 2000,
      gstPercent: 18,
      gstAmount: 360,
      grandTotal: 2360,
      paidAmount: 2360,
      balanceAmount: 0,
      status: "paid",
    });

    await Payment.create({
      invoiceId: invoice1._id,
      amount: 2360,
      method: "upi",
      note: "Full payment via GPay",
    });

    // 9. Seed Finance (Purchase & Salary)

    await Purchase.create({
      purchaseNumber: "PO-2001",
      vendorName: vendors[0].name,
      items: [
        { partId: parts[1]._id, name: parts[1].name, qty: 10, costPrice: 2000, total: 20000 },
      ],
      totalAmount: 20000,
      status: "received",
      receivedDate: new Date(),
    });

    await Salary.create({
      employeeId: users[3]._id,
      month: "2024-04",
      baseSalary: 25000,
      advanceTaken: 2000,
      netSalary: 23000,
      status: "paid",
      paymentHistory: [{ amount: 23000, date: new Date(), mode: "Bank Transfer" }],
    });

    // 10. Seed Notifications
    await Notification.insertMany([
      { title: "SYSTEM READY", message: "Garage ERP initialized with comprehensive module data.", type: "QUOTATION_PENDING", isRead: false },
      { title: "LOW STOCK ALERT", message: "Check inventory for Spark Plugs (15 units remaining).", type: "LOW_STOCK", isRead: false },
      { title: "NEW APPOINTMENT", message: "Anil Ambani's S-Class is pending service.", type: "TASK_ASSIGNED", isRead: false },
    ]);

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully for ALL modules.",
      logins: {
        admin: "admin@garage.sys / admin123",
        staff: "tech1@garage.sys / password123"
      }
    });
  } catch (error: any) {
    console.error("Seed Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
