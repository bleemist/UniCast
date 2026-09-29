import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://radio.kyu.ac.ug";

  const staticRoutes = [
    "",
    "/live",
    "/schedule",
    "/presenters",
    "/podcasts",
    "/requests",
    "/news",
    "/contact",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  return staticRoutes;
}
