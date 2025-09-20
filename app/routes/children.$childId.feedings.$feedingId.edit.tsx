import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router-dom";
import {
  Form,
  redirect,
  useLoaderData,
  useParams,
} from "react-router-dom";
import { prisma } from "~/db.server";
import { FoodType, FeedingSource } from "@prisma-app/client";
import TimeSelector from "~/components/TimeSelector.tsx";
import { useState } from "react";

export async function loader({ params }: LoaderFunctionArgs) {
  const feeding = await prisma.feeding.findUnique({
    where: { id: Number(params.feedingId) },
    include: { child: true },
  });
  if (!feeding) {
    throw new Response("Not Found", { status: 404 });
  }
  return { feeding };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const childId = Number(params.childId);
  const feedingId = Number(params.feedingId);
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

  await prisma.feeding.update({
    where: { id: feedingId },
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

export default function EditFeeding() {
  const { feeding } = useLoaderData<typeof loader>();
  const [startTime, setStartTime] = useState<Date | null>(
    new Date(feeding.startTime)
  );
  const [endTime, setEndTime] = useState<Date | null>(
    feeding.endTime ? new Date(feeding.endTime) : null
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">
        Etetés szerkesztése - {feeding.child.name}
      </h1>
      <Form method="post" className="mt-4 space-y-4">
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
            htmlFor="foodType"
            className="block text-sm font-medium text-gray-700"
          >
            Étel típusa
          </label>
          <select
            id="foodType"
            name="foodType"
            defaultValue={feeding.foodType}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          >
            {Object.values(FoodType).map((type) => (
              <option key={type} value={type}>
                {type === FoodType.BREAST_MILK ? "Anyatej" : "Tápszer"}
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
            defaultValue={feeding.source}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          >
            {Object.values(FeedingSource).map((source) => (
              <option key={source} value={source}>
                {source === FeedingSource.NIPPLE ? "Mell" : "Cumisüveg"}
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
            defaultValue={feeding.amount ?? ""}
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
