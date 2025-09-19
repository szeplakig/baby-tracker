import type { ActionFunctionArgs } from "react-router-dom";
import { redirect } from "react-router-dom";
import { Form } from "react-router-dom";
import { prisma } from "../db.server";
import { default as DatePicker } from "react-datepicker";
import React, { useState, useEffect } from "react";

import "react-datepicker/dist/react-datepicker.css";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const startTime = new Date(formData.get("startTime") as string);
  const endTime = new Date(formData.get("endTime") as string);
  const volumeMl = parseInt(formData.get("volumeMl") as string, 10);
  const duration = parseInt(formData.get("duration") as string, 10);

  await prisma.pumpingSession.create({
    data: {
      startTime,
      endTime,
      volumeMl,
      duration,
    },
  });

  return redirect(`/pumping-sessions/analytics`);
}

export default function NewPumpingSession() {
  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(new Date());
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (startTime && endTime) {
      const diff = endTime.getTime() - startTime.getTime();
      setDuration(Math.round(diff / 60000));
    }
  }, [startTime, endTime]);

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
            Kezdés
          </label>
          <div className="mt-1 flex items-center gap-x-2">
            <DatePicker
              selected={startTime}
              onChange={(date: Date | null) => setStartTime(date)}
              showTimeSelect
              timeIntervals={1}
              dateFormat="Pp"
              locale="hu"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={() => setStartTime(new Date())}
              className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Most
            </button>
          </div>
        </div>
        <div>
          <label
            htmlFor="endTime"
            className="block text-sm font-medium text-gray-700"
          >
            Befejezés
          </label>
          <div className="mt-1 flex items-center gap-x-2">
            <DatePicker
              selected={endTime}
              onChange={(date: Date | null) => setEndTime(date)}
              showTimeSelect
              timeIntervals={1}
              dateFormat="Pp"
              locale="hu"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={() => setEndTime(new Date())}
              className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Most
            </button>
          </div>
        </div>
        <div>
          <label
            htmlFor="duration"
            className="block text-sm font-medium text-gray-700"
          >
            Időtartam (perc)
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="duration"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="volumeMl"
            className="block text-sm font-medium text-gray-700"
          >
            Mennyiség (ml)
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
            Fejés rögzítése
          </button>
        </div>
      </div>
    </Form>
  );
}
