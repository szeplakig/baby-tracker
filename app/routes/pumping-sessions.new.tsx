import type { ActionFunctionArgs } from "react-router-dom";
import { redirect } from "react-router-dom";
import { Form } from "react-router-dom";
import { prisma } from "~/db.server";
import DatePicker from "react-datepicker";
import React, { useState } from "react";

import "react-datepicker/dist/react-datepicker.css";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const startTime = new Date(formData.get("startTime") as string);
  const endTime = new Date(formData.get("endTime") as string);
  const volumeMl = parseInt(formData.get("volumeMl") as string, 10);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000); // duration in minutes

  await prisma.pumpingSession.create({
    data: {
      startTime,
      endTime,
      volumeMl,
      duration,
    },
  });

  return redirect(`/`); // Redirect to a relevant page, maybe a list of sessions later
}

export default function NewPumpingSession() {
  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(new Date());

  return (
    <Form method="post">
      <input
        type="hidden"
        name="startTime"
        value={startTime?.toISOString() ?? ""}
      />
      <input
        type="hidden"
        name="endTime"
        value={endTime?.toISOString() ?? ""}
      />
      <div className="space-y-4">
        <div>
          <label
            htmlFor="startTime"
            className="block text-sm font-medium text-gray-700"
          >
            Start Time
          </label>
          <div className="mt-1">
            <DatePicker
              selected={startTime}
              onChange={(date: Date | null) => setStartTime(date)}
              showTimeSelect
              timeIntervals={1}
              dateFormat="Pp"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="endTime"
            className="block text-sm font-medium text-gray-700"
          >
            End Time
          </label>
          <div className="mt-1">
            <DatePicker
              selected={endTime}
              onChange={(date: Date | null) => setEndTime(date)}
              showTimeSelect
              timeIntervals={1}
              dateFormat="Pp"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="volumeMl"
            className="block text-sm font-medium text-gray-700"
          >
            Volume (ml)
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="volumeMl"
              id="volumeMl"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            className="flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Add Pumping Session
          </button>
        </div>
      </div>
    </Form>
  );
}
