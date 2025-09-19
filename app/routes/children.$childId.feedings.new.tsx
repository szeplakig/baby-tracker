import type { ActionFunctionArgs } from "react-router-dom";
import {
  ActionFunctionArgs,
  Form,
  redirect,
  useLoaderData,
} from "react-router-dom";
import { prisma } from "~/db.server";
import { FoodType, FeedingSource } from "@prisma-app/client";
import DatePicker from "react-datepicker";
import { useState } from "react";

export async function loader({ params }: ActionFunctionArgs) {
  const child = await prisma.child.findUnique({
    where: { id: Number(params.childId) },
  });
  if (!child) {
    throw new Response("Not Found", { status: 404 });
  }
  return { child };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const childId = Number(params.childId);
  const formData = await request.formData();
  const startTime = new Date(
    formData.get("startTime") as string
  ).toISOString();
  const endTime = formData.get("endTime")
    ? new Date(formData.get("endTime") as string).toISOString()
    : null;
  const foodType = formData.get("foodType") as FoodType;
  const source = formData.get("source") as FeedingSource;
  const amount = formData.get("amount")
    ? Number(formData.get("amount"))
    : null;

  await prisma.feeding.create({
    data: {
      startTime,
      endTime,
      foodType,
      source,
      amount,
      childId,
    },
  });

  return redirect(`/children/${childId}`);
}

export default function NewFeeding() {
  const { child } = useLoaderData<typeof loader>();
  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(null);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Új etetés rögzítése - {child.name}</h1>
      <Form method="post" className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="startTime"
            className="block text-sm font-medium text-gray-700"
          >
            Kezdés
          </label>
          <DatePicker
            id="startTime"
            name="startTime"
            selected={startTime}
            onChange={(date) => setStartTime(date)}
            showTimeSelect
            dateFormat="Pp"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <div>
          <label
            htmlFor="endTime"
            className="block text-sm font-medium text-gray-700"
          >
            Befejezés
          </label>
          <DatePicker
            id="endTime"
            name="endTime"
            selected={endTime}
            onChange={(date) => setEndTime(date)}
            showTimeSelect
            dateFormat="Pp"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label
            htmlFor="foodType"
            className="block text-sm font-medium text-gray-700"
          >
            Étel típusa
          </label>
          <select
            id="foodType"
            name="foodType"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          >
            {Object.values(FoodType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="source"
            className="block text-sm font-medium text-gray-700"
          >
            Forrás
          </label>
          <select
            id="source"
            name="source"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          >
            {Object.values(FeedingSource).map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700"
          >
            Mennyiség (ml)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          Mentés
        </button>
      </Form>
    </div>
  );
}
