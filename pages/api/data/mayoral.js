import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), 'Mayor+(Democratic).json')
    const jsonData = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(jsonData)
    
    res.status(200).json(data)
  } catch (error) {
    console.error('Error loading mayoral data:', error)
    res.status(500).json({ error: 'Failed to load mayoral data' })
  }
}
