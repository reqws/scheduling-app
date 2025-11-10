// app/api/appointments/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function POST(request: NextRequest) {
    const { name, contact, datetime } = await request.json();

    if (!name || !contact || !datetime) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    try {
        await client.connect();
        const db = client.db('SchedDB_Name'); // your database name
        const collection = db.collection('appointments');

        // Optional: check for existing appointment with same name and datetime
        const existing = await collection.findOne({
            name: name.trim(),
            datetime: datetime,
        });
        if (existing) {
            return NextResponse.json(
                { error: 'Appointment already exists for this time' },
                { status: 409 }
            );
        }

        // Insert new appointment
        const result = await collection.insertOne({
            name: name.trim(),
            contact: contact.trim(),
            datetime,
            createdAt: new Date(),
        });

        return NextResponse.json({
            message: 'Appointment saved successfully',
            id: result.insertedId,
        });
    } catch (error) {
        console.error('Error saving appointment:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    } finally {
        await client.close();
    }
}
