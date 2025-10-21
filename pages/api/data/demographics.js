import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    const { district, demographic } = req.query;

    // Read the demographics data file (try both old and new formats)
    let demographicsPath = path.join(process.cwd(), 'data', 'district_demographics.json');
    let fallbackPath = path.join(process.cwd(), 'data', 'demographics.json');

    // Try the new spatially-mapped data first, fallback to old format
    if (!fs.existsSync(demographicsPath) && fs.existsSync(fallbackPath)) {
      demographicsPath = fallbackPath;
    }

    if (!fs.existsSync(demographicsPath)) {
      return res.status(404).json({
        error: 'Demographics data not found. Please run the spatial mapping script first.',
        hint: 'Run: python3 scripts/spatial_mapping.py'
      });
    }

    const demographicsData = JSON.parse(fs.readFileSync(demographicsPath, 'utf8'));

    // If no specific district requested, return all data
    if (!district) {
      return res.status(200).json({
        data: demographicsData,
        total_districts: Object.keys(demographicsData).length
      });
    }

    // If district requested but not found
    if (!demographicsData[district]) {
      return res.status(404).json({
        error: `Demographics data not found for district ${district}`
      });
    }

    const districtData = demographicsData[district];

    // If specific demographic requested, return just that
    if (demographic && demographic !== 'all') {
      const value = districtData[demographic];
      if (value === undefined) {
        return res.status(404).json({
          error: `Demographic '${demographic}' not found for district ${district}`
        });
      }

      return res.status(200).json({
        district,
        demographic,
        value,
        borough: districtData.borough
      });
    }

    // Return all demographics for the district
    return res.status(200).json({
      district,
      data: districtData,
      borough: districtData.borough
    });

  } catch (error) {
    console.error('Error in demographics API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
