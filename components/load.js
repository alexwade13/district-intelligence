import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

const load = () => {
  const { data, error } = useSWR('/results/sample.json', fetcher, {
    refreshInterval: 5000,
  })

  return { data, error }
}

export default load
