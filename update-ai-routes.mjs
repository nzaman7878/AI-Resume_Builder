import fs from 'fs';

const files = [
  'src/app/api/ai/generate-summary/route.ts',
  'src/app/api/ai/generate-skills/route.ts',
  'src/app/api/ai/generate-project-description/route.ts',
  'src/app/api/ai/generate-experience-description/route.ts',
  'src/app/api/ai/ats-score/route.ts',
  'src/app/api/ai/improve-content/route.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('aiRateLimit')) {
    // Add import
    content = content.replace(
      'import { NextRequest, NextResponse } from "next/server";',
      'import { NextRequest, NextResponse } from "next/server";\nimport { aiRateLimit, getIpAddress } from "@/lib/ratelimit";'
    );
    
    // Add rate limit logic inside POST try block
    const replacement = `try {
    if (aiRateLimit) {
      const ip = getIpAddress(req as any);
      const { success } = await aiRateLimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { success: false, message: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }
    }`;
    
    content = content.replace('try {', replacement);
    
    fs.writeFileSync(file, content);
  }
}
console.log("Done");
