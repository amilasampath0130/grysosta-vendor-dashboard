import { connectMongoDB } from "@/lib/mongodb";
import Vendor_User from "@/models/vendor_user";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
export async function POST(req:Request){
    try {
        const {name,email,password} = await req.json();
        const hashedPassword = await bcrypt.hash(password,10)
        await connectMongoDB();
        await Vendor_User.create({name,email,password:hashedPassword})
        return NextResponse.json({message:"User registered"} ,{status:201})

    } catch (error) {
        return NextResponse.json({message:"Error occure when you registered"},{status:  500})
    }

}