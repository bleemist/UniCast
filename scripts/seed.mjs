import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Enriching Kyambogo Radio database with comprehensive campus data...");

  // 1. Station Settings
  await prisma.radioSetting.upsert({
    where: { id: "station_settings" },
    update: {},
    create: {
      id: "station_settings",
      stationName: "Kyambogo Radio",
      tagline: "The Voice of Kyambogo University",
      frequency: "107.4 FM & Online",
      streamUrl: process.env.NEXT_PUBLIC_STREAM_URL || "https://stream.zeno.fm/f3wvbbqmdg8uv",
      fallbackStreamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      isLiveManualOverride: false,
      contactEmail: "radio@kyu.ac.ug",
      contactPhone: "+256 700 000 000",
      socialLinks: JSON.stringify({
        twitter: "https://twitter.com/KyambogoRadio",
        instagram: "https://instagram.com/kyambogoradio",
        facebook: "https://facebook.com/kyambogoradio",
        youtube: "https://youtube.com/@kyambogoradio",
      }),
    },
  });

  // 2. Default Super Admin User
  const passwordHash = await bcrypt.hash("Admin@Kyambogo107", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@kyu.ac.ug" },
    update: { passwordHash },
    create: {
      email: "admin@kyu.ac.ug",
      passwordHash,
      name: "Station Director",
      role: "SUPER_ADMIN",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&q=80",
    },
  });

  // 3. Programme Categories
  const categoriesData = [
    { name: "News & Current Affairs", slug: "news-current-affairs", color: "#06B6D4" },
    { name: "Campus Lifestyle & Hits", slug: "campus-lifestyle", color: "#EC4899" },
    { name: "Sports & Recreation", slug: "sports-recreation", color: "#10B981" },
    { name: "Tech & Innovation", slug: "tech-innovation", color: "#8B5CF6" },
    { name: "Gospel & Inspiration", slug: "gospel-inspiration", color: "#F59E0B" },
    { name: "Late Night & Vibes", slug: "late-night", color: "#3B82F6" },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.programmeCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // 4. Presenters
  const presentersData = [
    {
      name: "Brian Kigozi",
      slug: "brian-kigozi",
      roleTitle: "Head of Presentation & Morning Anchor",
      bio: "Brian is a final year Mass Communication scholar with 3 years of on-air broadcast experience. Known for electrifying morning campus banter, breaking news breakdowns, and sharp analytical debates.",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80",
      socialLinks: JSON.stringify({ twitter: "@briankigozi", instagram: "@briank", linkedin: "brian-kigozi" }),
    },
    {
      name: "Brenda Nabirye",
      slug: "brenda-nabirye",
      roleTitle: "Mid-Morning Drive Anchor & Music Lead",
      bio: "A vibrant, infectious voice bringing the best Ugandan afro-fusion hits, relationship talk, mental health discussions, and academic survival tips every weekday.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
      socialLinks: JSON.stringify({ twitter: "@brendanab", instagram: "@brenda_ug" }),
    },
    {
      name: "David Mukasa",
      slug: "david-mukasa",
      roleTitle: "Sports Editor & Lead Match Commentator",
      bio: "Covering University Football League (UFL), East Africa University Games, and world sports with unmatched tactical insight, pitchside interviews, and student athlete highlights.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      socialLinks: JSON.stringify({ twitter: "@davidmukasports" }),
    },
    {
      name: "Joy Akello",
      slug: "joy-akello",
      roleTitle: "Tech & Innovation Curator",
      bio: "Software engineering enthusiast tracking tech startups at the Kyambogo University Incubation Centre, AI tools, developer communities, and digital empowerment across East Africa.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      socialLinks: JSON.stringify({ twitter: "@joyakellotech", linkedin: "joy-akello" }),
    },
    {
      name: "Samuel Mugisha",
      slug: "samuel-mugisha",
      roleTitle: "Late Night Host & Soul Selector",
      bio: "The voice of the night for scholars burning the midnight oil in the library. Blends smooth Neo-Soul, R&B, ambient sounds, and introspective midnight thoughts.",
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

  // 5. Programmes
  const programmesData = [
    {
      title: "Kyambogo Morning Rise",
      slug: "kyambogo-morning-rise",
      tagline: "Kickstart your campus day with fresh headlines, traffic, and high-energy music",
      description: "The official breakfast show on 107.4 FM. We break down guild news, academic announcements, viral campus trends, weather, and the freshest Ugandan playlist from 06:00 to 10:00 AM.",
      coverImage: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80",
      categoryId: categories["news-current-affairs"].id,
      presenterId: presenters["brian-kigozi"].id,
    },
    {
      title: "Campus Pulse 107",
      slug: "campus-pulse-107",
      tagline: "Your mid-day companion with hot hits, student interviews, and live shoutouts",
      description: "Connecting students across all faculties: Engineering, Science, Arts, and Education. Listeners can request songs, send dedications, and participate in lively debate segments.",
      coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
      categoryId: categories["campus-lifestyle"].id,
      presenterId: presenters["brenda-nabirye"].id,
    },
    {
      title: "The Tech Nexus",
      slug: "the-tech-nexus",
      tagline: "Exploring student tech innovations, coding culture, and digital economy",
      description: "Spotlighting innovative projects built by Kyambogo University engineers, startup founders, robotics teams, and developer communities in Kampala.",
      coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
      categoryId: categories["tech-innovation"].id,
      presenterId: presenters["joy-akello"].id,
    },
    {
      title: "Varsity Sports Panorama",
      slug: "varsity-sports-panorama",
      tagline: "Unrivaled University Football League & varsity athletics coverage",
      description: "Comprehensive breakdowns of varsity sports fixtures, live pitchside commentary, post-match analysis, and spotlights on university champions.",
      coverImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80",
      categoryId: categories["sports-recreation"].id,
      presenterId: presenters["david-mukasa"].id,
    },
    {
      title: "Sunset Melodies & Dedications",
      slug: "sunset-melodies",
      tagline: "Smooth evening afro-rhythms, acoustic jams, and heart-to-heart dedications",
      description: "Wind down from lectures with relaxing acoustics, soulful ballads, and student love dedications across halls and hostels.",
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
      update: {},
      create: prog,
    });
  }

  // 6. Delete old schedules and create full 7-day schedule
  await prisma.schedule.deleteMany({});
  const allDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

  for (const day of allDays) {
    const isWeekend = day === "SATURDAY" || day === "SUNDAY";

    // 06:00 - 10:00
    await prisma.schedule.create({
      data: {
        programmeId: programmes["kyambogo-morning-rise"].id,
        dayOfWeek: day,
        startTime: "06:00",
        endTime: "10:00",
        isLive: true,
      },
    });

    // 10:00 - 13:00
    await prisma.schedule.create({
      data: {
        programmeId: programmes["campus-pulse-107"].id,
        dayOfWeek: day,
        startTime: "10:00",
        endTime: "13:00",
        isLive: true,
      },
    });

    // 13:00 - 16:00
    await prisma.schedule.create({
      data: {
        programmeId: programmes["the-tech-nexus"].id,
        dayOfWeek: day,
        startTime: "13:00",
        endTime: "16:00",
        isLive: true,
      },
    });

    // 16:00 - 19:00
    await prisma.schedule.create({
      data: {
        programmeId: programmes["varsity-sports-panorama"].id,
        dayOfWeek: day,
        startTime: "16:00",
        endTime: "19:00",
        isLive: true,
      },
    });

    // 19:00 - 22:00
    await prisma.schedule.create({
      data: {
        programmeId: programmes["sunset-melodies"].id,
        dayOfWeek: day,
        startTime: "19:00",
        endTime: "22:00",
        isLive: true,
      },
    });

    // 22:00 - 02:00
    await prisma.schedule.create({
      data: {
        programmeId: programmes["night-owl-study-groove"].id,
        dayOfWeek: day,
        startTime: "22:00",
        endTime: "02:00",
        isLive: true,
      },
    });
  }

  // 7. Podcasts
  const podcastCat = await prisma.podcastCategory.upsert({
    where: { slug: "campus-debates" },
    update: {},
    create: { name: "Campus Debates & Guild Affairs", slug: "campus-debates" },
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
      title: "Episode 1: The Guild Elections Special Debate",
      slug: "episode-1-guild-elections-special",
      description: "A comprehensive debate with the presidential aspirants on student welfare, tuition policies, and campus Wi-Fi infrastructure.",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      duration: 1840,
      coverImage: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80",
      categoryId: podcastCat.id,
      presenterId: presenters["brian-kigozi"].id,
      isPublished: true,
    },
    {
      title: "Episode 2: Engineering Innovation at Kyambogo",
      slug: "episode-2-engineering-innovation",
      description: "How student software and civil engineers are building sustainable solutions for municipal traffic and renewable solar systems in Uganda.",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      duration: 2150,
      coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
      categoryId: podcastCat2.id,
      presenterId: presenters["joy-akello"].id,
      isPublished: true,
    },
    {
      title: "Episode 3: Road to the University Football League Trophy",
      slug: "episode-3-university-football-league",
      description: "Analyzing the Kyambogo Warriors' qualification campaign, tactical setups against Makerere and UCU, and key player form.",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      duration: 1620,
      coverImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80",
      categoryId: podcastCat3.id,
      presenterId: presenters["david-mukasa"].id,
      isPublished: true,
    },
    {
      title: "Episode 4: Navigating Mental Health & Academic Pressure",
      slug: "episode-4-mental-health-academic-pressure",
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

  // 8. News Articles
  const newsCat = await prisma.articleCategory.upsert({
    where: { slug: "campus-news" },
    update: {},
    create: { name: "Campus News", slug: "campus-news" },
  });

  const newsCat2 = await prisma.articleCategory.upsert({
    where: { slug: "sports-news" },
    update: {},
    create: { name: "Sports News", slug: "sports-news" },
  });

  const newsCat3 = await prisma.articleCategory.upsert({
    where: { slug: "innovation-news" },
    update: {},
    create: { name: "Innovation & Technology", slug: "innovation-news" },
  });

  const articlesData = [
    {
      title: "Kyambogo University Upgrades Campus High-Speed Wi-Fi Network",
      slug: "kyambogo-university-upgrades-campus-wi-fi",
      excerpt: "The Directorate of ICT has deployed new fiber optic access points across North Hall, Banda hostels, and main library complexes.",
      content: `The Directorate of ICT at Kyambogo University has officially announced the completion of the Phase 1 Campus Network Modernization Project. 

Over 85 new enterprise-grade wireless access points have been deployed across student hostels, the East End lecture rooms, and the university main library. The modernization aims to guarantee seamless access to the Academic Information Management System (AIMS), e-learning portals, and live university radio broadcasting.

"Our goal is to ensure every student, whether in the engineering laboratories or their halls of residence, has reliable, uninterrupted high-speed internet to support their academic pursuits and digital learning," said the Director of ICT during the commissioning ceremony.

The expansion also features dedicated bandwidth pools to support digital radio streaming, allowing students to tune in to Kyambogo Radio 107.4 FM across campus without consuming personal mobile data bundles.`,
      coverImage: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80",
      categoryId: newsCat.id,
      authorId: adminUser.id,
      isFeatured: true,
      isPublished: true,
    },
    {
      title: "Warriors Triumph in Thrilling Derby Clash Against UCU",
      slug: "warriors-triumph-in-thrilling-derby-clash",
      excerpt: "A sensational 88th-minute header by forward Brian Opio secured a vital 2-1 victory in front of a capacity crowd at the East End pitch.",
      content: `In one of the most fiercely contested University Football League fixtures of the season, the Kyambogo Warriors edged out Uganda Christian University (UCU) with a dramatic 2-1 win at the university main grounds yesterday evening.

Backed by thousands of vocal student supporters and live pitchside commentary from the Kyambogo Radio 107.4 FM sports desk, the Warriors demonstrated immense discipline and offensive flair.

The winning goal arrived in the 88th minute when winger Ivan Kigozi floated an inch-perfect cross from the left flank, allowing striker Brian Opio to power a decisive header past the visiting goalkeeper.

With this crucial triumph, Kyambogo advances to the top of Group B and moves one step closer to the national knockout stages. Coach Ronald commended the boys' resilience and thanked the university radio commentary team for keeping alumni and fans across the country connected.`,
      coverImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80",
      categoryId: newsCat2.id,
      authorId: adminUser.id,
      isFeatured: false,
      isPublished: true,
    },
    {
      title: "Student Startup Showcase Unveils AI Healthcare Solution at Tech Hub",
      slug: "student-startup-showcase-unveils-ai-healthcare",
      excerpt: "Engineering and computer science scholars demonstrate an offline smartphone diagnostics tool for rural health clinics in Uganda.",
      content: `Students at the Kyambogo University Innovation Hub have earned widespread praise following the demonstration of 'AfyaScan', an AI-assisted diagnostic assistant designed to assist community health workers.

Built over 6 months by a multidisciplinary team of three computer science undergraduates and two biomedical engineering students, the platform operates without an active internet connection, using lightweight on-device neural models to interpret basic ultrasound and vital metric readings.

Speaking on Kyambogo Radio's weekly 'Tech Nexus' program, lead developer Joy Akello highlighted the role of the university incubation environment in transforming theoretical classroom knowledge into tangible community impact.`,
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

  // 9. Campus Announcements
  await prisma.announcement.deleteMany({});
  await prisma.announcement.createMany({
    data: [
      {
        title: "End of Semester Examination Timetable Released",
        content: "The Academic Registrar's department has published the draft examination timetable on the official university portal. Students are advised to verify their course units.",
        priority: "HIGH",
        isActive: true,
      },
      {
        title: "Kyambogo Radio Presenter Auditions Open",
        content: "Interested in joining the on-air broadcast team? Auditions for news anchors, sports analysts, and talk show hosts will be held this Friday at Radio House.",
        priority: "NORMAL",
        isActive: true,
      },
      {
        title: "Inter-Hall Cultural Festival This Saturday",
        content: "Experience the vibrant cultural diversity of Kyambogo University at the Freedom Square starting 10:00 AM. Live broadcasts on 107.4 FM all day.",
        priority: "NORMAL",
        isActive: true,
      },
    ],
  });

  console.log("🎉 Database enriched with realistic Kyambogo University data successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
