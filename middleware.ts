import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/", // redirect here if user is not authenticated
  },
})

// Protect /dashboard and all subpaths
export const config = {
  matcher: ["/dashboard/:path*","/products/:path*"],
}
