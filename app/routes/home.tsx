import { Link, useLoaderData } from "react-router-dom";
import { prisma } from "~/db.server";
import type { Child } from "@prisma-app/client";

export async function loader() {
  const children = await prisma.child.findMany();
  return { children };
}

export default function Home() {
  const { children } = useLoaderData<typeof loader>();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Baba Napló</h1>

      {children.length === 0 ? (
        <Link to="/children/new" className="text-blue-500 hover:underline">
          Új gyermek hozzáadása
        </Link>
      ) : (
        <div className="mt-4 space-y-4">
          {children.map((child: Child) => (
            <div key={child.id} className="rounded-lg bg-white p-4 shadow">
              <h2 className="text-2xl font-bold">{child.name}</h2>
              <div className="mt-2 flex gap-x-4">
                <Link
                  to={`/children/${child.id}/feedings/new`}
                  className="text-blue-500 hover:underline"
                >
                  Etetés hozzáadása
                </Link>
                <Link
                  to={`/children/${child.id}/weights/new`}
                  className="text-blue-500 hover:underline"
                >
                  Súlymérés hozzáadása
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 border-t pt-8">
        <h2 className="text-2xl font-bold">Általános</h2>
        <div className="mt-2 flex flex-col space-y-2">
          <Link
            to="/pumping-sessions/new"
            className="text-blue-500 hover:underline"
          >
            Új fejés rögzítése
          </Link>
          <Link
            to="/pumping-sessions/analytics"
            className="text-blue-500 hover:underline"
          >
            Fejési statisztikák
          </Link>
          <Link
            to="/feedings/analytics"
            className="text-blue-500 hover:underline"
          >
            Etetési statisztikák
          </Link>
        </div>
      </div>
    </div>
  );
}
