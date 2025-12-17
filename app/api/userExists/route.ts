import { connectMongoDB } from "@/lib/mongodb";
import Vendor_User from "@/models/vendor_user";
import { NextResponse } from "next/server";
import { use } from "react";

export async function POST(req:Request) {
    try {
        await connectMongoDB();
        const {email} = await req.json();
        const user =await Vendor_User.findOne({email}).select("_id")
        console.log("User : ",user)
        return NextResponse.json({user});
    } catch (error) {
        console.log(error)
    }
}