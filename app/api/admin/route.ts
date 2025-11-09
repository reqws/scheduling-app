import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    const db = client.db("SchedDB_Name");
    const collection = db.collection("appointments");

    const appointments = await collection.find().toArray();

    // Convert MongoDB _id ObjectId to string for the frontend
    const formatted = appointments.map((appt) => ({
      id: appt._id.toString(),
      name: appt.name,
      contact: appt.contact,
      datetime: appt.datetime,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
