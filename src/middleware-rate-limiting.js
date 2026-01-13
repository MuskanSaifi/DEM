// ✅ Rate Limiting & Bot Protection Middleware
// Copy this code to your existing middleware.js file

import { NextResponse } from "next/server";

// ✅ In-memory rate limiting store (simple, no Redis needed)
const rateLimitMap = new Map();
const BAD_BOT_USER_AGENTS = [
  'ahrefsbot',
  'semrushbot',
  'mj12bot',
  'dotbot',
  'megaindex',
  'blexbot',
  'petalbot',
  'applebot-image', // Sometimes abusive
  'yandexbot',
  'baiduspider',
];

// ✅ Good bots (allow these)
const GOOD_BOTS = [
  'googlebot',
  'bingbot',
  'slurp', // Yahoo
  'duckduckbot',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
];

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.resetTime > 60000) { // 1 minute
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

function getClientIdentifier(request) {
  // Try to get real IP from headers (Cloudflare, proxy, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  const userAgent = request.headers.get('user-agent') || '';
  
  // Combine IP + User-Agent for more accurate rate limiting
  return `${ip}-${userAgent.substring(0, 50)}`;
}

function checkRateLimit(identifier, limit = 100, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count };
}

function isBadBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  
  // Check if it's a good bot first (allow these)
  const isGoodBot = GOOD_BOTS.some(bot => ua.includes(bot));
  if (isGoodBot) return false;
  
  // Check if it's a known bad bot
  return BAD_BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  
  // ✅ Bot Detection - Block known bad bots
  if (isBadBot(userAgent)) {
    console.log(`🚫 Blocked bad bot: ${userAgent.substring(0, 50)}`);
    return new NextResponse('Access Denied', { status: 403 });
  }

  // ✅ Rate Limiting for API routes
  if (pathname.startsWith('/api/')) {
    const identifier = getClientIdentifier(request);
    
    // Stricter limits for API routes
    const apiLimit = 60; // 60 requests per minute
    const rateLimit = checkRateLimit(identifier, apiLimit, 60000);
    
    if (!rateLimit.allowed) {
      console.log(`⏱️ Rate limit exceeded for: ${identifier}`);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': apiLimit.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }
    
    // Add rate limit headers to response
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', apiLimit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    return response;
  }

  // ✅ Rate Limiting for pages (less strict)
  const identifier = getClientIdentifier(request);
  const pageLimit = 100; // 100 requests per minute
  const rateLimit = checkRateLimit(identifier, pageLimit, 60000);
  
  if (!rateLimit.allowed) {
    console.log(`⏱️ Rate limit exceeded for pages: ${identifier}`);
    return new NextResponse('Too many requests. Please try again later.', {
      status: 429,
      headers: {
        'Retry-After': '60',
      },
    });
  }

  return NextResponse.next();
}

// ✅ Apply middleware to all routes except static files
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};








