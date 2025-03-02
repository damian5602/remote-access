import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // In a real application, you would connect to your database
          // const client = await connectToDatabase()
          // const usersCollection = client.db().collection("users")
          // const user = await usersCollection.findOne({ email: credentials.email })

          // For demonstration purposes, we'll use hardcoded users
          const users = [
            {
              id: "1",
              name: "Admin User",
              email: "admin@example.com",
              password: "$2b$10$8OxDlUjXR9/wZdHvVUUNZOjWvUm34KAiANJ2kN8uYUJrOjgQaFE7K", // "password123"
              role: "admin",
            },
            {
              id: "2",
              name: "Test User",
              email: "user@example.com",
              password: "$2b$10$8OxDlUjXR9/wZdHvVUUNZOjWvUm34KAiANJ2kN8uYUJrOjgQaFE7K", // "password123"
              role: "user",
            },
          ]

          const user = users.find((u) => u.email === credentials.email)

          if (!user) {
            return null
          }

          // In a real application, you would compare the password with bcrypt
          // const isPasswordValid = await compare(credentials.password, user.password)

          // For demonstration, we'll assume the password is valid if it's "password123"
          const isPasswordValid = credentials.password === "password123"

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
})

export { handler as GET, handler as POST }

