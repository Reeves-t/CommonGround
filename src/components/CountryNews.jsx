import React from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

const CountryNews = ({
  selectedCountry,
  selectedCategory,
  categories,
  isLoading,
  error,
  countryArticles,
  onCategoryChange,
}) => {
  return (
    <div className="popup-panel custom-scrollbar">
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

      {/* Category Dropdown */}
      <div className="border-b border-gray-700 pb-4 mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="text-white hover:bg-gray-700 flex items-center"
            >
              {selectedCategory}
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-800 border-gray-700">
            {categories.map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`text-white hover:bg-gray-700 cursor-pointer ${
                  selectedCategory === category ? "bg-blue-600" : ""
                }`}
              >
                {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
  );
};

export default CountryNews; 