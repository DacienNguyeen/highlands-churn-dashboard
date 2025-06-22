# Highlands Coffee Customer Churn Analysis Dashboard

## Overview

This interactive dashboard provides comprehensive customer churn analysis for Highlands Coffee, featuring multi-dimensional visualizations, hierarchical drill-downs, and actionable insights for customer retention strategies.

## Features

### 🎯 Key Metrics Dashboard
- Total customers: 70,752
- Churned customers: 9,064 (12.8% churn rate)
- Retained customers: 61,688
- Real-time analytics with Highlands Coffee branding

### 📊 Multi-Dimensional Analysis
- **Demographics**: Gender, age groups, income segments (MPI)
- **Behavior**: Visit patterns, companion behavior, need states
- **Brand Perception**: NPS analysis, brand health metrics
- **Insights**: Strategic recommendations and action plans

### 🔍 Interactive Visualizations
- Combined bar and line charts for comprehensive analysis
- Pie charts for companion behavior segmentation
- Horizontal bar charts for income group analysis
- Custom tooltips with detailed metrics

### 🎨 Design Features
- Highlands Coffee brand colors (#b3282d, #be955c, #fdfcfb, #513529, #b96345)
- Responsive design for desktop and mobile
- Hover effects and smooth transitions
- Professional card-based layout

## Technical Implementation

### Data Processing
- **Churn Logic**: Customers with P3M=1 and P1M=0 classified as churned
- **Data Integration**: Galaxy schema with fact and dimension tables
- **Real-time Calculations**: Dynamic metric computation

### Technology Stack
- **Frontend**: React 18 with Vite
- **UI Components**: Shadcn/UI with Tailwind CSS
- **Charts**: Recharts library for interactive visualizations
- **Icons**: Lucide React icons
- **Deployment**: Manus hosting platform

## Key Insights

### High-Risk Segments
- **NPS Detractors**: 58.4% churn rate (critical attention required)
- **Age Group 30-39**: 15.2% churn rate (highest demographic risk)
- **Solo Visitors**: Higher churn compared to group visitors
- **Income Segments**: Specific MPI groups with retention challenges

### Strategic Recommendations

#### Immediate Actions (0-3 months)
1. Implement NPS-based early warning system
2. Launch targeted retention campaigns for high-risk segments
3. Enhance customer experience for solo visitors

#### Long-term Strategy (3-12 months)
1. Develop segment-specific loyalty programs
2. Create need-state-based service offerings
3. Implement predictive churn modeling

## Dashboard Sections

### 1. Demographics Tab
- Gender-based churn analysis with trend lines
- Age group segmentation with retention patterns
- Income group (MPI) horizontal analysis

### 2. Behavior Tab
- Visit day patterns across the week
- Companion behavior pie chart analysis
- Need state groups impact on retention

### 3. Brand Perception Tab
- NPS group analysis with retention correlation
- Brand health overview with risk categorization
- Service quality impact assessment

### 4. Insights Tab
- High-risk and retention opportunity segments
- Strategic recommendations with timelines
- Key metrics summary dashboard

## Data Sources

- **Dim_Customers**: Customer demographics and churn flags
- **Fact_BrandHealth**: NPS scores and brand perception metrics
- **Fact_Companion**: Customer visit companion behavior
- **Fact_NeedState**: Customer need state analysis
- **Fact_VisitDayOfWeek**: Visit pattern analysis
- **Supporting Dimensions**: Occupation, city, day mappings

## Usage Instructions

1. **Navigation**: Use the tab system to explore different analysis dimensions
2. **Interactivity**: Hover over charts for detailed tooltips
3. **Insights**: Review the Insights tab for actionable recommendations
4. **Metrics**: Monitor key performance indicators in the header cards

## Business Impact

### Expected Outcomes
- **Short-term**: 2-3 percentage point churn reduction
- **Medium-term**: 4-5 percentage point improvement
- **Long-term**: 6-8 percentage point reduction target
- **ROI**: Estimated $500K-750K monthly retention value

### Success Metrics
- Monthly churn rate target: <10%
- NPS score target: >50
- Customer lifetime value: 25% increase
- Retention campaign ROI: >300%

## Deployment

The dashboard is deployed at: **https://tkbwmisf.manus.space**

### Local Development
```bash
cd highlands-churn-dashboard
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

## Files Included

- **Interactive Dashboard**: React application with full functionality
- **Analysis Report**: Comprehensive PDF report with findings and recommendations
- **Source Code**: Complete React project with components and styling
- **Data Files**: Processed CSV files with churn calculations

## Contact

For questions about the dashboard or analysis methodology, please contact the Customer Analytics Team.

---

*Dashboard created using Manus AI platform*  
*Last updated: June 22, 2025*

