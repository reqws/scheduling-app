// models/appointment.ts
import mongoose, { Schema, models } from "mongoose";

const AppointmentSchema = new Schema(
    {
        name: { type: String, required: true },
        contact: { type: String, required: true },
        datetime: { type: String, required: true },
    },
    { timestamps: true }
);

const Appointment =
    models.Appointment || mongoose.model("Appointment", AppointmentSchema);

export default Appointment;
