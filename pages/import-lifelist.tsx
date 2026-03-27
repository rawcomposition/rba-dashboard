import React from "react";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { useProfile } from "providers/profile";
import { useRouter } from "next/router";
import Header from "components/Header";
import Head from "next/head";
import Button from "components/Button";
import Footer from "components/Footer";
import Icon from "components/Icon";
import Link from "next/link";
import { alerts } from "lib/alerts";

export default function ImportLifelist() {
  const { setLifelist } = useProfile();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { tripId, alertId } = router.query;
  const showBack = router.query.back === "true" && tripId;
  const redirectUrl = tripId ? `/${tripId}` : `/`;

  const alert = alerts.find((a) => a.id === alertId) || alerts[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      Papa.parse(file, {
        header: true,
        complete: async function (results: any) {
          const sciNames = results.data
            .filter((it: any) => it.Countable === "1" && it.Category === "species")
            .map((it: any) => it["Scientific Name"]?.trim())
            .filter(Boolean);

          fileInputRef.current?.value && (fileInputRef.current.value = "");

          setLifelist(alert.id, sciNames);
          toast.success("Life list uploaded");
          router.push(redirectUrl);
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Error processing file");
      fileInputRef.current?.value && (fileInputRef.current.value = "");
    }
  };

  const isRegion = alert.type === "region";
  let stepNumber = 1;

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>Import Life List | RBA Dashboard</title>
      </Head>

      <Header />
      <main className="max-w-2xl w-full mx-auto pb-12">
        {showBack && (
          <Link href={`/${tripId}`} className="text-gray-500 hover:text-gray-600 mt-6 inline-flex items-center">
            ← Back to trip
          </Link>
        )}
        <div className="p-4 md:p-0 mt-8">
          <h1 className="text-3xl font-bold text-gray-700 mb-8">
            <Icon name="feather" className="text-2xl text-lime-600" /> Import {alert.name} Life List
          </h1>
          {isRegion && (
            <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8">
              <h3 className="text-lg font-medium mb-4 text-gray-700">{stepNumber++}. Download life list from eBird</h3>
              <Button
                href={alert.lifelistDownloadUrl}
                target="_blank"
                color="primary"
                size="sm"
                className="inline-flex items-center gap-2"
              >
                <Icon name="download" /> Download Life List
              </Button>
            </div>
          )}
          <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8">
            <h3 className="text-lg font-medium mb-4 text-gray-700">{stepNumber++}. Upload file</h3>
            <p className="text-sm text-gray-600 mb-2">
              {isRegion
                ? "Upload the CSV file you downloaded in the previous step."
                : "Upload a CSV life list file exported from eBird."}
            </p>
            <input ref={fileInputRef} type="file" accept=".csv" className="text-xs" onChange={handleFileUpload} />
          </div>
          <div className="flex">
            <Button href={redirectUrl} color="gray" className="inline-flex items-center ml-auto">
              {tripId ? "Skip" : "Cancel"}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
