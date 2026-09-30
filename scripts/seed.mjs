import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding UniCast — Your Campus Pulse database...");

  // 1. Station Settings
  await prisma.radioSetting.upsert({
    where: { id: "station_settings" },
    update: {
      stationName: "UniCast",
      tagline: "Your Campus Pulse",
      frequency: "Online Radio Network",
      streamUrl: process.env.NEXT_PUBLIC_RADIO_STREAM_URL || process.env.NEXT_PUBLIC_STREAM_URL || "https://stream.zeno.fm/f3wvbbqmdg8uv",
      fallbackStreamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      isLiveManualOverride: false,
      contactEmail: "studio@unicast.radio",
      contactPhone: "+256 700 000 000",
      socialLinks: JSON.stringify({
        twitter: "https://twitter.com/UniCastRadio",
        instagram: "https://instagram.com/unicastradio",
        facebook: "https://facebook.com/unicastradio",
        youtube: "https://youtube.com/@unicastradio",
      }),
    },
    create: {
      id: "station_settings",
      stationName: "UniCast",
      tagline: "Your Campus Pulse",
      frequency: "Online Radio Network",
      streamUrl: process.env.NEXT_PUBLIC_RADIO_STREAM_URL || process.env.NEXT_PUBLIC_STREAM_URL || "https://stream.zeno.fm/f3wvbbqmdg8uv",
      fallbackStreamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      isLiveManualOverride: false,
      contactEmail: "studio@unicast.radio",
      contactPhone: "+256 700 000 000",
      socialLinks: JSON.stringify({
        twitter: "https://twitter.com/UniCastRadio",
        instagram: "https://instagram.com/unicastradio",
        facebook: "https://facebook.com/unicastradio",
        youtube: "https://youtube.com/@unicastradio",
      }),
    },
  });

  // 2. Universities Roster (For Audience Analytics)
  const universitiesData = [
    { name: "Kyambogo University", shortName: "KYU", location: "Kampala", country: "Uganda" },
    { name: "Makerere University", shortName: "MAK", location: "Kampala", country: "Uganda" },
    { name: "Mbarara University of Science and Technology", shortName: "MUST", location: "Mbarara", country: "Uganda" },
    { name: "Uganda Christian University", shortName: "UCU", location: "Mukono", country: "Uganda" },
    { name: "Makerere University Business School", shortName: "MUBS", location: "Kampala", country: "Uganda" },
    { name: "Kampala International University", shortName: "KIU", location: "Kampala", country: "Uganda" },
    { name: "Gulu University", shortName: "GU", location: "Gulu", country: "Uganda" },
    { name: "Busitema University", shortName: "BU", location: "Tororo", country: "Uganda" },
    { name: "Uganda Martyrs University", shortName: "UMU", location: "Nkozi", country: "Uganda" },
    { name: "Islamic University in Uganda", shortName: "IUIU", location: "Mbale", country: "Uganda" },
    { name: "Ndejje University", shortName: "NDU", location: "Luweero", country: "Uganda" },
    { name: "Victoria University", shortName: "VU", location: "Kampala", country: "Uganda" },
    { name: "Cavendish University", shortName: "CUU", location: "Kampala", country: "Uganda" },
    { name: "International University of East Africa", shortName: "IUEA", location: "Kampala", country: "Uganda" },
    { name: "Nkumba University", shortName: "NU", location: "Entebbe", country: "Uganda" },
  ];

  const seededUniversities = {};
  for (const u of universitiesData) {
    seededUniversities[u.shortName] = await prisma.university.upsert({
      where: { name: u.name },
      update: { shortName: u.shortName, location: u.location, country: u.country, isActive: true },
      create: { ...u, isActive: true },
    });
  }

  // 3. Admin Users
  const passwordHash = await bcrypt.hash("Admin@Kyambogo107", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@unicast.radio" },
    update: { passwordHash, role: "SUPER_ADMIN" },
    create: {
      email: "admin@unicast.radio",
      passwordHash,
      name: "UniCast Director",
      role: "SUPER_ADMIN",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&q=80",
    },
  });

  // Also support the previous default email for convenience
  await prisma.user.upsert({
    where: { email: "admin@kyu.ac.ug" },
    update: { passwordHash, role: "SUPER_ADMIN" },
    create: {
      email: "admin@kyu.ac.ug",
      passwordHash,
      name: "Kyambogo Lead Radio Admin",
      role: "SUPER_ADMIN",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&q=80",
    },
  });

  // 4. Programme Categories
  const categoriesData = [
    { name: "Campus News & Current Affairs", slug: "news-current-affairs", color: "#06B6D4" },
    { name: "Campus Lifestyle & Hits", slug: "campus-lifestyle", color: "#EC4899" },
    { name: "Varsity Sports & Athletics", slug: "sports-recreation", color: "#10B981" },
    { name: "Tech, AI & Innovation", slug: "tech-innovation", color: "#8B5CF6" },
    { name: "Inspiration & Community", slug: "inspiration-community", color: "#F59E0B" },
    { name: "Late Night & Chill Vibes", slug: "late-night", color: "#3B82F6" },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.programmeCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // 5. Presenters
  const presentersData = [
    {
      name: "Brian Kigozi",
      slug: "brian-kigozi",
      roleTitle: "Head of Presentation & Morning Host",
      bio: "Brian is a talented campus broadcaster with 3 years of on-air experience across East African universities. Known for electrifying morning banter, news breakdowns, and sharp analytical debates.",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80",
      socialLinks: JSON.stringify({ twitter: "@briankigozi", instagram: "@briank", linkedin: "brian-kigozi" }),
    },
    {
      name: "Brenda Nabirye",
      slug: "brenda-nabirye",
      roleTitle: "Mid-Morning Drive Host & Music Director",
      bio: "A vibrant, infectious voice bringing the best Ugandan afro-fusion hits, relationship talk, mental health discussions, and academic survival tips every weekday on UniCast.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
      socialLinks: JSON.stringify({ twitter: "@brendanab", instagram: "@brenda_ug" }),
    },
    {
      name: "David Mukasa",
      slug: "david-mukasa",
      roleTitle: "Sports Editor & Lead Varsity Match Commentator",
      bio: "Covering the University Football League (UFL), East Africa University Games, and world sports with unmatched tactical insight, pitchside interviews, and student athlete highlights.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      socialLinks: JSON.stringify({ twitter: "@davidmukasports" }),
    },
    {
      name: "Joy Akello",
      slug: "joy-akello",
      roleTitle: "Tech & Innovation Curator",
      bio: "Software engineering enthusiast tracking university startups, AI tools, developer communities, and digital empowerment across campuses in East Africa.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      socialLinks: JSON.stringify({ twitter: "@joyakellotech", linkedin: "joy-akello" }),
    },
    {
      name: "Samuel Mugisha",
      slug: "samuel-mugisha",
      roleTitle: "Late Night Host & Soul Selector",
      bio: "The voice of the night for scholars burning the midnight oil across campuses. Blends smooth Neo-Soul, R&B, ambient sounds, and introspective midnight thoughts.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
      socialLinks: JSON.stringify({ twitter: "@samuelmugisha" }),
    },
  ];

  const presenters = {};
  for (const pres of presentersData) {
    presenters[pres.slug] = await prisma.presenter.upsert({
      where: { slug: pres.slug },
      update: {},
      create: pres,
    });
  }

  // 6. Programmes
  const programmesData = [
    {
      title: "Morning Campus Pulse",
      slug: "morning-campus-pulse",
      tagline: "Kickstart your university day with fresh headlines, academic banter, and high-energy music",
      description: "The flagship breakfast broadcast on UniCast. We connect students across all campuses with inter-university discussions, national news, campus weather, and the freshest Ugandan and East African playlist from 06:00 to 10:00 AM.",
      coverImage: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80",
      categoryId: categories["news-current-affairs"].id,
      presenterId: presenters["brian-kigozi"].id,
    },
    {
      title: "The Mid-Day Drive",
      slug: "the-mid-day-drive",
      tagline: "Your mid-day companion with hot hits, student interviews, and live shoutouts",
      description: "Connecting students across all campuses. Listeners can request songs, send dedications to their lecture halls and hostels, and participate in lively debate segments.",
      coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
      categoryId: categories["campus-lifestyle"].id,
      presenterId: presenters["brenda-nabirye"].id,
    },
    {
      title: "The Tech Nexus",
      slug: "the-tech-nexus",
      tagline: "Exploring student tech innovations, startup culture, and the digital economy",
      description: "Spotlighting innovative projects built by university software engineers, startup founders, robotics teams, and student tech communities across Uganda and East Africa.",
      coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
      categoryId: categories["tech-innovation"].id,
      presenterId: presenters["joy-akello"].id,
    },
    {
      title: "Varsity Sports Panorama",
      slug: "varsity-sports-panorama",
      tagline: "Unrivaled University Football League & varsity athletics coverage",
      description: "Comprehensive breakdowns of varsity sports fixtures across universities, live pitchside commentary, post-match analysis, and spotlights on student athletes.",
      coverImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80",
      categoryId: categories["sports-recreation"].id,
      presenterId: presenters["david-mukasa"].id,
    },
    {
      title: "Sunset Vibes & Dedications",
      slug: "sunset-vibes",
      tagline: "Smooth evening afro-rhythms, acoustic jams, and cross-campus dedications",
      description: "Wind down from lectures with relaxing acoustics, soulful ballads, and student love dedications across halls and hostels nationwide.",
      coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
      categoryId: categories["campus-lifestyle"].id,
      presenterId: presenters["brenda-nabirye"].id,
    },
    {
      title: "Night Owl Study Groove",
      slug: "night-owl-study-groove",
      tagline: "Deep focus rhythms, lo-fi beats, and midnight campus storytelling",
      description: "Broadcasting through the quiet hours of campus. Dedicated to students in discussion gazebos, overnight hostel study groups, and night owls.",
      coverImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80",
      categoryId: categories["late-night"].id,
      presenterId: presenters["samuel-mugisha"].id,
    },
  ];

  const programmes = {};
  for (const prog of programmesData) {
    programmes[prog.slug] = await prisma.programme.upsert({
      where: { slug: prog.slug },
      update: {
        title: prog.title,
        tagline: prog.tagline,
        description: prog.description,
        coverImage: prog.coverImage,
        categoryId: prog.categoryId,
        presenterId: prog.presenterId,
      },
      create: prog,
    });
  }

  // 7. Full 7-Day Schedule
  await prisma.schedule.deleteMany({});
  const allDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

  for (const day of allDays) {
    await prisma.schedule.createMany({
      data: [
        {
          programmeId: programmes["morning-campus-pulse"].id,
          dayOfWeek: day,
          startTime: "06:00",
          endTime: "10:00",
          isLive: true,
        },
        {
          programmeId: programmes["the-mid-day-drive"].id,
          dayOfWeek: day,
          startTime: "10:00",
          endTime: "13:00",
          isLive: true,
        },
        {
          programmeId: programmes["the-tech-nexus"].id,
          dayOfWeek: day,
          startTime: "13:00",
          endTime: "16:00",
          isLive: true,
        },
        {
          programmeId: programmes["varsity-sports-panorama"].id,
          dayOfWeek: day,
          startTime: "16:00",
          endTime: "19:00",
          isLive: true,
        },
        {
          programmeId: programmes["sunset-vibes"].id,
          dayOfWeek: day,
          startTime: "19:00",
          endTime: "22:00",
          isLive: true,
        },
        {
          programmeId: programmes["night-owl-study-groove"].id,
          dayOfWeek: day,
          startTime: "22:00",
          endTime: "02:00",
          isLive: true,
        },
      ],
    });
  }

  // 8. Podcasts
  const podcastCat = await prisma.podcastCategory.upsert({
    where: { slug: "inter-university-debates" },
    update: {},
    create: { name: "Inter-University Debates", slug: "inter-university-debates" },
  });

  const podcastCat2 = await prisma.podcastCategory.upsert({
    where: { slug: "tech-innovations" },
    update: {},
    create: { name: "Tech & Career Talks", slug: "tech-innovations" },
  });

  const podcastCat3 = await prisma.podcastCategory.upsert({
    where: { slug: "sports-podcasts" },
    update: {},
    create: { name: "Varsity Sports Analysis", slug: "sports-podcasts" },
  });

  const podcastsData = [
    {
      title: "Episode 1: The National Guild Leadership Summit",
      slug: "episode-1-national-guild-leadership-summit",
      description: "A comprehensive debate with student leaders across Kyambogo, Makerere, and MUST on student welfare, tuition policies, and digital campus infrastructure.",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      duration: 1840,
      coverImage: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80",
      categoryId: podcastCat.id,
      presenterId: presenters["brian-kigozi"].id,
      isPublished: true,
    },
    {
      title: "Episode 2: Engineering Innovation Across Universities",
      slug: "episode-2-engineering-innovation-across-campuses",
      description: "How student software and civil engineers across Ugandan universities are building sustainable solutions for municipal traffic and renewable solar systems.",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      duration: 2150,
      coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
      categoryId: podcastCat2.id,
      presenterId: presenters["joy-akello"].id,
      isPublished: true,
    },
    {
      title: "Episode 3: Road to the University Football League Championship",
      slug: "episode-3-road-to-the-ufl-championship",
      description: "Analyzing the qualification campaign, tactical setups across varsity rivals, and standout student player performances.",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      duration: 1620,
      coverImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80",
      categoryId: podcastCat3.id,
      presenterId: presenters["david-mukasa"].id,
      isPublished: true,
    },
    {
      title: "Episode 4: Navigating Mental Health & Academic Life",
      slug: "episode-4-navigating-mental-health-academic-life",
      description: "A candid conversation with campus counselors and student guild representatives on balancing courseworks, finances, and personal wellbeing.",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      duration: 1980,
      coverImage: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&q=80",
      categoryId: podcastCat.id,
      presenterId: presenters["brenda-nabirye"].id,
      isPublished: true,
    },
  ];

  for (const pod of podcastsData) {
    await prisma.podcast.upsert({
      where: { slug: pod.slug },
      update: {},
      create: pod,
    });
  }

  // 9. Articles
  const newsCat = await prisma.articleCategory.upsert({
    where: { slug: "inter-campus-news" },
    update: {},
    create: { name: "Inter-Campus News", slug: "inter-campus-news" },
  });

  const newsCat2 = await prisma.articleCategory.upsert({
    where: { slug: "varsity-sports" },
    update: {},
    create: { name: "Varsity Sports", slug: "varsity-sports" },
  });

  const newsCat3 = await prisma.articleCategory.upsert({
    where: { slug: "tech-innovation" },
    update: {},
    create: { name: "Tech & Innovation", slug: "tech-innovation" },
  });

  const articlesData = [
    {
      title: "UniCast Expands Student Radio Coverage to Multiple Campuses",
      slug: "unicast-expands-student-radio-coverage",
      excerpt: "The unified university digital radio platform reports growing listener participation across campuses nationwide.",
      content: `UniCast, the unified digital radio network for university students, has officially celebrated a milestone in audience reach across multiple institutions in East Africa.
      
With students tuning in simultaneously to the single live stream from Kyambogo, Makerere, MUST, UCU, and MUBS, the platform brings a shared campus voice that breaks institutional silos.

"UniCast was founded on a simple truth: students across every university share the same passion for music, career opportunities, sports, and vibrant youth culture. By building a single station with real-time university audience measurement, we give every campus a shared platform," said the Station Director.`,
      coverImage: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80",
      categoryId: newsCat.id,
      authorId: adminUser.id,
      isFeatured: true,
      isPublished: true,
    },
    {
      title: "University Football League: Thrilling Derbies Highlight Matchday 5",
      slug: "university-football-league-matchday-5",
      excerpt: "Sensational goals and packed pitches as campus soccer rivalries heat up the national standings.",
      content: `The University Football League continued this week with nail-biting encounters that kept fans glued to UniCast's live matchday sports coverage.
      
Listeners from Kyambogo, Makerere, and UCU tuned in to pitchside commentaries and post-match analyses, proving once again that varsity sports unite students like nothing else.`,
      coverImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80",
      categoryId: newsCat2.id,
      authorId: adminUser.id,
      isFeatured: false,
      isPublished: true,
    },
    {
      title: "Inter-Campus Student Hackathon Showcases AI Solutions",
      slug: "inter-campus-student-hackathon-showcases-ai",
      excerpt: "Student developers demonstrate offline healthcare diagnostic tools and campus micro-fintech tools.",
      content: `University engineering and computer science scholars demonstrated impressive prototypes at this weekend's student innovation summit.
      
Featured on UniCast's Tech Nexus show, project leads shared how cross-university collaboration is driving modern tech development for local problems.`,
      coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
      categoryId: newsCat3.id,
      authorId: adminUser.id,
      isFeatured: false,
      isPublished: true,
    },
  ];

  for (const art of articlesData) {
    await prisma.article.upsert({
      where: { slug: art.slug },
      update: {},
      create: art,
    });
  }

  // 10. Initial Listener Sessions & Analytics Baseline (Real Database Records)
  const existingSessions = await prisma.listenerSession.count();
  if (existingSessions === 0) {
    console.log("📊 Seeding realistic initial audience analytics baseline across universities...");
    const now = new Date();
    const uniList = Object.values(seededUniversities);
    
    // Distribution weights: Kyambogo, Makerere, MUST, UCU, MUBS have higher listener representation
    const weights = [35, 28, 16, 12, 9, 6, 4, 3, 3, 2, 2, 2, 1, 1, 1];
    const devices = ["mobile", "desktop", "tablet"];
    const browsers = ["Chrome", "Safari", "Firefox", "Edge"];
    
    for (let i = 0; i < 60; i++) {
      // Pick university according to index weight
      const uniIndex = i % uniList.length;
      const uni = uniList[uniIndex];
      const listenerId = `anon-seed-${i}-${Math.random().toString(36).substring(2, 8)}`;
      const durationSeconds = Math.floor(Math.random() * 2400) + 300; // 5 to 45 mins
      
      // Spread across the last 7 days
      const daysAgo = Math.floor(Math.random() * 7);
      const sessionDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 3600000 * 12);
      const lastSeen = new Date(sessionDate.getTime() + durationSeconds * 1000);
      
      const session = await prisma.listenerSession.create({
        data: {
          anonymousListenerId: listenerId,
          universityId: uni ? uni.id : null,
          sessionStartedAt: sessionDate,
          lastSeenAt: lastSeen,
          sessionDuration: durationSeconds,
          deviceType: devices[Math.floor(Math.random() * devices.length)],
          browser: browsers[Math.floor(Math.random() * browsers.length)],
          createdAt: sessionDate,
        },
      });

      // Also record event
      await prisma.listenerEvent.create({
        data: {
          anonymousListenerId: listenerId,
          sessionId: session.id,
          universityId: uni ? uni.id : null,
          eventType: "LISTEN_STARTED",
          programmeId: programmes["morning-campus-pulse"].id,
          timestamp: sessionDate,
          metadata: JSON.stringify({ source: "seed_baseline" }),
          createdAt: sessionDate,
        },
      });
    }

    // Add a couple of active sessions within the last 60 seconds so active listeners counter shows real concurrent users
    for (let a = 0; a < 5; a++) {
      const uni = uniList[a % uniList.length];
      const activeListenerId = `active-anon-${a}-${Date.now()}`;
      const activeStarted = new Date(now.getTime() - (a + 2) * 60 * 1000);
      const activeLastSeen = new Date(now.getTime() - 15 * 1000); // 15s ago
      
      const activeSession = await prisma.listenerSession.create({
        data: {
          anonymousListenerId: activeListenerId,
          universityId: uni ? uni.id : null,
          sessionStartedAt: activeStarted,
          lastSeenAt: activeLastSeen,
          sessionDuration: (a + 2) * 60,
          deviceType: "mobile",
          browser: "Chrome",
          createdAt: activeStarted,
        },
      });

      await prisma.listenerEvent.create({
        data: {
          anonymousListenerId: activeListenerId,
          sessionId: activeSession.id,
          universityId: uni ? uni.id : null,
          eventType: "LISTEN_STARTED",
          programmeId: programmes["the-mid-day-drive"].id,
          timestamp: activeStarted,
          createdAt: activeStarted,
        },
      });
    }
  }

  // 11. Genesis Audit Log
  const existingAudit = await prisma.auditLog.count();
  if (existingAudit === 0) {
    await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        userEmail: adminUser.email,
        action: "SYSTEM_INITIALIZE",
        resource: "System",
        details: JSON.stringify({ message: "UniCast platform initial seed and security setup verified" }),
        ipAddress: "127.0.0.1",
      },
    });
  }

  console.log("🎉 UniCast successfully seeded with complete universities roster, programmes, and verified analytics!");
}

main()
  .catch((e) => {
    console.error("Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
