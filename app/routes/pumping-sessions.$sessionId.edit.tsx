import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router-dom";
import { redirect, useLoaderData, Form } from "react-router-dom";
import { prisma } from "../db.server";
import React, { useState, useEffect } from "react";
import TimeSelector from "../components/TimeSelector.tsx";

export async function loader({ params }: LoaderFunctionArgs) {
  const pumpingSession = await prisma.pumpingSession.findUnique({
    where: { id: Number(params.sessionId) },
  });
  if (!pumpingSession) {
    throw new Response("Not Found", { status: 404 });
  }
  return { pumpingSession };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const sessionId = Number(params.sessionId);
  const formData = await request.formData();
  const startTime = new Date(formData.get("startTime") as string);
  const endTime = new Date(formData.get("endTime") as string);
  const volumeMl = parseInt(formData.get("volumeMl") as string, 10);
  const duration = parseInt(formData.get("duration") as string, 10);

  await prisma.pumpingSession.update({
    where: { id: sessionId },
    data: {
      startTime,
      endTime,
      volumeMl,
      duration,
    },
  });

  return redirect(`/pumping-sessions/analytics`);
}

export default function EditPumpingSession() {
  const { pumpingSession } = useLoaderData<typeof loader>();
  const [startTime, setStartTime] = useState<Date | null>(
    new Date(pumpingSession.startTime)
  );
  const [endTime, setEndTime] = useState<Date | null>(
    new Date(pumpingSession.endTime)
  );
  const [duration, setDuration] = useState(pumpingSession.duration);

  useEffect(() => {
    if (startTime && endTime) {
      const diff = endTime.getTime() - startTime.getTime();
      setDuration(Math.round(diff / 60000));
    }
  }, [startTime, endTime]);

  return (
    <Form method="post" className="p-4">
      <div className="space-y-4">
        <TimeSelector
          label="Kezdés"
          selectedTime={startTime}
          onChange={setStartTime}
          name="startTime"
        />
        <TimeSelector
          label="Befejezés"
          selectedTime={endTime}
          onChange={setEndTime}
          name="endTime"
        />
        <div>
          <label
            htmlFor="duration"
            className="block text-sm font-medium text-gray-700"
          >
            Időtartam (perc)
          </label>
          <input
            type="text"
            id="duration"
            name="duration"
            value={duration}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="volumeMl"
            className="block text-sm font-medium text-gray-700"
          >
            Mennyiség (ml)
          </label>
          <input
            type="number"
            id="volumeMl"
            name="volumeMl"
            defaultValue={pumpingSession.volumeMl}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      <div className="mt-6">
        <button
          type="submit"
          className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Mentés
        </button>
      </div>
    </Form>
  );
}
