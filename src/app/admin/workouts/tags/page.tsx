import { prisma } from '@/lib/prisma';
import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TagManagementClient from './tag-management-client';

export const dynamic = 'force-dynamic';

export default async function TagManagementPage() {
  const user = await requireAuth('ADMIN');
  
  if (!user) {
    redirect('/login/coach');
  }

  const lang = getLang();

  // Get all workouts to extract tags
  const workouts = await prisma.workout.findMany({
    select: {
      tags: true,
    },
  });

  // Extract unique tags
  const allTags = new Set<string>();
  workouts.forEach((w) => {
    (w.tags || []).forEach((tag: string) => {
      if (tag && tag !== '_archived') {
        allTags.add(tag);
      }
    });
  });

  // Get tag usage counts
  const tagUsage: { [key: string]: number } = {};
  workouts.forEach((w) => {
    (w.tags || []).forEach((tag: string) => {
      if (tag && tag !== '_archived') {
        tagUsage[tag] = (tagUsage[tag] || 0) + 1;
      }
    });
  });

  return (
    <TagManagementClient
      tags={Array.from(allTags).map((tag) => ({
        name: tag,
        usageCount: tagUsage[tag] || 0,
      }))}
      lang={lang}
    />
  );
}

