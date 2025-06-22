import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ComposedChart } from 'recharts'
import { TrendingDown, TrendingUp, Users, UserX, Coffee, BarChart3, PieChart as PieChartIcon, Filter, ChevronDown, ChevronRight } from 'lucide-react'
import './App.css'

function App() {
  const [data, setData] = useState({
    customers: [],
    brandHealth: [],
    brandImage: [],
    companion: [],
    needState: [],
    visitDayOfWeek: [],
    visitDayPart: [],
    occupation: [],
    city: [],
    dayOfWeek: [],
    needStateDim: []
  })
  
  const [selectedDimension, setSelectedDimension] = useState('overview')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [drillDownLevel, setDrillDownLevel] = useState({})

  // Load CSV data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          customersRes,
          brandHealthRes,
          brandImageRes,
          companionRes,
          needStateRes,
          visitDayOfWeekRes,
          visitDayPartRes,
          occupationRes,
          cityRes,
          dayOfWeekRes,
          needStateDimRes
        ] = await Promise.all([
          fetch('/src/assets/processed_dim_customers_with_churn.csv'),
          fetch('/src/assets/processed_fact_brandhealth_with_churn.csv'),
          fetch('/src/assets/Fact_BrandImage.csv'),
          fetch('/src/assets/Fact_Companion.csv'),
          fetch('/src/assets/Fact_NeedState.csv'),
          fetch('/src/assets/Fact_VisitDayOfWeek.csv'),
          fetch('/src/assets/Fact_VisitDayPart.csv'),
          fetch('/src/assets/Dim_Occupation.csv'),
          fetch('/src/assets/Dim_City.csv'),
          fetch('/src/assets/Dim_Dayofweek.csv'),
          fetch('/src/assets/Dim_NeedState.csv')
        ])

        const parseCSV = (text) => {
          const lines = text.split('\n').filter(line => line.trim())
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
          return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
            const obj = {}
            headers.forEach((header, index) => {
              obj[header] = values[index] || ''
            })
            return obj
          })
        }

        const customers = parseCSV(await customersRes.text())
        const brandHealth = parseCSV(await brandHealthRes.text())
        const brandImage = parseCSV(await brandImageRes.text())
        const companion = parseCSV(await companionRes.text())
        const needState = parseCSV(await needStateRes.text())
        const visitDayOfWeek = parseCSV(await visitDayOfWeekRes.text())
        const visitDayPart = parseCSV(await visitDayPartRes.text())
        const occupation = parseCSV(await occupationRes.text())
        const city = parseCSV(await cityRes.text())
        const dayOfWeek = parseCSV(await dayOfWeekRes.text())
        const needStateDim = parseCSV(await needStateDimRes.text())

        setData({
          customers,
          brandHealth,
          brandImage,
          companion,
          needState,
          visitDayOfWeek,
          visitDayPart,
          occupation,
          city,
          dayOfWeek,
          needStateDim
        })
        setLoading(false)
      } catch (error) {
        console.error('Error loading data:', error)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Calculate metrics
  const calculateMetrics = () => {
    if (!data.customers.length) return { totalCustomers: 0, churnedCustomers: 0, churnRate: 0, retainedCustomers: 0 }
    
    const totalCustomers = data.customers.length
    const churnedCustomers = data.customers.filter(c => parseInt(c.Churn) === 1).length
    const churnRate = ((churnedCustomers / totalCustomers) * 100).toFixed(1)
    const retainedCustomers = totalCustomers - churnedCustomers
    
    return { totalCustomers, churnedCustomers, churnRate, retainedCustomers }
  }

  // Calculate churn by dimension with enhanced data
  const calculateChurnByDimension = (dimension) => {
    if (!data.customers.length) return []
    
    const groups = {}
    data.customers.forEach(customer => {
      const key = customer[dimension] || 'Unknown'
      if (!groups[key]) {
        groups[key] = { total: 0, churned: 0 }
      }
      groups[key].total++
      if (parseInt(customer.Churn) === 1) {
        groups[key].churned++
      }
    })

    return Object.entries(groups).map(([key, value]) => ({
      name: key,
      total: value.total,
      churned: value.churned,
      retained: value.total - value.churned,
      churnRate: parseFloat(((value.churned / value.total) * 100).toFixed(1))
    })).sort((a, b) => b.churnRate - a.churnRate)
  }

  // Calculate brand health metrics
  const calculateBrandHealthMetrics = () => {
    if (!data.brandHealth.length) return []
    
    const npsGroups = {}
    data.brandHealth.forEach(record => {
      const npsGroup = record['NPS#P3M#Group'] || 'Unknown'
      const comprehension = record['Comprehension'] || 'Unknown'
      const segmentation = record['SegmentationFull'] || 'Unknown'
      const churn = parseInt(record.Churn) || 0
      
      if (!npsGroups[npsGroup]) {
        npsGroups[npsGroup] = { total: 0, churned: 0 }
      }
      npsGroups[npsGroup].total++
      if (churn === 1) {
        npsGroups[npsGroup].churned++
      }
    })

    return Object.entries(npsGroups).map(([key, value]) => ({
      name: key,
      total: value.total,
      churned: value.churned,
      retained: value.total - value.churned,
      churnRate: parseFloat(((value.churned / value.total) * 100).toFixed(1))
    })).sort((a, b) => b.churnRate - a.churnRate)
  }

  // Calculate companion behavior
  const calculateCompanionBehavior = () => {
    if (!data.companion.length) return []
    
    // Create a map of customer IDs to churn status
    const customerChurnMap = {}
    data.customers.forEach(customer => {
      customerChurnMap[customer.CustomerID] = parseInt(customer.Churn) || 0
    })

    const companionGroups = {}
    data.companion.forEach(record => {
      const companionGroup = record['Companion#group'] || 'Unknown'
      const customerId = record.CustomerID
      const churn = customerChurnMap[customerId] || 0
      
      if (!companionGroups[companionGroup]) {
        companionGroups[companionGroup] = { total: 0, churned: 0 }
      }
      companionGroups[companionGroup].total++
      if (churn === 1) {
        companionGroups[companionGroup].churned++
      }
    })

    return Object.entries(companionGroups).map(([key, value]) => ({
      name: key,
      total: value.total,
      churned: value.churned,
      retained: value.total - value.churned,
      churnRate: parseFloat(((value.churned / value.total) * 100).toFixed(1))
    })).sort((a, b) => b.churnRate - a.churnRate)
  }

  // Calculate need state analysis
  const calculateNeedStateAnalysis = () => {
    if (!data.needState.length || !data.needStateDim.length) return []
    
    // Create a map of customer IDs to churn status
    const customerChurnMap = {}
    data.customers.forEach(customer => {
      customerChurnMap[customer.CustomerID] = parseInt(customer.Churn) || 0
    })

    // Create a map of need state IDs to groups
    const needStateGroupMap = {}
    data.needStateDim.forEach(ns => {
      needStateGroupMap[ns.NeedStateID] = ns.NeedStateGroupNew || 'Unknown'
    })

    const needStateGroups = {}
    data.needState.forEach(record => {
      const needStateId = record.NeedStateID
      const needStateGroup = needStateGroupMap[needStateId] || 'Unknown'
      const customerId = record.CustomerID
      const churn = customerChurnMap[customerId] || 0
      
      if (!needStateGroups[needStateGroup]) {
        needStateGroups[needStateGroup] = { total: 0, churned: 0 }
      }
      needStateGroups[needStateGroup].total++
      if (churn === 1) {
        needStateGroups[needStateGroup].churned++
      }
    })

    return Object.entries(needStateGroups).map(([key, value]) => ({
      name: key,
      total: value.total,
      churned: value.churned,
      retained: value.total - value.churned,
      churnRate: parseFloat(((value.churned / value.total) * 100).toFixed(1))
    })).sort((a, b) => b.churnRate - a.churnRate)
  }

  // Calculate visit day patterns
  const calculateVisitDayPatterns = () => {
    if (!data.visitDayOfWeek.length || !data.dayOfWeek.length) return []
    
    // Create a map of customer IDs to churn status
    const customerChurnMap = {}
    data.customers.forEach(customer => {
      customerChurnMap[customer.CustomerID] = parseInt(customer.Churn) || 0
    })

    // Create a map of day IDs to day names
    const dayMap = {}
    data.dayOfWeek.forEach(day => {
      dayMap[day.DayID] = day.DayofWeek || 'Unknown'
    })

    const dayGroups = {}
    data.visitDayOfWeek.forEach(record => {
      const dayId = record.DayID
      const dayName = dayMap[dayId] || 'Unknown'
      const customerId = record.CustomerID
      const churn = customerChurnMap[customerId] || 0
      
      if (!dayGroups[dayName]) {
        dayGroups[dayName] = { total: 0, churned: 0 }
      }
      dayGroups[dayName].total++
      if (churn === 1) {
        dayGroups[dayName].churned++
      }
    })

    return Object.entries(dayGroups).map(([key, value]) => ({
      name: key,
      total: value.total,
      churned: value.churned,
      retained: value.total - value.churned,
      churnRate: parseFloat(((value.churned / value.total) * 100).toFixed(1))
    })).sort((a, b) => b.churnRate - a.churnRate)
  }

  const metrics = calculateMetrics()
  const genderChurn = calculateChurnByDimension('Gender')
  const ageGroupChurn = calculateChurnByDimension('Age Group')
  const mpiGroupChurn = calculateChurnByDimension('MPI Group')
  const brandHealthMetrics = calculateBrandHealthMetrics()
  const companionBehavior = calculateCompanionBehavior()
  const needStateAnalysis = calculateNeedStateAnalysis()
  const visitDayPatterns = calculateVisitDayPatterns()

  // Custom colors for charts
  const COLORS = ['#b3282d', '#be955c', '#b96345', '#513529', '#fdfcfb']

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'churnRate' ? `${entry.value}%` : entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Coffee className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading Dashboard</h2>
          <p className="text-muted-foreground">Preparing your churn analysis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="highlands-gradient text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Coffee className="h-10 w-10" />
              <div>
                <h1 className="text-3xl font-bold">Highlands Coffee</h1>
                <p className="text-xl opacity-90">Customer Churn Analysis Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Live Analytics
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="metric-card churn-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalCustomers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Active customer base</p>
            </CardContent>
          </Card>

          <Card className="metric-card churn-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churned Customers</CardTitle>
              <UserX className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{metrics.churnedCustomers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Lost in past month</p>
            </CardContent>
          </Card>

          <Card className="metric-card churn-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{metrics.churnRate}%</div>
              <p className="text-xs text-muted-foreground">Monthly churn percentage</p>
            </CardContent>
          </Card>

          <Card className="metric-card churn-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retained Customers</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{metrics.retainedCustomers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Still active customers</p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="demographics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="demographics" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Demographics</span>
            </TabsTrigger>
            <TabsTrigger value="behavior" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Behavior</span>
            </TabsTrigger>
            <TabsTrigger value="perception" className="flex items-center space-x-2">
              <PieChartIcon className="h-4 w-4" />
              <span>Brand Perception</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Insights</span>
            </TabsTrigger>
          </TabsList>

          {/* Demographics Tab */}
          <TabsContent value="demographics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gender Churn Analysis */}
              <Card className="chart-container churn-card">
                <CardHeader>
                  <CardTitle>Churn Rate by Gender</CardTitle>
                  <CardDescription>Customer churn distribution across gender segments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={genderChurn}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="retained" fill="#be955c" name="Retained" />
                      <Bar yAxisId="left" dataKey="churned" fill="#b3282d" name="Churned" />
                      <Line yAxisId="right" type="monotone" dataKey="churnRate" stroke="#513529" strokeWidth={3} name="Churn Rate %" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Age Group Churn Analysis */}
              <Card className="chart-container churn-card">
                <CardHeader>
                  <CardTitle>Churn Rate by Age Group</CardTitle>
                  <CardDescription>Age-based customer churn patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={ageGroupChurn}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="retained" fill="#be955c" name="Retained" />
                      <Bar yAxisId="left" dataKey="churned" fill="#b3282d" name="Churned" />
                      <Line yAxisId="right" type="monotone" dataKey="churnRate" stroke="#513529" strokeWidth={3} name="Churn Rate %" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* MPI Group Analysis */}
            <Card className="chart-container churn-card">
              <CardHeader>
                <CardTitle>Churn Rate by Income Group (MPI)</CardTitle>
                <CardDescription>Monthly Personal Income impact on customer retention</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={mpiGroupChurn} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="retained" fill="#be955c" name="Retained" />
                    <Bar dataKey="churned" fill="#b3282d" name="Churned" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Behavior Tab */}
          <TabsContent value="behavior" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Visit Day Patterns */}
              <Card className="chart-container churn-card">
                <CardHeader>
                  <CardTitle>Churn by Visit Day Patterns</CardTitle>
                  <CardDescription>Customer churn across different days of the week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={visitDayPatterns}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="retained" fill="#be955c" name="Retained" />
                      <Bar dataKey="churned" fill="#b3282d" name="Churned" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Companion Behavior */}
              <Card className="chart-container churn-card">
                <CardHeader>
                  <CardTitle>Churn by Companion Behavior</CardTitle>
                  <CardDescription>How customers visit with others affects retention</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={companionBehavior}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, churnRate }) => `${name}: ${churnRate}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="churnRate"
                      >
                        {companionBehavior.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Need State Analysis */}
            <Card className="chart-container churn-card">
              <CardHeader>
                <CardTitle>Churn by Need State Groups</CardTitle>
                <CardDescription>Customer needs and their impact on retention</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={needStateAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="retained" fill="#be955c" name="Retained" />
                    <Bar dataKey="churned" fill="#b3282d" name="Churned" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Brand Perception Tab */}
          <TabsContent value="perception" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* NPS Analysis */}
              <Card className="chart-container churn-card">
                <CardHeader>
                  <CardTitle>Churn by NPS Groups</CardTitle>
                  <CardDescription>Net Promoter Score impact on customer retention</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={brandHealthMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="retained" fill="#be955c" name="Retained" />
                      <Bar dataKey="churned" fill="#b3282d" name="Churned" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Brand Health Summary */}
              <Card className="chart-container churn-card">
                <CardHeader>
                  <CardTitle>Brand Health Overview</CardTitle>
                  <CardDescription>Key brand perception metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium">Detractors (High Churn Risk)</span>
                      <Badge variant="destructive">
                        {brandHealthMetrics.find(m => m.name.includes('Detractor'))?.churnRate || 0}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="font-medium">Passives (Medium Risk)</span>
                      <Badge variant="secondary">
                        {brandHealthMetrics.find(m => m.name.includes('Passive'))?.churnRate || 0}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Promoters (Low Risk)</span>
                      <Badge variant="default" className="bg-green-600">
                        {brandHealthMetrics.find(m => m.name.includes('Promoter'))?.churnRate || 0}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card className="chart-container churn-card">
              <CardHeader>
                <CardTitle>Key Insights & Recommendations</CardTitle>
                <CardDescription>Actionable insights from comprehensive churn analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                      <TrendingDown className="h-5 w-5 mr-2" />
                      High Risk Segments
                    </h4>
                    <ul className="text-sm text-red-700 space-y-2">
                      <li>• <strong>NPS Detractors:</strong> Highest churn risk group requiring immediate attention</li>
                      <li>• <strong>Age Groups 30-39:</strong> Showing elevated churn patterns</li>
                      <li>• <strong>Income Segments:</strong> Specific MPI groups with retention challenges</li>
                      <li>• <strong>Solo Visitors:</strong> Higher churn compared to group visitors</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Retention Opportunities
                    </h4>
                    <ul className="text-sm text-green-700 space-y-2">
                      <li>• <strong>Loyalty Programs:</strong> Target high-value customer segments</li>
                      <li>• <strong>Personalized Offers:</strong> Customize for at-risk demographics</li>
                      <li>• <strong>Experience Enhancement:</strong> Focus on companion-friendly environments</li>
                      <li>• <strong>Need-Based Services:</strong> Align offerings with customer need states</li>
                    </ul>
                  </div>
                </div>
                
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Strategic Recommendations
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-blue-700 mb-2">Immediate Actions (0-3 months)</h5>
                      <ol className="text-sm text-blue-600 space-y-1">
                        <li>1. Implement NPS-based early warning system</li>
                        <li>2. Launch targeted retention campaigns for high-risk segments</li>
                        <li>3. Enhance customer experience for solo visitors</li>
                      </ol>
                    </div>
                    <div>
                      <h5 className="font-medium text-blue-700 mb-2">Long-term Strategy (3-12 months)</h5>
                      <ol className="text-sm text-blue-600 space-y-1">
                        <li>1. Develop segment-specific loyalty programs</li>
                        <li>2. Create need-state-based service offerings</li>
                        <li>3. Implement predictive churn modeling</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-red-600">{metrics.churnRate}%</div>
                    <div className="text-sm text-gray-600">Overall Churn Rate</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.max(...genderChurn.map(g => g.churnRate)).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Highest Gender Churn</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.max(...ageGroupChurn.map(a => a.churnRate)).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Highest Age Group Churn</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-purple-600">
                      {companionBehavior.length}
                    </div>
                    <div className="text-sm text-gray-600">Companion Segments</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App

