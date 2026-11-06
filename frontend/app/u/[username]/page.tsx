import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Home from "../../page";

const USERNAME_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const name = decodeURIComponent(username);
  if (!USERNAME_PATTERN.test(name)) return { title: "User not found – OpenSourceMate" };

  const title = `${name} on OpenSourceMate`;
  const description = `See the skills and matching open-source issues for @${name} on OpenSourceMate.`;
  return {
    title,
    description,
    openGraph: { title, description, siteName: "OpenSourceMate", type: "profile" },
    twitter: { card: "summary", title, description },
  };
}

export default async function SharedResult({ params }: Props) {
  const { username } = await params;
  if (!USERNAME_PATTERN.test(decodeURIComponent(username))) notFound();
  return <Home />;
}
