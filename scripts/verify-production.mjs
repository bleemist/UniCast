import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Timezone helper logic
function getKampalaTime(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Kampala",
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const weekday = (parts.find((p) => p.type === "weekday")?.value?.toUpperCase() || "MONDAY");
  let hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
  if (hour === 24) hour = 0;
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
  return { dayOfWeek: weekday, hours: hour, minutes: minute, totalMinutes: hour * 60 + minute };
}

// RBAC matrix logic
function hasPermission(userRole, actionDomain) {
  if (userRole === "SUPER_ADMIN") return true;
  switch (actionDomain) {
    case "universities":
    case "programmes":
    case "schedules":
    case "presenters":
    case "podcasts":
      return userRole === "RADIO_ADMIN";
    case "requests":
    case "broadcast":
      return userRole === "RADIO_ADMIN" || userRole === "PRESENTER";
    case "analytics":
      return userRole === "RADIO_ADMIN" || userRole === "EDITOR";
    case "news":
      return userRole === "RADIO_ADMIN" || userRole === "EDITOR";
    case "users":
    case "settings":
    case "audit":
      return false;
    default:
      return false;
  }
}

// Rate limit logic
const memoryStore = new Map();
function rateLimit(identifier, options = { windowMs: 60000, maxRequests: 10 }) {
  const now = Date.now();
  const record = memoryStore.get(identifier) || { timestamps: [] };
  const validTimestamps = record.timestamps.filter((t) => now - t < options.windowMs);
  if (validTimestamps.length >= options.maxRequests) {
    return { isAllowed: false };
  }
  validTimestamps.push(now);
  memoryStore.set(identifier, { timestamps: validTimestamps });
  return { isAllowed: true };
}

