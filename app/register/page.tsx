import RegisterForm from "@/components/RegisterForm"
import { getServerSession } from "next-auth"
// import { authOptions } from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

const Register = async() => {
  // const session = await getServerSession(authOptions)
  // if (session) {
  //   redirect("dashboard")
  // }
  return (
    <RegisterForm />
  )
}

export default Register