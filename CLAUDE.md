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
- ✅ Interactive NYC map with Election Districts and Assembly Districts
- ✅ **Demographics Intelligence** - Census-based demographic visualization at both ED and AD levels
- ✅ Four demographic indicators: Population, Median Household Income, Median Age, Renter Units
- ✅ Spatial mapping of 2,324 census tracts to Assembly Districts and Election Districts
- ✅ **Assembly District Drill-Down** - Click AD to see individual census tract colors within that AD
- ✅ **Census Tract Mode** - View all census tracts citywide with individual demographic data
- ✅ Click-to-explore district/tract details with demographic metrics in sidebar
- ✅ Color-coded choropleth maps with dynamic scales per indicator
- ✅ Population-weighted demographic aggregation for accurate neighborhood-level data
- ✅ Clean data display with proper formatting (currency, percentages, comma-separated numbers)
- ✅ Responsive design with mobile support
- ✅ **Electoral Performance Analysis** (temporarily hidden but code preserved)

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
├── demographics.js              # Election district demographic data (preserved)
├── assembly-demographics.js     # Assembly district aggregate demographics (active)
├── assembly-tract-data.js       # Census tract data organized by AD for drill-down (active)
├── progressive-evolution.js     # Maya 2021 → Zohran 2025 comparison (preserved, hidden)
├── council.js                   # Council district data
├── mayoral.js                   # Mayoral race data
└── status.js                    # App status endpoint
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

### Demographics Intelligence Mode (Active)
1. **Python Scripts** download and process census data:
   - `scripts/download_census_data.py` - Downloads raw census tract data from Census API
   - `scripts/spatial_mapping.py` - Performs spatial intersection of census tracts → election districts
   - Outputs: `data/district_demographics.json` (4,221 districts with demographic data)
2. **Frontend** requests data from `/api/data/demographics`
3. **API** serves pre-computed demographic data (Population, Income, Age, Renter %)
4. **Map** renders color-coded choropleth based on selected demographic indicator
5. **Sidebar** displays detailed metrics when user clicks on an election district
6. **Interaction** allows switching between demographic indicators via dropdown

### Electoral Performance Analysis Mode (Preserved, Hidden)
- Code and data endpoints remain functional
- UI temporarily hidden via commented-out dropdown in `components/options.js`
- Can be re-enabled by uncommenting lines 30-53 in that file

## Recently Completed Enhancements (Jan 2025)
- ✅ **Demographics Intelligence MVP**: Census-based demographic visualization at election district level
- ✅ **Spatial Mapping Pipeline**: Python scripts for census tract → election district aggregation
- ✅ **Census Data Integration**: Downloaded and processed 2,324 census tracts for NYC
- ✅ **Population-Weighted Aggregation**: Accurate neighborhood-level demographic calculations
- ✅ **Interactive Demographics Sidebar**: Click on district to see Population, Income, Age, Renter %
- ✅ **Dynamic Color Scales**: D3-based choropleth maps with indicator-specific formatting
- ✅ **UI Simplification**: Removed Progressive Evolution from UI (code preserved)
- ✅ **Field Name Mapping**: Frontend maps display names to JSON field names for flexibility
- ✅ **Assembly District Demographics**: Spatial mapping of census tracts to ADs with aggregate metrics
- ✅ **Assembly District Drill-Down**: Click AD to hide aggregate color and show constituent tract colors
- ✅ **Census Tract Mode**: Toggle to view all tracts citywide with clickable individual tract data
- ✅ **Toggle Interaction**: Click AD once to drill-down, click again to collapse back to aggregate view
- ✅ **Dual View Modes**: "Assembly Districts" mode (with drill-down) and "Census Tracts" mode (full tract view)

## Remaining Technical Improvements
- Additional demographic indicators (race/ethnicity, language, foreign-born status) - removed from current scope but data pipeline supports them
- Hover tooltips for census tracts showing demographic data
- Better mobile optimization for demographic sidebar
- Data export capabilities for organizers
- Performance optimization for large tract datasets

