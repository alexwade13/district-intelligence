import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  const { ad_id } = req.query
  
  try {
    const filePath = path.join(process.cwd(), 'data', 'assembly_tract_data.json')
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        error: 'Assembly tract data not found',
        message: 'Run: python3 scripts/map_tracts_to_assembly.py'
      })
    }
    
    const allData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    
    if (!allData[ad_id]) {
      return res.status(404).json({ 
        error: `Assembly District ${ad_id} not found`,
        available_ads: Object.keys(allData).sort()
      })
    }
    
    res.status(200).json(allData[ad_id])
  } catch (error) {
    console.error('Error reading assembly tract data:', error)
    res.status(500).json({ error: 'Failed to load assembly tract data' })
  }
}

