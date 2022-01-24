import { Db, MongoClient } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { Session } from 'next-auth'

export interface PostFrontMatter {
  title: string
  summary: string
  publishedOn: string
}

export interface Post {
  source: string
  frontMatter: PostFrontMatter
}

export interface UserSession {
  id?: string
  image?: string
  email?: string
  name?: string
}
export interface SessionType {
  user: UserSession
}
export interface Request extends NextApiRequest {
  db: Db
  dbClient: MongoClient
  user: { email: string; id: string }
}

export interface Folder {
  _id: string,
  createdAt: string,
  createdBy: string,
  name: string
}

export interface Doc {
  _id: string,
  createdBy: string,
  content: string,
  folder: string,
  createdAt: string
}

export interface AppProps {
  session: Session,
  folders?: Folder[],
  activeFolder?: Folder,
  activeDocs?: Doc[],
  activeDoc?:Doc
}