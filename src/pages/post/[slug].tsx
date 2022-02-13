import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  return (
    <>
      <h1> oi </h1>
    </>
  )
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['post.title', 'post.subtitle', 'post.author', 'post.banner', 'post.content'],
  });

  return {
    paths: posts,
    fallback: 'blocking'
  }
};

export const getStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response: any = await prismic.getByUID('posts', String(slug), {});

  const post: Post = {
    first_publication_date: format(new Date(response.last_publication_date), 'dd MMM yyyy', { locale: ptBR }),
    data: {
      author: response.data.author,
      banner: response.data.banner,
      content: [{
        heading: RichText.asHtml(response.data.content.heading),
        body: [{
          text: RichText.asHtml(response.data.content.text),
        }]
      }],
      title: RichText.asText(response.data.title)
    }
  }

  return {
    props: {
      post
    },
    revalidate: 60 * 30
  }
};