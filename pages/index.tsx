import React from "react";
import Header from "components/Header";
import AlertColumn from "components/rba/AlertColumn";
import Head from "next/head";
import { alerts } from "lib/alerts";
import { Tab } from "@headlessui/react";
import clsx from "clsx";

export default function Home() {
  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>RBA Dashboard</title>
      </Head>

      <Header />
      <main className="h-[calc(100%-60px)]">
        {/* Desktop: side-by-side columns */}
        <div
          className="hidden md:grid h-full"
          style={{ gridTemplateColumns: `repeat(${alerts.length}, minmax(0, 1fr))` }}
        >
          {alerts.map((alert) => (
            <div key={alert.id} className="overflow-hidden border-r border-gray-200 last:border-r-0">
              <AlertColumn alert={alert} showTitle />
            </div>
          ))}
        </div>

        {/* Mobile: tabs */}
        <div className="md:hidden h-full flex flex-col">
          {alerts.length === 1 ? (
            <AlertColumn alert={alerts[0]} showTitle />
          ) : (
            <Tab.Group>
              <Tab.List className="flex border-b border-gray-200 bg-white shrink-0">
                {alerts.map((alert) => (
                  <Tab
                    key={alert.id}
                    className={({ selected }) =>
                      clsx(
                        "flex-1 py-2.5 text-sm font-medium outline-none transition-colors",
                        selected ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"
                      )
                    }
                  >
                    {alert.name}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels className="flex-1 overflow-hidden">
                {alerts.map((alert) => (
                  <Tab.Panel key={alert.id} className="h-full" unmount={false}>
                    <AlertColumn alert={alert} showTitle />
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </Tab.Group>
          )}
        </div>
      </main>
    </div>
  );
}
