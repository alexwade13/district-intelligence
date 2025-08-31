export default function handler(req, res) {
  // Return a simple status indicating we're using local data
  res.status(200).json({
    status: 'ok',
    data_source: 'local',
    last_updated: new Date().toISOString(),
    message: 'Using local election data files'
  })
}