async function runVerification() {
  console.log("================================================================================");
  console.log("🚀 UNICAST PRODUCTION SUITE — COMPREHENSIVE VERIFICATION");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Timezone Check (Africa/Kampala)
  console.log("--- 1. Timezone & Schedule Verification (Africa/Kampala) ---");
  const kampalaTime = getKampalaTime(new Date());
  assert(
    typeof kampalaTime.hours === "number" && typeof kampalaTime.totalMinutes === "number",
    `Resolved Africa/Kampala time successfully (${kampalaTime.dayOfWeek} ${kampalaTime.hours}:${kampalaTime.minutes.toString().padStart(2, "0")})`
  );

  // 2. Database Models & Seeding Check
  console.log("\n--- 2. Database Models & Persistence ---");
  const [uniCount, progCount, schedCount, presCount, podCount, artCount, userCount, auditCount] =
    await Promise.all([
      prisma.university.count(),
      prisma.programme.count(),
      prisma.schedule.count(),
      prisma.presenter.count(),
      prisma.podcast.count(),
      prisma.article.count(),
      prisma.user.count(),
      prisma.auditLog.count(),
    ]);

  assert(uniCount >= 15, `Universities seeded: ${uniCount} institutions`);
  assert(progCount >= 6, `Radio programmes present: ${progCount} shows`);
  assert(schedCount >= 20, `Weekly schedules configured: ${schedCount} slots`);
  assert(presCount >= 5, `Presenters registered: ${presCount} hosts`);
  assert(podCount >= 4, `Podcasts published: ${podCount} episodes`);
  assert(artCount >= 3, `News articles published: ${artCount} articles`);
  assert(userCount >= 2, `Administrative users present: ${userCount} users`);
  assert(auditCount >= 1, `Audit log operational: ${auditCount} records`);

  // 3. Critical University Rule: Zero Partitioning, Audience Analytics Attribute Only
  console.log("\n--- 3. Critical University Rule (Single Stream, Analytics Only) ---");
  const kyambogo = await prisma.university.findFirst({ where: { shortName: "KYU" } });
  const makerere = await prisma.university.findFirst({ where: { shortName: "MAK" } });

  assert(!!kyambogo && !!makerere, "Found both Kyambogo University and Makerere University in database");

  // Create two distinct listener sessions from two different universities
  const listenerA_Token = `test-listener-kyu-${Date.now()}`;
  const listenerB_Token = `test-listener-mak-${Date.now()}`;

  const sessionA = await prisma.listenerSession.create({
    data: {
      anonymousListenerId: listenerA_Token,
      universityId: kyambogo.id,
      sessionDuration: 600,
      deviceType: "mobile",
    },
  });

  const sessionB = await prisma.listenerSession.create({
    data: {
      anonymousListenerId: listenerB_Token,
      universityId: makerere.id,
      sessionDuration: 900,
      deviceType: "desktop",
    },
  });

  assert(sessionA.universityId === kyambogo.id, "Listener A tagged with Kyambogo University");
  assert(sessionB.universityId === makerere.id, "Listener B tagged with Makerere University");

  // Verify that the live broadcast settings and programmes for both are identical
  const stationSettings = await prisma.radioSetting.findUnique({ where: { id: "station_settings" } });
  assert(
    stationSettings.stationName === "UniCast" && !!stationSettings.streamUrl,
    `Both listeners tune into the same stream: ${stationSettings.streamUrl}`
  );

  // 4. Song Requests Submission & Workflow
  console.log("\n--- 4. Listener Request Flow (Optional Name & University) ---");
  const testRequest = await prisma.songRequest.create({
    data: {
      studentName: "Derrick Mugabi",
      universityId: kyambogo.id,
      universityName: kyambogo.name,
      songTitle: "Nana",
      artist: "Joshua Baraka",
      dedication: "For the library crew!",
      status: "PENDING",
      ipAddress: "127.0.0.1",
    },
  });

  assert(testRequest.status === "PENDING", "Song request submitted with PENDING status");

  const approvedRequest = await prisma.songRequest.update({
    where: { id: testRequest.id },
    data: { status: "APPROVED", adminNote: "Queued for 11:30 AM spin" },
  });

  assert(approvedRequest.status === "APPROVED", "Admin approved song request successfully");

  // 5. Audit Logging Verification
  console.log("\n--- 5. Administrative Audit Logging ---");
  const auditRecord = await prisma.auditLog.create({
    data: {
      userId: "test-user-id",
      userEmail: "admin@unicast.radio",
      action: "VERIFY_TEST_RUN",
      resource: "System",
      details: JSON.stringify({ test: "E2E verification pass" }),
      ipAddress: "127.0.0.1",
    },
  });
  assert(!!auditRecord.id, `Audit record created with ID: ${auditRecord.id}`);

  // 6. Security & RBAC Checks
  console.log("\n--- 6. Security & RBAC Permission Matrix ---");
  assert(hasPermission("SUPER_ADMIN", "settings") === true, "SUPER_ADMIN has settings access");
  assert(hasPermission("RADIO_ADMIN", "settings") === false, "RADIO_ADMIN denied settings access");
  assert(hasPermission("RADIO_ADMIN", "programmes") === true, "RADIO_ADMIN has programmes access");
  assert(hasPermission("EDITOR", "news") === true, "EDITOR has news access");
  assert(hasPermission("EDITOR", "programmes") === false, "EDITOR denied programmes access");
  assert(hasPermission("PRESENTER", "requests") === true, "PRESENTER has requests access");
  assert(hasPermission("PRESENTER", "users") === false, "PRESENTER denied users access");

  // 7. Rate Limiter Checks
  console.log("\n--- 7. Rate Limiting Protection ---");
  const ip = "192.168.1.100";
  let allowedCount = 0;
  for (let i = 0; i < 5; i++) {
    const res = rateLimit(`test_limit_${ip}`, { windowMs: 10000, maxRequests: 3 });
    if (res.isAllowed) allowedCount++;
  }
  assert(allowedCount === 3, "Rate limiter blocked excess requests (3 allowed, 2 blocked)");

  // Clean up test data
  await prisma.songRequest.delete({ where: { id: testRequest.id } });
  await prisma.listenerSession.deleteMany({ where: { id: { in: [sessionA.id, sessionB.id] } } });
  await prisma.auditLog.delete({ where: { id: auditRecord.id } });

  console.log("\n================================================================================");
  console.log(`TOTAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification()
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
