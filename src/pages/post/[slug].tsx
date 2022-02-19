import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { useRouter } from 'next/router';

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
  const { isFallback } = useRouter();
  
  return (
    <main className={styles.postContainer}>
      <img src={post.data.banner.url} alt={post.data.title} />

      {isFallback ? (
        <article>
          <h1>Carregando...</h1>
        </article>
      ) : (
      <article className={commonStyles.container}>
        <h1> {post.data.title} </h1>
        <div className={styles.info}>
          <time>
            <FiCalendar />
            {format(
              new Date(post.first_publication_date),
              'dd MMM yyyy',
              { locale: ptBR }
            )}
          </time>
          <span className={styles.author}>
            <FiUser />
            {post.data.author}
          </span>
          <time>
            <FiClock />
            4 min
          </time>
        </div>

        {post.data.content.map((content, index) => (
          <section key={index}>
            <h2>{content.heading}</h2>
            <div
              className={styles.postBody}
              dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body) }}
            />
          </section>
        ))}
      </article>
      )}
    </main>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['post.title', 'post.subtitle', 'post.author', 'post.banner', 'post.content'],
  });

  return {
    paths: posts.results.map(p => ({ params: { slug: p.uid } })),
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response: any = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post: response
    },
    revalidate: 60 * 30
  }
};