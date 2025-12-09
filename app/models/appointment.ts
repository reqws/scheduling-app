// models/appointment.ts

// Import mongoose, Schema constructor, and existing models (if any)
import mongoose, { Schema, models } from "mongoose";

// Define the schema for an appointment document
const AppointmentSchema = new Schema(
    {
        // Name of the person booking the appointment
        name: { type: String, required: true },

        // Contact information (phone, email, etc.)
        contact: { type: String, required: true },

        // Appointment date and time stored as a string
        datetime: { type: String, required: true },
    },
    {
        // Automatically add createdAt and updatedAt timestamps
        timestamps: true
    }
);

// Reuse the existing Appointment model if it exists (prevents overwrite in dev)
// Otherwise create a new model using the schema
const Appointment =
    models.Appointment || mongoose.model("Appointment", AppointmentSchema);

// Export the model for use in other parts of the application
export default Appointment;
