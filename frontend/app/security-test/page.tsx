
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SecurityTestPage() {
  const [result, setResult] = useState("");

  async function testProfileSecurity() {
    const supabase = createClient();

    const { data: userResult, error: authError } =
      await supabase.auth.getUser();

    if (authError || !userResult.user) {
      setResult("Please sign in with a test customer account.");
      return;
    }

    const user = userResult.user;

    const { data, error } = await supabase
  .from("profiles")
  .update({ full_name: "Test Customer" })
  .eq("id", user.id)
  .select("id, full_name");

console.log({ data, error });

    setResult(
      JSON.stringify(
        {
          userId: user.id,
          data,
          error: error
            ? { message: error.message, code: error.code }
            : null,
        },
        null,
        2
      )
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 text-2xl font-bold">
        Profile Authorization Test
      </h1>

      <p className="mb-4">
        Run only in development or staging using a disposable
        customer account.
      </p>

      <button
        onClick={testProfileSecurity}
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        Run Security Test
      </button>

      <pre className="mt-6 overflow-auto rounded bg-gray-100 p-4 text-sm">
        {result || "Test result will appear here."}
      </pre>
    </main>
  );
}