import { Redis } from '@upstash/redis';
import { Duration, Ratelimit } from '@upstash/ratelimit';
import { NextRequest, NextResponse } from "next/server";
import config from '@/config';

let redis: Redis;
if (config.upstashRedis) {
    redis = new Redis({
        url: config.upstashRedis.restUrl,
        token: config.upstashRedis.restToken,
    });
}
export async function likeRateLimit(request: NextRequest) {
    // bypass for local development
    if (!config.upstashRedis) {
        return null;
    }
    const ip = request.ip ?? request.headers.get('X-Forwarded-For') ?? 'unknown';

    const perMinuteLimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        prefix: 'like_per_minute',
    });

    const perHourLimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(100, '1 h'),
        prefix: 'like_per_hour',
    });

    const perDayLimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(1000, '1 d'),
        prefix: 'like_per_day',
    });

    const limits = [
        await perMinuteLimit.limit(ip),
        await perHourLimit.limit(ip),
        await perDayLimit.limit(ip),
    ];

    for (const { success, limit, remaining, reset } of limits) {
        if (!success) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': limit.toString(),
                        'X-RateLimit-Remaining': remaining.toString(),
                        'X-RateLimit-Reset': reset.toString(),
                    },
                }
            );
        }
    }

    return null; // No rate limit error
}

export async function testimonialSubmitRateLimit(
    request: NextRequest,
    limit: number,
    duration: Duration
) {
    // bypass for local development
    if (!config.upstashRedis) {
        return null;
    }
    const ip = request.ip ?? request.headers.get('X-Forwarded-For') ?? 'unknown';
    const rateLimiter = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(limit, duration),
        analytics: true,
    });

    const { success, limit: rateLimit, remaining, reset } = await rateLimiter.limit(ip);

    if (!success) {
        return NextResponse.json(
            { error: `Rate limit exceeded. Please try again later.` },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': rateLimit.toString(),
                    'X-RateLimit-Remaining': remaining.toString(),
                    'X-RateLimit-Reset': reset.toString(),
                },
            }
        );
    }

    return null;
}

export async function iframeFetchRateLimit(request: NextRequest) {
    // bypass for local development
    if (!config.upstashRedis) {
        return null;
    }
    const domain = request.headers.get('Origin') || 'unknown';

    const perMinuteLimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(30, '1 m'),
        prefix: 'iframe_fetch_per_minute',
    });

    const perHourLimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(300, '1 h'),
        prefix: 'iframe_fetch_per_hour',
    });

    const perDayLimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(3000, '1 d'), // 3000 requests per day
        prefix: 'iframe_fetch_per_day',
    });

    const limits = [
        await perMinuteLimit.limit(domain),
        await perHourLimit.limit(domain),
        await perDayLimit.limit(domain),
    ];

    for (const { success, limit, remaining, reset } of limits) {
        if (!success) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': limit.toString(),
                        'X-RateLimit-Remaining': remaining.toString(),
                        'X-RateLimit-Reset': reset.toString(),
                    },
                }
            );
        }
    }

    return null;
}