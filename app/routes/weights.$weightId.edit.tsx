import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router-dom";
import { redirect, Form, useLoaderData, useParams } from "react-router-dom";
import { prisma } from "~/db.server";
import DatePicker from "react-datepicker";
import React, { useState } from "react";

import "react-datepicker/dist/react-datepicker.css";

export async function loader({ params }: LoaderFunctionArgs) {
  const weight = await prisma.weight.findUnique({
    where: { id: Number(params.weightId) },
  });
  if (!weight) {
    throw new Response("Not Found", { status: 404 });
  }
  return { weight };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const weightId = Number(params.weightId);
  const weight = parseInt(formData.get("weight") as string, 10);
  const date = new Date(formData.get("date") as string);

  await prisma.weight.update({
    where: { id: weightId },
    data: {
      weight,
      date,
    },
  });

  return redirect(`/weights/analytics`);
}

export default function EditWeight() {
  const { weight } = useLoaderData<typeof loader>();
  const [date, setDate] = useState<Date | null>(new Date(weight.date));

  return (
    <Form method="post">
      <input type="hidden" name="date" value={date?.toISOString() ?? ""} />
      <div className="space-y-4">
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700"
          >
            Dátum
          </label>
          <div className="mt-1 flex items-center gap-x-2">
            <DatePicker
              selected={date}
              onChange={(d: Date | null) => setDate(d)}
              showTimeSelect
              timeIntervals={1}
              dateFormat="Pp"
              locale="hu"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={() => setDate(new Date())}
              className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Most
            </button>
          </div>
        </div>
        <div>
          <label
            htmlFor="weight"
            className="block text-sm font-medium text-gray-700"
          >
            Súly (gramm)
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="weight"
              id="weight"
              defaultValue={weight.weight}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            className="flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Súlymérés mentése
          </button>
        </div>
      </div>
    </Form>
  );
}
