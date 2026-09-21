async function testImport() {
  const baseUrl = "http://localhost:3000";
  // Admin login first
  let res = await fetch(baseUrl + "/api/admin/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@tekzow.com", password: "admin123" }),
  });
  let auth = await res.json();
  const token = auth.token;

  // Fetch course
  res = await fetch(baseUrl + "/api/courses");
  let c = await res.json();
  const courseId = c.courses[0].id;

  const sampleCsv = `Question,Option A,Option B,Option C,Option D,Correct Answer,Marks,Topic,Difficulty,Explanation
"What is deep learning?","Subfield of ML using neural networks","A spreadsheet formula","Database query","Hardware chip","A",1,"Deep Learning","EASY","Neural networks"
"Invalid Question Row","Only A","Only B","","","E",1,"Misc","EASY",""`;

  console.log("--- Testing CSV Validation Preview ---");
  res = await fetch(baseUrl + "/api/questions/import", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      courseId,
      csvContent: sampleCsv,
      commit: false,
    }),
  });
  let preview = await res.json();
  console.log("Import preview status:", res.status);
  console.log(
    "Total Found:",
    preview.totalFound,
    "| Valid:",
    preview.validCount,
    "| Invalid:",
    preview.invalidCount
  );
  console.log("Detected errors preview:", preview.errors);

  console.log("--- Testing CSV Commit for Valid Records ---");
  res = await fetch(baseUrl + "/api/questions/import", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      courseId,
      csvContent: sampleCsv,
      commit: true,
    }),
  });
  let commit = await res.json();
  console.log("Committed count:", commit.importedCount, "| Skipped count:", commit.skippedCount);
}

testImport().catch(console.error);
