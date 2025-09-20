import type { ActionFunctionArgs } from "react-router-dom";
import {
  Form,
  redirect,
  useLoaderData,
  useActionData,
} from "react-router-dom";
import { prisma } from "~/db.server.ts";
import { FoodType, FeedingSource } from "@prisma-app/client";
import { useState, useEffect } from "react";
import TimeSelector from "~/components/TimeSelector.tsx";

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
  );
  const endTime = formData.get("endTime")
    ? new Date(formData.get("endTime") as string)
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

  // Return success message instead of redirecting
  return { success: true, message: "Etetés sikeresen rögzítve!" };
}

export default function NewFeeding() {
  const { child } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [foodType, setFoodType] = useState<FoodType>(FoodType.BREAST_MILK);
  const [source, setSource] = useState<FeedingSource>(FeedingSource.NIPPLE);
  const [amount, setAmount] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle success message and form reset
  useEffect(() => {
    if (actionData?.success) {
      setShowSuccess(true);
      // Reset form to defaults for quick re-entry
      setStartTime(new Date());
      setEndTime(null);
      setAmount("");
      // Keep foodType and source as they might be the same for multiple feedings
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [actionData]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Új etetés rögzítése - {child.name}</h1>
      
      {showSuccess && (
        <div className="mt-4 p-4 bg-green-100 border border-green-300 text-green-800 rounded-md">
          {actionData?.message}
        </div>
      )}
      
      <Form method="post" className="mt-4 space-y-4">
        <TimeSelector
          label="Kezdés"
          selectedTime={startTime}
          onChange={setStartTime}
          name="startTime"
        />
        <TimeSelector
          label="Befejezés (opcionális)"
          selectedTime={endTime}
          onChange={setEndTime}
          name="endTime"
        />
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
            value={foodType}
            onChange={(e) => setFoodType(e.target.value as FoodType)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          >
            <option value={FoodType.BREAST_MILK}>Anyatej</option>
            <option value={FoodType.FORMULA}>Tápszer</option>
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
            value={source}
            onChange={(e) => setSource(e.target.value as FeedingSource)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          >
            <option value={FeedingSource.NIPPLE}>Mell</option>
            <option value={FeedingSource.BOTTLE}>Cumisüveg</option>
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
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Mentés
        </button>
      </Form>
    </div>
  );
}
