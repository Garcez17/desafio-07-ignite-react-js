import { Button, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';

import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

interface Card {
  id: string;
  title: string;
  description: string;
  url: string;
  ts: number;
}

interface FetchImagesResponse {
  data: Card[];
  after: string | null;
}

export default function Home(): JSX.Element {
  const fetchImages = async ({
    pageParam = null,
  }): Promise<FetchImagesResponse> => {
    if (pageParam) {
      const { data } = await api.get('/api/images', {
        params: {
          after: pageParam,
        },
      });

      return data;
    }

    const { data } = await api.get('/api/images');

    return data;
  };

  const { data, status, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery('images', fetchImages, {
      getNextPageParam: lastPage => lastPage.after ?? null,
    });

  const formattedData = useMemo(() => {
    let images = [];

    data?.pages.forEach(page => {
      images = [...images, page.data].flat();
    });

    return images;
  }, [data]);

  switch (status) {
    case 'idle':
      return <Loading />;

    case 'loading':
      return <Loading />;

    case 'error':
      return <Error />;

    case 'success':
      return (
        <>
          <Header />

          <Box maxW={1120} px={20} mx="auto" my={20}>
            <CardList cards={formattedData} />
            {hasNextPage && (
              <Button
                role="button"
                size="md"
                mt="1rem"
                isLoading={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                Carregar mais
              </Button>
            )}
          </Box>
        </>
      );

    default:
      return <Error />;
  }
}
