import fs from 'fs';
import path from 'path';

function processEvolutionData() {
  try {
    const data2021Path = path.join(process.cwd(), '../district_candidate_research/past_left_candidate_performance/src/AD_36_PE2021_CVR_Final_Output/AD36_Mayor_ED_Tally.csv');
    const data2025Path = path.join(process.cwd(), '../district_candidate_research/past_left_candidate_performance/src/AD_36_2025_Primary_CVR_2025-07-17_Output/AD36_Mayor_ED_Tally.csv');
    
    const results = {};
    
    // Process 2021 data (Maya D. Wiley as progressive baseline)
    if (fs.existsSync(data2021Path)) {
      const data2021 = fs.readFileSync(data2021Path, 'utf8');
      const lines2021 = data2021.split('\n').slice(1); // Skip header
      
      lines2021.forEach(line => {
        if (line.trim()) {
          const parts = line.split(',');
          const [district, edNum, candidateId, candidateName, votes, percentage] = parts;
          if (district && candidateName && candidateName.includes('Maya D. Wiley')) {
            const edKey = `36${edNum.padStart(3, '0')}`;
            if (!results[edKey]) results[edKey] = {};
            results[edKey].progressive2021 = parseFloat(percentage) || 0;
            results[edKey].candidate2021 = 'Maya D. Wiley';
            results[edKey].votes2021 = parseInt(votes) || 0;
          }
        }
      });
    }
    
    // Process 2025 data (Zohran Kwame Mamdani as progressive current)
    if (fs.existsSync(data2025Path)) {
      const data2025 = fs.readFileSync(data2025Path, 'utf8');
      const lines2025 = data2025.split('\n').slice(1); // Skip header
      
      lines2025.forEach(line => {
        if (line.trim()) {
          const parts = line.split(',');
          const [district, edNum, candidateId, candidateName, votes, percentage] = parts;
          if (district && candidateName && candidateName.includes('Zohran Kwame Mamdani')) {
            const edKey = `36${edNum.padStart(3, '0')}`;
            if (!results[edKey]) results[edKey] = {};
            results[edKey].progressive2025 = parseFloat(percentage) || 0;
            results[edKey].candidate2025 = 'Zohran Kwame Mamdani';
            results[edKey].votes2025 = parseInt(votes) || 0;
          }
        }
      });
    }
    
    // Calculate growth metrics
    Object.keys(results).forEach(edKey => {
      const ed = results[edKey];
      if (ed.progressive2021 !== undefined && ed.progressive2025 !== undefined) {
        ed.growthPoints = ed.progressive2025 - ed.progressive2021;
        ed.growthPercent = ed.progressive2021 > 0 ? ((ed.progressive2025 - ed.progressive2021) / ed.progressive2021) * 100 : 0;
        ed.trendCategory = ed.growthPoints > 10 ? 'Major Growth' : 
                          ed.growthPoints > 0 ? 'Growth' : 
                          ed.growthPoints > -10 ? 'Decline' : 'Major Decline';
      }
    });
    
    return results;
  } catch (error) {
    console.error('Error processing evolution data:', error);
    return {};
  }
}

export default async function handler(req, res) {
  try {
    const evolutionData = processEvolutionData();
    res.status(200).json(evolutionData);
  } catch (error) {
    console.error('Error processing progressive evolution data:', error);
    res.status(500).json({ error: 'Failed to load progressive evolution data' });
  }
}
