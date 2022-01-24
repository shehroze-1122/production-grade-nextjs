import React, { FC } from 'react'
import hydrate from 'next-mdx-remote/hydrate'
import { majorScale, Pane, Heading, Spinner } from 'evergreen-ui'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Post } from '../../types'
import Container from '../../components/container'
import HomeNav from '../../components/homeNav'
import path from 'path'
import fs from 'fs'
import matter from 'gray-matter'
import renderToString from 'next-mdx-remote/render-to-string'
import { posts } from '../../content'

const BlogPost: FC<Post> = ({ source, frontMatter }) => {
  const router = useRouter()
  if (router.isFallback) {
    return (
      <Pane width="100%" height="100%">
        <Spinner size={48} />
      </Pane>
    )
  }
  const content = hydrate(source)

  return (
    <Pane>
      <Head>
        <title>{`Known Blog | ${frontMatter.title}`}</title>
        <meta name="description" content={frontMatter.summary} />
      </Head>
      <header>
        <HomeNav />
      </header>
      <main>
        <Container>
          <Heading fontSize="clamp(2rem, 8vw, 6rem)" lineHeight="clamp(2rem, 8vw, 6rem)" marginY={majorScale(3)}>
            {frontMatter.title}
          </Heading>
          <Pane>{content}</Pane>
        </Container>
      </main>
    </Pane>
  )
}

BlogPost.defaultProps = {
  source: ' ',
  frontMatter: { title: 'default title', summary: 'summary', publishedOn: '' },
}

/**
 * Need to get the paths here
 * then the the correct post for the matching path
 * Posts can come from the fs or our CMS
 */
export default BlogPost

export function getStaticPaths(){

  const postDirPath = path.join(process.cwd(), 'posts')
  const filenames = fs.readdirSync(postDirPath)

  const slugs = filenames.map((filename)=>{
    const filePath = path.join(postDirPath, filename)
    const post = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(post);
    return data.slug;
  })
  
  const paths = slugs.map((slug)=>({ params: { slug }}))
  return { paths, fallback: true};

}

export async function getStaticProps({params, preview}){
  
  let post;

  try {
    const postPath = path.join(process.cwd(), 'posts', `${params.slug}.mdx`);
    post = fs.readFileSync(postPath, 'utf-8');
    
  } catch (error) {
    const cmsPosts = preview? posts.draft: posts.published;
    post = cmsPosts.find((post)=>{
      const { data } = matter(post);
      return data.slug===params.slug;
    })
  }

  
  if (!post) {
    throw new Error('no post found with this slug')
  }

  const { data, content } = matter(post);

  const source = await renderToString(content, { scope: data })
  return {
    props: {
      source,
      frontMatter: data
    }
  }
}