import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  try {
    // Check if we have a council data file
    const filePath = path.join(process.cwd(), 'Member+of+the+City+Council+38th+Council+District+(Democratic).json')
    
    if (fs.existsSync(filePath)) {
      const jsonData = fs.readFileSync(filePath, 'utf8')
      const data = JSON.parse(jsonData)
      res.status(200).json(data)
    } else {
      // Return empty council data structure if file doesn't exist
      res.status(200).json({
        all: { all: { total: 0, candidates: {}, reporting: 0 } },
        assembly_districts: {},
        election_districts: {}
      })
    }
  } catch (error) {
    console.error('Error loading council data:', error)
    res.status(500).json({ error: 'Failed to load council data' })
  }
}
