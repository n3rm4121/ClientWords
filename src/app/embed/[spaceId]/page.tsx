// EmbedPage.tsx
import React from 'react';
import { ITestimonial } from '@/lib/interface';
import TestimonialCard from '@/app/dashboard/spaces/[name]/[id]/components/TestimonialCard';
import TestimonialCarousel from '@/components/iframeLayout/carousel';
import Image from 'next/image';
import Link from 'next/link';
import { getUserSubscriptionTier } from '@/app/dashboard/action';
import Space from '@/models/space.model';
import dbConnect from '@/lib/dbConnect';
import Testimonial from '@/models/testimonials.model';
import LoveGallery from '@/models/loveGallery.model';
import config from '@/config';
import { Redis } from '@upstash/redis';

interface EmbedPageProps {
  params: {
    spaceId: string;
  };
  searchParams?: {
    [key: string]: string | undefined;
  };
}

const EmbedPage = async ({ params, searchParams }: EmbedPageProps) => {
  const { spaceId } = params;
  const theme = searchParams?.theme || 'light';
  const layout = searchParams?.layout || 'grid';
  const limit = parseInt(searchParams?.limit || '10', 10);

  await dbConnect();

  // Initialize Redis if configured
  const redis = config.upstashRedis
    ? new Redis({
      url: config.upstashRedis.restUrl,
      token: config.upstashRedis.restToken,
    })
    : null;

  const cacheKey = `testimonials_${spaceId}_${limit}`;
  let testimonials: ITestimonial[] = [];

  try {
    // Attempt to fetch from Redis cache
    //TODO: implementing caching
    // if (redis) {
    //   const cachedTestimonials = await redis.get(cacheKey);
    //   if (cachedTestimonials) {
    //     testimonials = JSON.parse(cachedTestimonials as string)
    //   }
    // } 

    // If no cache, fetch from MongoDB
    if (testimonials.length === 0) {
      const spaceOwner = await Space.findById(spaceId).select('owner').exec();
      if (!spaceOwner) throw new Error('Space not found');

      const loveGallery = await LoveGallery.findOne({ spaceId })
        .sort({ createdAt: -1 })
        .limit(limit);

      testimonials = loveGallery
        ? await Testimonial.find({ _id: { $in: loveGallery.testimonials } })
          .select('userName userAvatar userIntro message')
          .exec()
        : [];

      // Cache the testimonials in Redis for 5 minutes
      // if (redis) {
      //   await redis.set(cacheKey, JSON.stringify({ testimonials }), { ex: 300 });
      // }
    }

    const subscriptionTier = await getUserSubscriptionTier(
      (await Space.findById(spaceId).select('owner').exec())?.owner as string
    );

    return (
      <div className="w-full min-h-screen bg-white px-8">
        {layout === 'carousel' ? (
          <TestimonialCarousel testimonials={testimonials} theme={theme} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial._id}
                location="embed"
                testimonial={testimonial}
                theme={theme}
              />
            ))}
          </div>
        )}
        {subscriptionTier === 'Free' && (
          <div className="w-full gap-4 text-black font-bold text-2xl flex justify-center py-4">
            <Link
              className="bg-stone-400 px-2 rounded-md"
              href="https://clientwords.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src="/newbrand1.png" width={200} height={200} alt="ClientWords" />
            </Link>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return (
      <div className="w-full h-full flex items-center justify-center bg-transparent text-center p-4">
        Failed to load testimonials
      </div>
    );
  }
};

export default EmbedPage;
