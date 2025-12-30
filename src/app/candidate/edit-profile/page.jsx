"use client";

import EditCandidateProfileForm from "./EditCandidateProfileForm";

import { useHeader } from "@/store/user.store";
import { useEffect } from "react";


const dummyCandidate = {
  _id: "65b9f1a2c9d1a12f9c001234",
  clerkId: "user_2abcdEFGH12345",

  totalExperienceDuration: 3,

  dateOfBirth: "1999-06-15T00:00:00.000Z",

  address: {
    line: "Flat 203, Shree Residency",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    pinCode: "411038",
  },

  resume: {
    resumeUrl:
      "https://res.cloudinary.com/demo/raw/upload/sample_resume.pdf",

    skills: [
      "JavaScript",
      "React",
      "Next.js",
      "Node.js",
      "MongoDB",
      "Tailwind CSS",
    ],

    experience: [
      {
        jobTitle: "Frontend Developer",
        jobDesc:
          "Built scalable UI components using React and Tailwind. Worked closely with backend team to integrate REST APIs.",
      },
      {
        jobTitle: "Junior Full Stack Developer",
        jobDesc:
          "Developed full-stack features using Next.js, Express, and MongoDB. Implemented authentication using Clerk.",
      },
    ],

    education: [
      {
        course: "B.Tech Computer Engineering",
        eduType: "Full Time",
        instituteName: "Savitribai Phule Pune University",
        yearOfComp: 2022,
      },
      {
        course: "Higher Secondary (12th)",
        eduType: "Science",
        instituteName: "Fergusson College",
        yearOfComp: 2018,
      },
    ],

    certifications: [
      {
        name: "Full Stack Web Development",
        provider: "Udemy",
        yearOfComp: 2023,
      },
      {
        name: "React Advanced",
        provider: "Coursera",
        yearOfComp: 2022,
      },
    ],

    socials: [
      {
        name: "GitHub",
        url: "https://github.com/devmulkalwar",
      },
      {
        name: "LinkedIn",
        url: "https://linkedin.com/in/devmulkalwar",
      },
      {
        name: "Portfolio",
        url: "https://devmulkalwar.vercel.app",
      },
    ],
  },

  createdAt: "2024-10-12T10:20:30.000Z",
  updatedAt: "2024-12-01T15:45:10.000Z",
};

export default function Page() {
  const setTitle = useHeader((s) => s.setTitle);

  useEffect(() => {
    setTitle("Edit Candidate Profile");
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <EditCandidateProfileForm
        initialData={dummyCandidate}
        onSubmit={(data) => {
          console.log("Updated Candidate:", data);
        }}
      />
    </div>
  );
}