## File Structure Notes
```
district-intelligence/
├── .env.local                          # Contains Maptiler API key
├── scripts/                            # Python data processing pipeline
│   ├── download_census_data.py         # Downloads raw census tract data
│   ├── download_assembly_districts.py  # Downloads Assembly District boundaries
│   ├── map_tracts_to_assembly.py       # Maps census tracts → Assembly Districts
│   ├── prepare_tract_shapes.py         # Prepares tract GeoJSON for frontend
│   ├── spatial_mapping.py              # Maps census tracts → election districts (legacy)
│   └── process_demographics.py         # (Helper, called by spatial_mapping)
├── data/                               # Processed data files
│   ├── assembly_demographics.json      # AD-level aggregate demographics (active)
│   ├── assembly_tract_data.json        # Tract demographics organized by AD (active)
│   ├── ad_tract_mapping.json          # Spatial relationship: AD → tract GEOIDs
│   ├── district_demographics.json      # ED-level demographics (preserved)
│   ├── raw_tract_data.json            # Raw census tract data from Census API
│   ├── tract_id_mapping.json          # Tract GEOID → parent AD mapping
│   └── shapes/                        # District metadata (non-GeoJSON)
│       ├── census_tracts.json         # Tract metadata for frontend
│       ├── assembly_districts.json     # AD metadata
│       └── election_districts.json     # ED metadata
├── geometry/raw/                       # GeoJSON boundary files
│   ├── districts-all.geojson          # Election district boundaries
│   ├── assembly_districts_nyc.geojson # Assembly district boundaries (AD 23-87)
│   └── census_tracts_nyc.geojson      # Census tract boundaries (2,324 tracts)
├── public/shapes/                      # Frontend-ready GeoJSON
│   └── census-tracts.json             # Processed tract shapes for MapLibre
├── pages/api/data/                     # Next.js API endpoints
│   ├── assembly-demographics.js        # Serves AD aggregate demographics (active)
│   ├── assembly-tract-data.js          # Serves tract data organized by AD (active)
│   ├── demographics.js                 # Serves ED demographics (preserved)
│   ├── progressive-evolution.js        # Electoral performance (preserved)
│   └── [other endpoints]
├── lib/                                # Utility functions and helpers
│   ├── mapHelpers.js                  # Map rendering and coloring logic
│   │   ├── updateDistrictColors()     # Colors ED/AD by aggregate demographics
│   │   ├── updateTractColors()        # Colors all tracts in tract mode
│   │   └── updateDrilledDownTracts()  # Colors tracts within selected AD
│   └── mapEventHelpers.js             # Map interaction handlers
│       ├── setupMapEventHandlers()    # Click/hover handlers for districts and tracts
│       └── updateLayerVisibility()    # Toggle layer visibility based on mode
├── components/                         # React components
│   ├── results.js                      # Sidebar with district/tract details
│   ├── options.js                      # Dropdowns (View Mode, Data View)
│   ├── constants.js                    # Colors, scales, field mappings
│   └── load.js                         # Data fetching with SWR
└── pages/index.js                      # Main map page with drill-down logic
```

## Integration Opportunities
The `/DSA/district_candidate_research/` folder contains a complete Python pipeline for processing NYC election data that could be integrated:
- `process_ad_election_data.py` - One-command data processing
- Pre-generated heatmaps for Assembly District 36
- RCV analysis tools for detailed ballot examination

## Development Guidelines
- **Map tiles**: Use Maptiler standard maps (streets-v2, basic-v2) with provided API key
- **Data format**: Maintain district-level aggregation for performance; use pre-computed JSON files
- **Color schemes**: Utilize D3 scales with interpolateLab for smooth color transitions
- **Responsive design**: Maintain mobile-first approach with Theme UI
- **Python environment**: Use `venv` for spatial data processing (geopandas, shapely required)
- **Data processing**: Run Python scripts to generate demographic data, then serve via Next.js API
- **Local development**: All data sources are local files (no external dependencies at runtime)

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

#### **✅ "Demographics Intelligence"** - COMPLETED (Election District Level)
Display census demographic data at the neighborhood level using spatial mapping
- **Data**: Census ACS 5-year data (Population, Median Household Income, Median Age, Renter Units)
- **Approach**: Spatial mapping of census tracts to election districts with population-weighted aggregation
- **UI**: Demographics-only view with dropdown to select metric, district-specific detail sidebar
- **Technical Implementation**:
  - Python scripts download census tract shapefiles and demographic data from Census API
  - GeoPandas performs spatial intersection to map ~2,324 census tracts to 4,221 election districts
  - Population-weighted averages ensure accurate neighborhood-level demographic representation
  - Next.js API endpoint serves pre-computed demographic data for fast rendering
  - MapLibre GL renders color-coded choropleth maps with dynamic scales
- **Data Sources**: 
  - US Census Bureau ACS 5-Year Estimates (tract-level)
  - TIGER/Line Shapefiles (census tract boundaries)
  - Spatially-mapped to NYC election district boundaries
- **Status**: ✅ Live and functional for Election Districts
- **Progressive Evolution View**: Temporarily hidden (code preserved) to focus on demographics

#### **✅ "Demographics Intelligence - Assembly District Enhancement"** - COMPLETED
Extended demographic visualization to Assembly District level with census tract drill-down
- **Goal**: Two-level demographic visualization similar to existing ED/AD toggle
- **User Flow**:
  1. Select "Assembly district" from dropdown → See aggregate demographics for each AD
  2. Click on an Assembly District → Drill down to see individual census tracts within that AD
  3. Each census tract colored by selected demographic metric
  4. Back/deselect behavior returns to AD-level aggregate view
- **Technical Requirements**:

