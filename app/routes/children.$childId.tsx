import type { LoaderFunctionArgs } from "react-router-dom";
import { useLoaderData, Form } from "react-router-dom";
import { prisma } from "~/db.server";
import { FoodType, FeedingSource, type Feeding } from "@prisma-app/client";
import { useState } from "react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

export async function loader({ params }: LoaderFunctionArgs) {
  const child = await prisma.child.findUnique({
    where: { id: Number(params.childId) },
    include: { feedings: { orderBy: { startTime: "desc" } } },
  });

  if (!child) {
    throw new Response("Not Found", { status: 404 });
  }

  return { child };
}

export default function ChildDetails() {
  const { child } = useLoaderData<typeof loader>();
  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{child.name}</h1>
        <p>Gender: {child.gender}</p>
        <p>Born on: {new Date(child.birthDatetime).toLocaleString()}</p>
      </div>

      <hr />

      <div>
        <h2 className="text-xl font-semibold">Add New Feeding</h2>
        <Form
          method="post"
          action={`/children/${child.id}/feedings/new`}
          className="mt-4 space-y-4"
        >
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
          <div>
            <label
              htmlFor="startTime"
              className="block text-sm font-medium text-gray-700"
            >
              Start Time
            </label>
            <div className="mt-1 flex items-center gap-2">
              <DatePicker
                id="startTime"
                name="startTime"
                selected={startTime}
                onChange={(date: Date | null) => setStartTime(date)}
                showTimeSelect
                timeIntervals={15}
                dateFormat="Pp"
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setStartTime(new Date())}
                className="rounded-md bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100"
              >
                Now
              </button>
            </div>
          </div>
          <div>
            <label
              htmlFor="endTime"
              className="block text-sm font-medium text-gray-700"
            >
              End Time (optional)
            </label>
            <div className="mt-1 flex items-center gap-2">
              <DatePicker
                id="endTime"
                name="endTime"
                selected={endTime}
                onChange={(date: Date | null) => setEndTime(date)}
                showTimeSelect
                timeIntervals={15}
                dateFormat="Pp"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setEndTime(new Date())}
                className="rounded-md bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100"
              >
                Now
              </button>
            </div>
          </div>
          <div>
            <label
              htmlFor="foodType"
              className="block text-sm font-medium text-gray-700"
            >
              Food Type
            </label>
            <div className="mt-1">
              <select
                name="foodType"
                id="foodType"
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value={FoodType.BREAST_MILK}>Breast Milk</option>
                <option value={FoodType.FORMULA}>Formula</option>
              </select>
            </div>
          </div>
          <div>
            <label
              htmlFor="source"
              className="block text-sm font-medium text-gray-700"
            >
              Source
            </label>
            <div className="mt-1">
              <select
                name="source"
                id="source"
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value={FeedingSource.NIPPLE}>Nipple</option>
                <option value={FeedingSource.BOTTLE}>Bottle</option>
              </select>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add Feeding
            </button>
          </div>
        </Form>
      </div>

      <hr />

      <div>
        <h2 className="text-xl font-semibold">Feeding Log</h2>
        <ul className="mt-4 space-y-4">
          {child.feedings.map((feeding: Feeding) => (
            <li key={feeding.id} className="rounded-md border p-4">
              <p>
                <strong>Started:</strong>{" "}
                {new Date(feeding.startTime).toLocaleString()}
              </p>
              {feeding.endTime && (
                <p>
                  <strong>Ended:</strong>{" "}
                  {new Date(feeding.endTime).toLocaleString()}
                </p>
              )}
              <p>
                <strong>Food:</strong> {feeding.foodType}
              </p>
              <p>
                <strong>Source:</strong> {feeding.source}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
