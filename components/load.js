import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

const load = () => {
  // Try to load from local files first, fallback to remote if needed
  const { data: data1, error: error1 } = useSWR(
    '/api/data/mayoral',
    fetcher,
    {
      refreshInterval: 30000, // Reduced refresh rate for local data
    },
  )

  const { data: data2, error: error2 } = useSWR(
    '/api/data/council',
    fetcher,
    {
      refreshInterval: 30000,
    },
  )

  const { data: data3, error: error3 } = useSWR(
    '/api/data/status',
    fetcher,
    {
      refreshInterval: 30000,
    },
  )

  const { data: data4, error: error4 } = useSWR(
    '/api/data/progressive-evolution',
    fetcher,
    {
      refreshInterval: 30000,
    },
  )

  const { data: data5, error: error5 } = useSWR(
    '/api/data/demographics',
    fetcher,
    {
      refreshInterval: 30000,
    },
  )

  const { data: data6, error: error6 } = useSWR(
    '/api/data/assembly-demographics',
    fetcher,
    {
      refreshInterval: 30000,
    },
  )

  return {
    data: {
      mayoral: data1,
      council: data2,
      status: data3,
      'progressive-evolution': data4,
      'demographics': data5?.data,
      'assembly-demographics': data6
    },
    error: {
      mayoral: error1,
      council: error2,
      status: error3,
      'progressive-evolution': error4,
      'demographics': error5,
      'assembly-demographics': error6
    },
  }
}

export default load
