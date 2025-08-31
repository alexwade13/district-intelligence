# District Intelligence Platform - AI Context File

## Overview
This is a Progressive District Intelligence Platform built for NYC Democratic Socialist organizing. It transforms a standard election results visualization app into a strategic tool for progressive electoral analysis and field organizing.

## Current State
**Base Technology Stack:**
- Next.js 15.3.3 (React framework)
- MapLibre GL (map rendering)
- Maptiler (map tiles with API key)
- D3.js (data visualization and color scales)
- SWR (data fetching)
- Theme UI (styling)

**Current Functionality:**
- ✅ Interactive NYC map with Assembly Districts and Election Districts
- ✅ **Electoral Performance Analysis** (2021 Maya Wiley → 2025 Zohran Mamdani comparison)
- ✅ Local API endpoint serving candidate performance data
- ✅ Click-to-explore district details with performance metrics
- ✅ Five data views: Growth Categories, 2021 Baseline, 2025 Current, Growth Rate, Vote Share Change
- ✅ Color-coded growth/decline heatmaps with trend categories
- ✅ Dynamic methodology panels with context-specific explanations
- ✅ Numerical metrics display with precise 2-decimal formatting
- ✅ Assembly District aggregation (averages when no district selected)
- ✅ Clean, neutral language avoiding editorial commentary
- ✅ Responsive design with mobile support

## Data Sources Available

### 1. Historical Election Data (`/DSA/district_candidate_research/`)
- **2018-2024 State Senate election results** (Jessica Ramos district)
- **Mayoral primary results** by Assembly/Election District
- **Progressive candidate performance data** (Zohran, Maya Wiley, etc.)

### 2. Advanced RCV Analysis (`/past_left_candidate_performance/`)
- **2025 Mayoral Primary Cast Vote Records** (complete ballot data)
- **2021 Mayoral Primary Cast Vote Records** 
- **Interactive heatmaps** (already generated)
- **Python processing pipeline** for new data
- **Election District level granularity**

### 3. Progressive Performance Metrics
- **Zohran Mamdani 2025** performance by ED (56.76% in ED 001, 76.86% in ED 002)
- **Maya Wiley 2021** performance by ED
- **Working Families Party** vote shares
- **Field organizing capacity data** (DSA membership, volunteer targets)

## Technical Architecture

### API Structure
```
/api/data/
└── progressive-evolution.js # Maya 2021 → Zohran 2025 comparison data
```

### Key Components
```
/components/
├── constants.js        # Candidate colors, map styles, data mappings
├── load.js            # Data fetching with SWR
├── utils.js           # Map interaction handlers
└── layers/            # Map layer management
```

### Map Configuration
- **Base maps**: Maptiler streets-v2 (color) and basic-v2 (monochrome)
- **Districts**: Assembly Districts (broader) and Election Districts (granular)
- **Interactions**: Click, hover, filter, zoom
- **Visualizations**: Opacity-based heatmaps, candidate-specific coloring

## Environment Setup
```bash
# Required environment variables
NEXT_PUBLIC_MAPTILER_KEY=UlTB185dHUZ3XxkVvU7W

# Development
npm install
npm run dev  # http://localhost:3000
```

## Current Data Flow

### Electoral Performance Analysis Mode
1. **Frontend** requests data from `/api/data/progressive-evolution`
2. **API** processes 2021 + 2025 CSV files from `district_candidate_research`
3. **Map** renders growth/decline patterns with color-coded categories
4. **Visualization** shows before/after comparison with performance metrics
5. **Interaction** displays growth percentages and trend analysis

## Recently Completed Enhancements
- ✅ **Electoral Performance Analysis**: 2021 Maya Wiley → 2025 Zohran Mamdani comparison
- ✅ **Growth Visualization**: Color-coded categories (Major Growth, Growth, Decline, Major Decline)
- ✅ **Performance API**: Real-time processing of CSV data from district_candidate_research
- ✅ **Dynamic Methodology**: Context-specific calculation explanations for each data view
- ✅ **Code Cleanup**: Removed inline comments and simplified to single-purpose demo
- ✅ **Interface Streamlining**: Focused solely on candidate performance analysis
- ✅ **Neutral Language**: Changed "Progressive Indicator" to "Data View" for objectivity
- ✅ **Enhanced Data Display**: Added precise numerical metrics alongside visual bars
- ✅ **Vote Share Change Implementation**: Fixed missing visualization for vote share changes
- ✅ **Assembly District Aggregation**: Shows overall AD36 averages when no district selected
- ✅ **Decimal Precision**: Standardized to 2 decimal places for all numeric displays

