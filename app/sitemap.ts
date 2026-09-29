import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://unicast.radio";

  const staticRoutes = [
    "",
    "/listen",
    "/live",
    "/schedule",
    "/programmes",
    "/podcasts",
    "/news",
    "/presenters",
    "/request",
    "/about",
    "/contact",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  return staticRoutes;
}
