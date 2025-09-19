import type { ActionFunctionArgs } from "react-router-dom";
import { redirect } from "react-router-dom";
import { Form } from "react-router-dom";
import { prisma } from "../db.server";
import { Gender } from "@prisma-app/client";
import { default as DatePicker } from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const gender = formData.get("gender") as Gender;
  const birthDatetime = new Date(
    formData.get("birthDatetime") as string
  ).toISOString();

  const child = await prisma.child.create({
    data: {
      name,
      gender,
      birthDatetime,
    },
  });

  return redirect(`/children/${child.id}`);
}

import React, { useState } from "react";

export default function NewChild() {
  const [birthDatetime, setBirthDatetime] = useState<Date | null>(null);

  return (
    <Form method="post">
      <input
        type="hidden"
        name="birthDatetime"
        value={birthDatetime?.toISOString() ?? ""}
      />
      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Név
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-700"
          >
            Nem
          </label>
          <div className="mt-1">
            <select
              name="gender"
              id="gender"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="MALE">Fiú</option>
              <option value="FEMALE">Lány</option>
              <option value="OTHER">Egyéb</option>
            </select>
          </div>
        </div>
        <div>
          <label
            htmlFor="birthDatetime"
            className="block text-sm font-medium text-gray-700"
          >
            Születési idő
          </label>
          <div className="mt-1">
            <DatePicker
              selected={birthDatetime}
              onChange={(date: Date | null) => setBirthDatetime(date)}
              showTimeSelect
              timeIntervals={1}
              dateFormat="Pp"
              locale="hu"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            className="flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Gyermek hozzáadása
          </button>
        </div>
      </div>
    </Form>
  );
}