## Remaining Technical Improvements
- Better error handling for missing evolution data
- Mobile optimization for evolution metrics display
- Caching for CSV processing performance
- Additional progressive candidates integration

## File Structure Notes
```
district-intelligence/
├── .env.local                 # Contains Maptiler API key
├── Mayor+(Democratic).json    # Current data source (83k+ lines)
├── pages/api/data/           # Local API endpoints
├── components/               # React components and utilities
├── data/shapes/             # NYC district GeoJSON files
└── public/shapes/           # Additional shape files
```

## Integration Opportunities
The `/DSA/district_candidate_research/` folder contains a complete Python pipeline for processing NYC election data that could be integrated:
- `process_ad_election_data.py` - One-command data processing
- Pre-generated heatmaps for Assembly District 36
- RCV analysis tools for detailed ballot examination

## Development Guidelines
- **Map tiles**: Use Maptiler standard maps (streets-v2, basic-v2) with provided API key
- **Data format**: Maintain district-level aggregation for performance
- **Color schemes**: Utilize D3 scales for progressive strength visualization
- **Responsive design**: Maintain mobile-first approach with Theme UI
- **Local development**: All data sources are local files (no external dependencies)

---

## Future Development Plans

### Phase 1: Progressive Visualization Options ✅ COMPLETED

#### **✅ "Progressive Strength Scanner"** - IMPLEMENTED
Shows progressive electoral viability across NYC districts
- **Data**: Current progressive candidate performance (Zohran, Maya, Jessica, Brad, Zellnor)
- **Visualization**: Color-coded heatmap with distinct candidate colors
- **Use Case**: Quick assessment of where progressive candidates are performing
- **Status**: ✅ Live and functional

#### **✅ "Progressive Evolution Tracker"** - IMPLEMENTED  
Historical analysis showing progressive movement over time
- **Data**: 2021 Maya Wiley → 2025 Zohran Mamdani performance comparison
- **Visualization**: Growth/decline heatmaps with trend categories (Major Growth, Growth, Decline, Major Decline)
- **Use Case**: Identify districts with dramatic progressive improvement or decline
- **Key Insights**: 64 districts show Major Growth, only 3 show decline
- **Status**: ✅ Live with real-time CSV processing

#### **Future: "Organizing ROI Dashboard"**
Combine electoral data with field organizing capacity metrics
- **Data**: Progressive performance + DSA membership + volunteer capacity + win targets
- **Visualization**: Multi-layer analysis showing best organizing opportunities
- **Use Case**: Resource allocation for maximum electoral impact
- **Status**: 🔄 Next priority for development

### Phase 2: Advanced Analytics Features
- **Demographic Correlation Analysis**: Link progressive performance to ACS/Census data
- **Turnout Modeling**: Predict turnout patterns by district characteristics  
- **Coalition Building Insights**: WFP + DSA + progressive candidate performance
- **Predictive Modeling**: Machine learning for future progressive viability
- **RCV Deep Dive**: Ranked choice voting transfer analysis
- **Field Organizing Optimization**: Volunteer deployment recommendations

### Phase 3: Strategic Intelligence Platform
- **Multi-Election Analysis**: Track performance across different race types
- **Candidate Recruitment Tool**: Identify districts needing progressive challengers
- **Real-time Organizing Dashboard**: Live field metrics during campaigns
- **Policy Impact Tracking**: How progressive policies perform by district
- **Coalition Partner Mapping**: Identify allied organizations by geography

### Data Integration Roadmap
**Immediate (Available Now):**
- ✅ Zohran 2025 mayoral data (56.76% in ED 001, 76.86% in ED 002)
- ✅ Maya 2021 mayoral data (complete RCV records)
- ✅ Assembly District 36 detailed breakdowns
- ✅ Python processing pipeline for new elections

**Short-term (Next 3-6 months):**
- Jessica Ramos historical performance (2018-2024 data available)
- DSA membership density by district
- Working Families Party vote shares
- Progressive ballot measure performance

**Long-term (6+ months):**
- Census demographic correlations
- Turnout modeling data
- Real-time organizing metrics
- Multi-candidate progressive analysis

### Technical Enhancement Pipeline
**Performance Optimizations:**
- Data caching for faster load times
- Progressive web app features
- Mobile-optimized interactions

**Advanced Visualizations:**
- Time-series animations
- Multi-variable correlation plots
- Interactive filtering combinations
- Export capabilities for organizers

**Platform Integrations:**
- Direct connection to organizing databases
- Real-time election night updates
- Social media sharing optimizations
