import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { checkAuth } from "@/utils/checkAuth";
import skillsModel from "@/models/skillsModel";

// Escape regex special characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeKey(value = "") {
  return value
    .trim()
    .toLowerCase()
    .replace(/\+/g, "p")
    .replace(/#/g, "sharp")
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
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
    const parsedLimit = Number.parseInt(searchParams.get("limit") || "", 10);
    const limit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(parsedLimit, 1), 20)
      : rawQuery
        ? 5
        : 20;

    if (!rawQuery) {
      // return first skills if no query
      const allSkills = await skillsModel
        .find()
        .limit(limit)
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

    // Return top matches, remove score from response
    const topSkills = scoredSkills
      .slice(0, limit)
      .map(({ score, ...rest }) => rest);

    return NextResponse.json(topSkills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
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

    const body = await req.json();
    const { label, aliases = [] } = body;

    if (!label) {
      return NextResponse.json(
        { error: "Skill label is required" },
        { status: 400 },
      );
    }

    const key = normalizeKey(label);

    // Check if skill already exists by key or aliases
    const existingSkill = await skillsModel.findOne({
      $or: [{ key }, { aliases: { $in: [key] } }],
    });

    if (existingSkill) {
      return NextResponse.json(
        {
          message: "Skill already exists",
          skill: {
            key: existingSkill.key,
            label: existingSkill.label,
            aliases: existingSkill.aliases,
          },
        },
        { status: 200 },
      );
    }

    // Normalize aliases
    const normalizedAliases = [
      ...new Set(
        aliases
          .filter(Boolean)
          .map((a) => normalizeKey(a))
          .filter((a) => a !== key),
      ),
    ];

    const newSkill = await skillsModel.create({
      key,
      label,
      aliases: normalizedAliases,
    });

    return NextResponse.json(
      {
        message: "Skill created successfully",
        skill: {
          key: newSkill.key,
          label: newSkill.label,
          aliases: newSkill.aliases,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating skill:", error);
    return NextResponse.json(
      { error: "Failed to create skill" },
      { status: 500 },
    );
  }
}
