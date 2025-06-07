import React, { useState, useMemo } from 'react';
import * as d3 from 'd3';
import { SideNav } from './SideNav';
import GlobeCanvas from './GlobeCanvas';
import CountryNews from './CountryNews';
import countryNameToCode from '../data/countryNameToCode';
import './GlobeView.css';

const GlobeView = () => {
  const [countries, setCountries] = React.useState([]);
  const [zoom, setZoom] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryArticles, setCountryArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = ["All", "Politics", "Technology", "Business", "Science"];

  // Process country data with D3
  const processedCountries = useMemo(() => {
    if (!countries.length) return [];
    
    // Create a geo path generator
    const path = d3.geoPath();
    
    return countries.map(country => {
      // Calculate centroid using D3
      const centroid = path.centroid(country);
      // Calculate area using D3
      const area = d3.geoArea(country);
      // Convert area to a reasonable font size (log scale)
      const baseSize = Math.max(0.2, Math.min(1, Math.log(1 + area * 1000) / 10));
      
      return {
        ...country,
        centroid,
        baseSize,
        // Hide labels for very small countries
        shouldShow: area > 0.000001
      };
    });
  }, [countries]);

  const fetchNewsForCountry = async (countryName, category = '') => {
    const countryCode = countryNameToCode[countryName];
    if (!countryCode) {
      console.warn("No code for country:", countryName);
      setError(`No news available for ${countryName}`);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        country: countryCode,
        ...(category !== 'All' && { category })
      });
      
      const response = await fetch(`http://localhost:4000/api/news?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch news');
      }
      
      setCountryArticles(data.articles || []);
    } catch (error) {
      console.error("Failed to fetch news:", error);
      setError(error.message || 'Failed to load news. Please try again later.');
      setCountryArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value) {
      // Find matching country
      const matchingCountry = processedCountries.find(country => 
        country.properties.name.toLowerCase().includes(value.toLowerCase())
      );

      if (matchingCountry) {
        // Get the coordinates of the matching country
        const lat = matchingCountry.centroid?.[1] || 0;
        const lng = matchingCountry.centroid?.[0] || 0;

        // Select the country and fetch news
        setSelectedCountry(matchingCountry.properties.name);
        fetchNewsForCountry(matchingCountry.properties.name, selectedCategory);
      }
    }
  };

  const handleCountryClick = (polygon) => {
    const countryName = polygon.properties?.name;
    if (countryName) {
      setSelectedCountry(countryName);
      fetchNewsForCountry(countryName, selectedCategory);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (selectedCountry) {
      fetchNewsForCountry(selectedCountry, category);
    }
  };

  React.useEffect(() => {
    fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
      .then((res) => res.json())
      .then((data) => setCountries(data.features))
      .catch((err) => {
        setCountries([]);
        console.error('Failed to fetch countries:', err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-slate-800 to-zinc-900 text-white flex relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-zinc-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-slate-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-gray-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Main content */}
      <SideNav />
      <h1 className="app-title">Terra</h1>

      <div className="globe-container relative">
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search for a country or keyword..."
            className="search-bar"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <GlobeCanvas
          countries={countries}
          zoom={zoom}
          onCountryClick={handleCountryClick}
          processedCountries={processedCountries}
        />

        {selectedCountry && (
          <CountryNews
            selectedCountry={selectedCountry}
            selectedCategory={selectedCategory}
            categories={categories}
            isLoading={isLoading}
            error={error}
            countryArticles={countryArticles}
            onCategoryChange={handleCategoryChange}
          />
        )}
      </div>
    </div>
  );
};

export default GlobeView;


