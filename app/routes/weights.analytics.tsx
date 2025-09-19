import { useLoaderData, Link, Form, redirect } from "react-router-dom";
import { prisma } from "~/db.server";
import type { Weight } from "@prisma-app/client";
import type { ActionFunctionArgs } from "react-router-dom";
import { formatDateTime } from "~/utils.ts";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "deleteWeight") {
    const weightId = Number(formData.get("weightId"));
    await prisma.weight.delete({ where: { id: weightId } });
    return redirect(`/weights/analytics`);
  }

  return null;
}

export async function loader() {
  const weights = await prisma.weight.findMany({
    orderBy: {
      date: "desc",
    },
  });

  return { weights };
}

export default function WeightAnalytics() {
  const { weights } = useLoaderData<typeof loader>();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Súlymérési adatok</h1>
      {weights.length === 0 ? (
        <p className="mt-4">Nincsenek rögzített súlymérési adatok.</p>
      ) : (
        <div className="mt-8">
          <ul className="mt-4 space-y-4">
            {(weights as Weight[]).map((weight) => (
              <li key={weight.id} className="rounded-lg bg-white p-4 shadow">
                <p>
                  <strong>Dátum:</strong>{" "}
                  {formatDateTime(new Date(weight.date))}
                </p>
                <p>
                  <strong>Súly:</strong> {weight.weight} g
                </p>
                <div className="flex items-center gap-x-4">
                  <Link
                    to={`/weights/${weight.id}/edit`}
                    className="text-blue-500 hover:underline"
                  >
                    Szerkesztés
                  </Link>
                  <Form method="post">
                    <input type="hidden" name="intent" value="deleteWeight" />
                    <input type="hidden" name="weightId" value={weight.id} />
                    <button
                      type="submit"
                      className="text-red-500 hover:underline"
                    >
                      Törlés
                    </button>
                  </Form>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
