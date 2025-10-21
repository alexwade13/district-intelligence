import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'assembly_demographics.json')
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        error: 'Assembly demographics data not found',
        message: 'Run: python3 scripts/map_tracts_to_assembly.py'
      })
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    
    res.status(200).json(data)
  } catch (error) {
    console.error('Error reading assembly demographics:', error)
    res.status(500).json({ error: 'Failed to load assembly demographics' })
  }
}

