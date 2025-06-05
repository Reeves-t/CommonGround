import React, { useEffect, useRef, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import countryNameToCode from '../data/countryNameToCode';
import * as d3 from 'd3';
import * as THREE from 'three';
import { Menu, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { SideNav } from './SideNav';
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
  const globeEl = useRef();
  const rightPanelRef = useRef();

  const categories = ["All", "Politics", "Technology", "Business", "Science"];

  // Handle click outside panels
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isGlobeClick = event.target.tagName === 'CANVAS';
      const isSearchClick = event.target.classList.contains('search-bar');
      
      if (!rightPanelRef.current?.contains(event.target) && 
          !isGlobeClick && 
          !isSearchClick) {
        setSelectedCountry(null);
        setCountryArticles([]);
        setError(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value) {
      // Find matching country
      const matchingCountry = processedCountries.find(country => 
        country.properties.name.toLowerCase().includes(value.toLowerCase())
      );

      if (matchingCountry && globeEl.current) {
        // Get the coordinates of the matching country
        const lat = matchingCountry.centroid?.[1] || 0;
        const lng = matchingCountry.centroid?.[0] || 0;

        // Animate to the country's position
        globeEl.current.pointOfView({
          lat,
          lng,
          altitude: 1.5
        }, 1000); // 1000ms animation duration

        // Select the country and fetch news
        setSelectedCountry(matchingCountry.properties.name);
        fetchNewsForCountry(matchingCountry.properties.name, selectedCategory);
      }
    }
  };

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
      .then((res) => res.json())
      .then((data) => setCountries(data.features))
      .catch((err) => {
        setCountries([]);
        console.error('Failed to fetch countries:', err);
      });
  }, []);

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = false;
      globeEl.current.controls().autoRotateSpeed = 0.45;
      
      // Add zoom event listener
      globeEl.current.controls().addEventListener('zoom', event => {
        const distance = globeEl.current.camera().position.distanceTo(globeEl.current.controls().target);
        const newZoom = Math.max(0.5, 2.5 - (distance / 500));
        setZoom(newZoom);
      });

      // === Add Spotlight ===
      const spotlight = new THREE.SpotLight(0xffffff, 0.6);
      spotlight.position.set(0, 10, 10);
      spotlight.angle = Math.PI / 6;
      spotlight.penumbra = 0.3;
      spotlight.decay = 2;
      spotlight.distance = 100;
      spotlight.castShadow = true;
      globeEl.current.scene().add(spotlight);

      // === Add Ambient Light ===
      const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
      globeEl.current.scene().add(ambientLight);

      // === Optional Rim Light ===
      const rimLight = new THREE.DirectionalLight(0x00ffff, 0.3);
      rimLight.position.set(-5, 5, 5);
      globeEl.current.scene().add(rimLight);
    }
  }, []);

  return (
    <div className="globe-bg">
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
        
        <Globe
          ref={globeEl}
          polygonsData={countries}
          polygonCapColor={() => '#9FB9F9'}
          polygonSideColor={() => '#9FB9F9'}
          polygonStrokeColor={() => '#FFFFFF'}
          onPolygonClick={(polygon) => {
            const countryName = polygon.properties?.name;
            if (countryName) {
              setSelectedCountry(countryName);
              fetchNewsForCountry(countryName, selectedCategory);
            }
          }}
          labelsData={processedCountries.filter(c => c.shouldShow)}
          labelLat={d => d.centroid?.[1] || 0}
          labelLng={d => d.centroid?.[0] || 0}
          labelText={d => d.properties.name}
          labelSize={d => (d.baseSize || 0.3) * zoom}
          labelColor={() => '#FFFFFF'}
          labelResolution={2}
          labelAltitude={0.01}
          labelRotation={0}
          labelIncludeDot={false}
          labelStyle={() => ({ 
            fontWeight: 'bold',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            padding: '2px',
            pointerEvents: 'none'
          })}
          globeImageUrl={null}
          backgroundColor="#0b0e12"
          hexAspectRatio={1}
          atmosphereColor="#88d3cb"
          atmosphereAltitude={0.15}
          showGlobe={true}
          showAtmosphere={true}
          globeColor="#252634"
        />

        {/* Right Side Country Panel */}
        {selectedCountry && (
          <div 
            ref={rightPanelRef}
            className="popup-panel custom-scrollbar"
          >
            {/* Header */}
            <header className="bg-gray-800/50 border-b border-gray-700 -mx-6 -mt-6 px-6 py-4 mb-6">
              <div className="flex items-center justify-between">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="bg-gray-800 text-white border-gray-700">
                    <SheetHeader>
                      <SheetTitle className="text-white">Menu</SheetTitle>
                    </SheetHeader>
                    <nav className="mt-6 space-y-4">
                      <a href="#" className="block py-2 px-4 hover:bg-gray-700 rounded">Home</a>
                      <a href="#" className="block py-2 px-4 hover:bg-gray-700 rounded">Categories</a>
                      <a href="#" className="block py-2 px-4 hover:bg-gray-700 rounded">Saved Articles</a>
                      <a href="#" className="block py-2 px-4 hover:bg-gray-700 rounded">Settings</a>
                    </nav>
                  </SheetContent>
                </Sheet>
                
                <h2 className="text-xl font-bold text-white">{selectedCountry}</h2>
                
                <div className="w-10"></div>
              </div>
            </header>

            {/* Category Filter */}
            <div className="border-b border-gray-700 pb-4 mb-6">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-gray-700 flex items-center"
                >
                  {selectedCategory}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <div className="flex space-x-2 mt-2 overflow-x-auto">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(category);
                      fetchNewsForCountry(selectedCountry, category);
                    }}
                    className={`whitespace-nowrap ${
                      selectedCategory === category 
                        ? "bg-blue-600 hover:bg-blue-700" 
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* News Articles */}
            {error ? (
              <div className="text-red-400 mt-4 p-4 bg-red-900/20 rounded-lg">
                {error}
              </div>
            ) : isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="loading-spinner" />
              </div>
            ) : countryArticles.length > 0 ? (
              <div className="space-y-4">
                {countryArticles.map((article, i) => (
                  <a
                    key={i}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700 hover:bg-gray-800/70 transition-all duration-200"
                  >
                    <img
                      src={article.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-400 text-sm font-medium">{article.category}</span>
                        <span className="text-gray-400 text-sm">{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2 text-white">{article.title}</h3>
                      <p className="text-gray-300 text-sm line-clamp-2">{article.description}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-3 text-blue-400 hover:text-blue-300 hover:bg-gray-700/50 p-0"
                      >
                        Read more
                      </Button>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 mt-4">No news found for {selectedCountry}.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobeView;


