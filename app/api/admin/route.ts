// app/api/admin/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    const db = client.db('SchedDB_Name');
    const collection = db.collection('appointments');

    const data = await collection.find().toArray();

    const formatted = data.map((item) => ({
      id: item._id.toString(),
      name: item.name,
      contact: item.contact,
      datetime: item.datetime,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function POST(request: NextRequest) {
  const { name, contact, datetime } = await request.json();

  if (!name || !contact || !datetime) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    await client.connect();
    const db = client.db('SchedDB_Name');
    const collection = db.collection('appointments');

    // Optional: prevent duplicate appointments at the same datetime
    const existing = await collection.findOne({ name: name.trim(), datetime });
    if (existing) {
      return NextResponse.json(
        { error: 'Appointment already exists for this person and time' },
        { status: 409 }
      );
    }

    const result = await collection.insertOne({
      name: name.trim(),
      contact: contact.trim(),
      datetime,
      createdAt: new Date(),
    });

    return NextResponse.json({
      message: 'Appointment added successfully',
      id: result.insertedId,
    });
  } catch (error) {
    console.error('Error adding appointment:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function PUT(request: NextRequest) {
  const { id, name, contact, datetime } = await request.json();

  if (!id || !name || !contact || !datetime) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    await client.connect();
    const db = client.db('SchedDB_Name');
    const collection = db.collection('appointments');

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: name.trim(),
          contact: contact.trim(),
          datetime,
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Update failed' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Appointment updated successfully' });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    await client.connect();
    const db = client.db('SchedDB_Name');
    const collection = db.collection('appointments');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Delete failed' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    await client.close();
  }
}
