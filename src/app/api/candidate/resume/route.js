import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { LoadResume } from "@/lib/resume_parser";
import Candidate from "@/models/candidateModel";
import { auth } from "@clerk/nextjs/server";
import { connect } from "@/lib/db";
import { deleteResume, uploadResume } from "@/utils/claudinary";

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(req) {
    connect();
    const { userId } = await auth();
    let resumePath;
    let resumeName;
    try {
        const formData = await req.formData();

        const resume = formData.get("resume");

        console.log(resume.name);
        const bytes = await resume.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = path.join(process.cwd(), "public/tmp");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        resumeName = `${Date.now()}.${resume.type}`;
        resumePath = path.join(uploadDir, `${resumeName}`);

        fs.writeFileSync(resumePath, buffer);
    } catch (err) {
        console.log(err);
        return NextResponse.json({
            success: false,
            message: "File Upload Unsuccessful",
        }, { status: 500 });
    }

    const result = uploadResume(resumePath);

    let parsed;
    try {
        const resume_parser = await LoadResume(resumePath);
        parsed = await resume_parser.extractJson();
    } catch (err) {
        fs.rmSync(resumePath);
        return NextResponse.json(
            { success: false, message: "Failed Parsing Resume" },
            { status: 500 },
        );
    }

    const existing = await Candidate.findOne({ clerkId: userId });
    if (!existing) {
        try {
            const candidate = await Candidate.create({
                resume: {
                    ...parsed.resume,
                    resumeUrl: (await result).secure_url,
                },
                clerkId: userId,
                dateOfBirth: parsed.dateOfBirth || null,
                appliedJobs: parsed.appliedJobs || [],
                totalExperienceDuration: parsed.totalExperienceDuration || 0,
            });
            fs.rmSync(resumePath);
        } catch (err) {
            console.log(err);
            fs.rmSync(resumePath);
            return NextResponse.json(
                { success: false, message: "File Upload Unsuccessful" },
                { status: 500 },
            );
        }
    } else {
        try {
            deleteResume(existing.resume.resumeUrl);
        } finally {
            fs.rmSync(resumePath);
            existing.resume = { ...parsed.resume, resumeUrl: (await result).secure_url };
            await existing.save();
            return NextResponse.json({ success: true, message: "Resume Updated Successfully" });
        }
    }
    return NextResponse.json({ success: true, message: "Resume Uploaded Successfully" });
}
