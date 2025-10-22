import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'assembly_tract_data.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(fileContents)
    
    res.status(200).json(data)
  } catch (error) {
    console.error('Error loading assembly tract data:', error)
    res.status(500).json({ error: 'Failed to load assembly tract data' })
  }
}

