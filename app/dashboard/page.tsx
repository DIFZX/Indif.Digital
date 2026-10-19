import { redirect } from "next/navigation";

type DashboardPageProps = {
  searchParams: Promise<{ slug?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const query = await searchParams;
  const targetSlug = query.slug?.trim() || "java-vibes";
  redirect(`/${targetSlug}/dashboard`);
}

