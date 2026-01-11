import React from "react";
import Header from "components/Header";
import Head from "next/head";
import LoginModal from "components/LoginModal";
import List from "components/List";

export default function Home() {
  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>RBA Dashboard</title>
      </Head>

      <Header />
      <main className="h-[calc(100%-60px)]">
        <div className="flex gap-6 p-6">
          <List code="US" label="Lower 48" type="rare" exclude={["US-AK", "US-HI"]} />
          <List code="US-CA" label="California" type="rare" />
        </div>
      </main>
      <LoginModal />
    </div>
  );
}
