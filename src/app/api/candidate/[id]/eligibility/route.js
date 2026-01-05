import { NextResponse } from "next/server";

// TODO: Implement eligibility test
export async function GET () {
  let eligibility = { score: 0, isEligible: false, };
  return NextResponse.json({...eligibility}, { status: 200 });
}
