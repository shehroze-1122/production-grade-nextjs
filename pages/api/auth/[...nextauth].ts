import { NextApiRequest, NextApiResponse } from 'next'
import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'

import { connectToDB, folder, doc } from '../../../db'

export default (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, {
    session: {
        // use JWTs instead
      jwt: true,
    },
    jwt: {
      secret: process.env.JWT_SECRET,
    },
    providers: [
      Providers.GitHub({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      }),
      // ...add more providers here
    ],

    database: process.env.DATABASE_URL,
    pages: {
      signIn: '/signin',
    },
    
    callbacks: {
      async session(session: any, user) {
        session.user.id = user.id as string;
        return session
      },

      async jwt(tokenPayload, user, account, profile, isNewUser) {
        const { db } = await connectToDB()

        if (isNewUser) {
          const personalFolder = await folder.createFolder(db, { createdBy: `${user.id}`, name: 'Getting Started' })
          await doc.createDoc(db, {
            name: 'Start Here',
            folder: personalFolder._id,
            createdBy: `${user.id}`,
            content: {
              time: 1556098174501,
              blocks: [
                {
                  type: 'header',
                  data: {
                    text: 'Some default content',
                    level: 2,
                  },
                },
              ],
              version: '2.12.4',
            },
          })
        }

        if (tokenPayload && user) {
          return { ...tokenPayload, id: `${user.id}` }
        }

        return tokenPayload
      },
    }
  })
