import type { LoaderFunctionArgs } from "react-router-dom";
import { useLoaderData, Form, Link, redirect } from "react-router-dom";
import { prisma } from "~/db.server";
import type { Feeding, Weight } from "@prisma-app/client";
import type { ActionFunctionArgs } from "react-router-dom";

import "react-datepicker/dist/react-datepicker.css";

export async function loader({ params }: LoaderFunctionArgs) {
  const child = await prisma.child.findUnique({
    where: { id: Number(params.childId) },
    include: {
      feedings: { orderBy: { startTime: "desc" } },
      weights: { orderBy: { date: "desc" } },
    },
  });

  if (!child) {
    throw new Response("Not Found", { status: 404 });
  }

  return { child };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "deleteFeeding") {
    const feedingId = Number(formData.get("feedingId"));
    await prisma.feeding.delete({ where: { id: feedingId } });
    return redirect(`/children/${params.childId}`);
  }

  if (intent === "deleteWeight") {
    const weightId = Number(formData.get("weightId"));
    await prisma.weight.delete({ where: { id: weightId } });
    return redirect(`/children/${params.childId}`);
  }

  return null;
}

export default function ChildDetails() {
  const { child } = useLoaderData<typeof loader>();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{child.name}</h1>
        <p className="text-gray-600">
          Születési dátum: {new Date(child.birthDatetime).toLocaleString()}
        </p>
      </div>

      <div className="mb-8 flex gap-x-4">
        <Link
          to={`/children/${child.id}/feedings/new`}
          className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Új etetés
        </Link>
        <Link
          to={`/children/${child.id}/weights/new`}
          className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          Új súlymérés
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold">Etetések</h2>
          <div className="mt-4 space-y-4">
            {child.feedings.map((feeding: Feeding) => (
              <div
                key={feeding.id}
                className="rounded-lg bg-white p-4 shadow"
              >
                <p>
                  <strong>Időpont:</strong>{" "}
                  {new Date(feeding.startTime).toLocaleString()}
                </p>
                <p>
                  <strong>Típus:</strong> {feeding.foodType}
                </p>
                <p>
                  <strong>Forrás:</strong> {feeding.source}
                </p>
                <div className="mt-2 flex gap-x-2">
                  <Link
                    to={`/children/${child.id}/feedings/${feeding.id}/edit`}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Szerkesztés
                  </Link>
                  <Form method="post">
                    <input type="hidden" name="intent" value="deleteFeeding" />
                    <input type="hidden" name="feedingId" value={feeding.id} />
                    <button
                      type="submit"
                      className="text-sm text-red-500 hover:underline"
                    >
                      Törlés
                    </button>
                  </Form>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold">Súlymérések</h2>
          <div className="mt-4 space-y-4">
            {child.weights.map((weight: Weight) => (
              <div key={weight.id} className="rounded-lg bg-white p-4 shadow">
                <p>
                  <strong>Dátum:</strong> {new Date(weight.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Súly:</strong> {weight.weight} g
                </p>
                <div className="mt-2 flex gap-x-2">
                  <Link
                    to={`/weights/${weight.id}/edit`}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Szerkesztés
                  </Link>
                  <Form method="post">
                    <input type="hidden" name="intent" value="deleteWeight" />
                    <input type="hidden" name="weightId" value={weight.id} />
                    <button
                      type="submit"
                      className="text-sm text-red-500 hover:underline"
                    >
                      Törlés
                    </button>
                  </Form>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
