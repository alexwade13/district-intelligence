import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

const load = () => {
  const { data: data1, error: error1 } = useSWR(
    'https://dsa-ewg-live-election-results.s3.us-east-1.amazonaws.com/results/Mayoral+(FAKE+DATA).json',
    fetcher,
    {
      refreshInterval: 5000,
    },
  )

  const { data: data2, error: error2 } = useSWR(
    '/results/City Council 38 (FAKE DATA).json',
    fetcher,
    {
      refreshInterval: 5000,
    },
  )

  return {
    data: { mayoral: data1, council: data2 },
    error: { mayoral: error1, council: error2 },
  }
}

export default load
