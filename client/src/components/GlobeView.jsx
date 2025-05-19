import React, { useEffect, useState } from 'react';
import Globe from 'react-globe.gl';
import Headlines from './Headlines';

const GlobeView = () => {
  const [countries, setCountries] = useState([]);
  const [articles, setArticles] = useState([]);


  useEffect(() => {
  // Fetch countries
  fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
    .then(res => res.json())
    .then(data => setCountries(data.features.slice(0, 50)));

  // Fetch top headlines from GNews
  const fetchNews = async () => {
    try {
      const response = await fetch(`https://gnews.io/api/v4/top-headlines?lang=en&token=${import.meta.env.VITE_GNEWS_API_KEY}`);
      const data = await response.json();
      console.log("📰 Top News:", data.articles);
      setArticles(data.articles);
 // Just logging for now
    } catch (err) {
      console.error("Failed to fetch news:", err);
    }
  };

  fetchNews();
}, []);


 return (
  <div
    style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#000',
      color: 'white',
      overflow: 'hidden',
    }}
  >
    {/* Headlines panel on the left */}
    <div
      style={{
        width: '30%',
        maxWidth: '400px',
        backgroundColor: '#111',
        padding: '1rem',
        overflowY: 'auto',
      }}
    >
      <Headlines articles={articles} />
    </div>

    {/* Globe on the right */}
    <div style={{ flex: 1 }}>
      <Globe
        polygonsData={countries}
        polygonCapColor={() => 'rgba(50, 200, 255, 0.7)'}
        polygonSideColor={() => 'rgba(0, 100, 255, 0.2)'}
        polygonStrokeColor={() => '#111'}
      />
    </div>
  </div>
);


};

export default GlobeView;


