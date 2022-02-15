import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import ptBR from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const { results, next_page } = postsPagination;
  const [posts, setPosts] = useState<Post[]>(results);
  const [nextPage, setNextPage] = useState(next_page);

  async function handleLoadMorePosts(): Promise<void> {
    try {
      const response = await fetch(nextPage);
      const parsedResponse = await response.json();

      const { results: r, next_page: n } = parsedResponse;
      const updatedPosts = [...posts, ...r];

      setPosts(updatedPosts);
      setNextPage(n);

    } catch (err) {
      console.log(err);
    }
  }
  
  return (
    <main className={commonStyles.container}>
        {posts.map(post => (
          <div key={post?.uid}>
            <a>
              <h2>{post.data.title}</h2>
              <p>{post.data.subtitle}</p>
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
              </div>
            </a>
          </div>
        ))}
    </main>
  );
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse: any = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    pageSize: 20
  });

  return {
    props: {
      postsPagination: {
        results: postsResponse.results,
        next_page: postsResponse.next_page
      }
    }
  }
};
