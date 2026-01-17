import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { checkAuth } from "@/utils/checkAuth";
import skillsModel from "@/models/skillsModel";

// Escape regex special characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req) {
  const authResult = await checkAuth({
    allowedRoles: ["recruiter", "candidate"],
  });

  if (!authResult.authenticated) {
    return NextResponse.json(
      { message: authResult.error },
      {
        status: authResult.error === "Forbidden" ? 403 : 401,
      },
    );
  }

  try {
    await connect();

    const { searchParams } = new URL(req.url);
    const rawQuery = (searchParams.get("q") || "").trim();
    if (!rawQuery) {
      // return first 20 skills if no query
      const allSkills = await skillsModel
        .find()
        .limit(20)
        .select("key label -_id")
        .lean();
      return NextResponse.json(allSkills);
    }

    // Escape regex special chars for MongoDB search
    const queryRegex = new RegExp(escapeRegex(rawQuery), "i");

    // Find skills that match key, label, or aliases (case-insensitive)
    const matchedSkills = await skillsModel
      .find({
        $or: [
          { key: queryRegex },
          { label: queryRegex },
          { aliases: queryRegex },
        ],
      })
      .select("key label aliases -_id")
      .lean();

    // Compute relevance score
    const scoredSkills = matchedSkills.map((skill) => {
      const key = skill.key.toLowerCase();
      const label = skill.label.toLowerCase();
      const aliases = (skill.aliases || []).map((a) => a.toLowerCase());
      const q = rawQuery.toLowerCase();

      let score = 0;

      // Exact match gets highest score
      if (key === q) score += 100;
      else if (key.startsWith(q)) score += 50;
      else if (key.includes(q)) score += 20;

      if (label === q) score += 100;
      else if (label.startsWith(q)) score += 60;
      else if (label.includes(q)) score += 30;

      aliases.forEach((alias) => {
        if (alias === q) score += 90;
        else if (alias.startsWith(q)) score += 50;
        else if (alias.includes(q)) score += 20;
      });

      return { ...skill, score };
    });

    // Sort descending by relevance score
    scoredSkills.sort((a, b) => b.score - a.score);

    // Return top 20 matches, remove score from response
    const topSkills = scoredSkills.slice(0, 20).map(({ score, ...rest }) => rest);

    return NextResponse.json(topSkills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 },
    );
  }
}