**Phase 1: Data Generation (Python)**
1. Download Assembly District boundaries (TIGER/Line or NYC Open Data)
   - Create: `scripts/download_assembly_districts.py`
   - Output: `geometry/raw/assembly_districts_nyc.geojson`
   - Source: NYC Assembly Districts 23-87
2. Spatial mapping of census tracts to Assembly Districts
   - Modify: `scripts/spatial_mapping_assembly.py`
   - Perform spatial intersection: which tracts belong to which ADs
   - Output: Tract-to-AD mapping dictionary
3. Aggregate demographics to Assembly District level
   - Calculate population-weighted averages for each AD
   - Output: `data/assembly_demographics.json`
   - Format: `{"23": {"population": 150000, "median_income": 85000, ...}, ...}`
4. Store tract-level data for drill-down
   - Output: `data/assembly_tract_mapping.json`
   - Format: `{"23": {"tracts": [...], "tract_demographics": {...}}, ...}`

**Phase 2: Backend API (Next.js)**
1. Assembly aggregate demographics endpoint
   - Create: `pages/api/data/assembly-demographics.js`
   - Returns: AD-level aggregate demographics
2. Assembly tract detail endpoint (dynamic route)
   - Create: `pages/api/data/assembly-tracts/[ad_id].js`
   - Returns: Census tract demographics for specific AD
   - Powers the drill-down view

**Phase 3: Frontend Updates**
1. Data loading (`components/load.js`)
   - Add `useSWR` for assembly demographics
   - Conditional loading of tract data when AD selected
2. Map rendering (`pages/index.js`, `components/layers.js`)
   - Add assembly district GeoJSON source
   - Add census tract GeoJSON source
   - Two visualization modes:
     - Mode A: Assembly districts colored by aggregate demographics
     - Mode B: When AD clicked, show only that AD's census tracts (individually colored)
   - Layer visibility toggling and filtering by selected AD
3. Interaction logic (`pages/index.js`)
   - When `scale === 'Assembly district'`:
     - No selection: Color ADs by aggregate demographics
     - AD selected: Hide other ADs, show census tracts for selected AD only
   - Add back/deselect behavior
4. Sidebar updates (`components/results.js`)
   - Show AD aggregate demographics when AD selected
   - Optional: Display tract count or tract-level statistics
5. Visual polish
   - Thinner borders for census tracts (0.5px vs 0.25px for districts)
   - Breadcrumb/indicator: "Assembly District 23 > Census Tracts"
   - Back button or click-off behavior

**Key Technical Challenges**:
- **Two-level visualization**: Smooth toggle between AD polygons and census tract polygons using layer filtering
- **Performance**: 2,324 tracts total, but only ~30-80 per AD when filtered
- **Assembly District GeoJSON**: Currently only have metadata, need actual boundary shapes

**Files to Create/Modify**:
- NEW: `scripts/download_assembly_districts.py`
- NEW: `scripts/spatial_mapping_assembly.py`
- NEW: `data/assembly_demographics.json`
- NEW: `data/assembly_tract_mapping.json`
- NEW: `pages/api/data/assembly-demographics.js`
- NEW: `pages/api/data/assembly-tracts/[ad_id].js`
- MODIFY: `components/load.js` (add assembly data fetching)
- MODIFY: `components/layers.js` or `pages/index.js` (add tract layer management)
- MODIFY: `pages/index.js` (add drill-down interaction logic)
- MODIFY: `components/results.js` (show AD aggregate + tract info)

- **Status**: 📋 Detailed plan documented, awaiting implementation

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
**Completed:**
- ✅ Census demographic data (Population, Median Income, Age, Renter %) at election district level
- ✅ Spatial mapping of 2,324 census tracts to Assembly Districts and Election Districts
- ✅ Python processing pipeline for demographic data (download, spatial mapping, aggregation)
- ✅ **Assembly District demographic visualization with census tract drill-down**
- ✅ **Dual view modes**: Assembly Districts (with drill-down) and Census Tracts (citywide)
- ✅ **Toggle drill-down interaction**: Click AD to show/hide constituent tract colors
- ✅ **Census Tract Mode**: Individual tract selection and data display
- ✅ Zohran 2025 & Maya 2021 mayoral data (code preserved, UI hidden)

**Short-term (Next 1-2 months):**
- Additional demographic indicators (race/ethnicity, languages spoken, foreign-born status) - data pipeline supports, UI needs expansion
- Hover tooltips for census tracts showing demographic data without clicking
- Re-enable Progressive Evolution view alongside Demographics (dual-mode interface)
- Jessica Ramos historical performance (2018-2024 data available in district_candidate_research)

**Medium-term (3-6 months):**
- Demographic correlation analysis with progressive performance
- DSA membership density by district
- Working Families Party vote shares
- Progressive ballot measure performance
- Turnout modeling data

**Long-term (6+ months):**
- Real-time organizing metrics dashboard
- Multi-candidate progressive analysis
- Predictive modeling for progressive viability

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
