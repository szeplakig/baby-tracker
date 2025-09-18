import type { ActionFunctionArgs } from "react-router-dom";
import { redirect } from "react-router-dom";
import { prisma } from "~/db.server";
import { FoodType, FeedingSource } from "@prisma-client";

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

  await prisma.feeding.create({
    data: {
      startTime,
      endTime,
      foodType,
      source,
      childId,
    },
  });

  return redirect(`/children/${childId}`);
}
