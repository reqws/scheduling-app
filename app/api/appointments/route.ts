// app/api/appointments/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import Appointment from "../../models/appointment";

export async function POST(req: Request) {
    try {
        const { name, contact, datetime } = await req.json();

        if (!name || !contact || !datetime) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        await connectDB();
        const newAppointment = await Appointment.create({ name, contact, datetime });

        return NextResponse.json(
            { message: "Appointment saved successfully", appointment: newAppointment },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Error saving appointment:", error);
        return NextResponse.json(
            { message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}
