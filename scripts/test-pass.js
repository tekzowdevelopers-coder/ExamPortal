const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testPassedFlow() {
  const baseUrl = "http://localhost:3000";
  console.log("--- Registering Candidate Rahul Verma ---");
  let res = await fetch(baseUrl + "/api/student/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Rahul Verma",
      registrationNumber: "22CS089",
      college: "Indian Institute of Information Technology",
      department: "Data Science & Artificial Intelligence",
      courseCode: "ML15",
      email: "rahul.verma@example.com",
    }),
  });
  let reg = await res.json();
  console.log("Registered candidate:", reg.student?.name);

  // Start exam
  res = await fetch(baseUrl + "/api/exams/" + reg.exam.id + "/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId: reg.student.id }),
  });
  let start = await res.json();
  console.log("Attempt started:", start.attemptId);

  // Fetch actual correct answers from DB
  const qIds = start.questions.map((q) => q.id);
  const dbQs = await prisma.question.findMany({ where: { id: { in: qIds } } });
  const qMap = new Map(dbQs.map((q) => [q.id, q.correctAnswer]));

  const highScoringAnswers = {};
  start.questions.forEach((q, i) => {
    // 25 correct answers
    if (i < 25) {
      highScoringAnswers[q.id] = qMap.get(q.id);
    } else {
      highScoringAnswers[q.id] = "D";
    }
  });

  // Submit exam
  res = await fetch(baseUrl + "/api/exams/" + reg.exam.id + "/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      attemptId: start.attemptId,
      finalAnswers: highScoringAnswers,
      submissionReason: "Manual submit",
    }),
  });
  let submit = await res.json();
  console.log("Pass Test Submission:");
  console.log("Score:", submit.result.score, "/ 30 (" + submit.result.percentage + "%)");
  console.log("Result:", submit.result.result, "isPassed:", submit.result.isPassed);
  console.log("Official Certificate ID Minted:", submit.result.certificateId);

  // Verify public endpoint
  if (submit.result.certificateId) {
    res = await fetch(baseUrl + "/api/certificates/verify/" + submit.result.certificateId);
    let verify = await res.json();
    console.log("--- Public Certificate Verification ---");
    console.log("Verified Status:", verify.verified);
    console.log("Certificate Details:", JSON.stringify(verify.certificate, null, 2));
  }
}

testPassedFlow()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
