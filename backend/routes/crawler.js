const express = require('express');
const router = express.Router();
const axios = require('axios');
const Alumni = require('../models/Alumni');

// Crawlbase API token
const CRAWLBASE_TOKEN = "2qOTHbatDgmq3QipejyxUw";

// Unified error handler
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ success: false, message, error: error.message });
};

// LinkedIn crawler using Crawlbase API
router.post('/crawl-linkedin', async (req, res) => {
  const { url, keywords = [], maxProfiles = 10 } = req.body;
  
  // Validate LinkedIn URL
  if (!url || !url.includes("linkedin.com")) {
    return res.status(400).json({ success: false, message: "Invalid LinkedIn URL" });
  }
  
  console.log(`Starting LinkedIn crawl for URL: ${url}`);
  
  try {
    // Call Crawlbase API
    const apiUrl = `https://api.crawlbase.com/?token=${CRAWLBASE_TOKEN}&url=${encodeURIComponent(url)}&javascript=true`;
    const response = await axios.get(apiUrl);
    
    // Process the HTML response
    const htmlData = response.data;
    
    // Extract profile data from the HTML (simplified example)
    // In a production environment, you would use a proper HTML parser like cheerio
    const profileData = extractProfileData(htmlData, url);
    
    // Save extracted profile to database
    const results = {
      added: 0,
      duplicates: 0,
      errors: 0
    };
    
    try {
      // Use profile URL as unique identifier
      const existingAlumni = await Alumni.findOne({ 
        $or: [
          { linkedInUrl: profileData.profileUrl },
          { name: profileData.name, company: profileData.company } // Alternative check
        ]
      });
      
      if (existingAlumni) {
        results.duplicates++;
      } else {
        const alumni = new Alumni({
          name: profileData.name,
          batch: profileData.batch,
          department: profileData.education, // Use education as department
          email: profileData.email,
          company: profileData.company,
          position: profileData.position,
          linkedInUrl: profileData.profileUrl,
          location: profileData.location,
          profiles: ['linkedin']
        });
        
        await alumni.save();
        results.added++;
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      results.errors++;
    }
    
    res.json({
      success: true,
      message: `LinkedIn crawl completed successfully.`,
      profile: profileData,
      results
    });
  } catch (error) {
    handleError(res, error, 'Error during LinkedIn crawling with Crawlbase API');
  }
});

// Search and crawl multiple LinkedIn profiles based on keywords
router.post('/linkedin-search', async (req, res) => {
  const { keywords = [], maxProfiles = 10 } = req.body;

  if (!keywords || keywords.length === 0) {
    return res.status(400).json({ success: false, message: 'Search keywords required' });
  }

  console.log(`Starting LinkedIn search with keywords:`, keywords);

  try {
    // Construct search query based on keywords
    const searchQuery = keywords.join(' ');
    
    // First, use Crawlbase to get the search results page
    const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(searchQuery)}`;
    const apiUrl = `https://api.crawlbase.com/?token=${CRAWLBASE_TOKEN}&url=${encodeURIComponent(searchUrl)}&javascript=true`;
    
    const response = await axios.get(apiUrl);
    
    // Extract profile links from the search results HTML
    // This is a simplified example. In production, use a proper HTML parser
    const profileLinks = extractProfileLinks(response.data, maxProfiles);
    
    console.log(`Found ${profileLinks.length} profile links, preparing to scrape data...`);
    
    // Array to store profile data
    const profileData = [];
    
    // Visit each profile and extract data
    for (let i = 0; i < profileLinks.length; i++) {
      const profileUrl = profileLinks[i];
      console.log(`Visiting profile ${i+1}/${profileLinks.length}: ${profileUrl}`);
      
      try {
        // Use Crawlbase to get the profile page
        const profileApiUrl = `https://api.crawlbase.com/?token=${CRAWLBASE_TOKEN}&url=${encodeURIComponent(profileUrl)}&javascript=true`;
        const profileResponse = await axios.get(profileApiUrl);
        
        // Extract profile data from the HTML
        const profile = extractProfileData(profileResponse.data, profileUrl);
        
        // Add to results
        profileData.push(profile);
        
        // Don't hammer servers, add random delay between requests
        const delay = 3000 + Math.floor(Math.random() * 2000);
        console.log(`Waiting ${delay}ms before next profile...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
      } catch (error) {
        console.error(`Error scraping profile ${profileUrl}:`, error.message);
        // Continue with next profile
        continue;
      }
    }
    
    console.log(`Scraped ${profileData.length} profiles successfully`);
    
    // Save extracted profiles to database
    const results = {
      added: 0,
      duplicates: 0,
      errors: 0
    };
    
    for (const profile of profileData) {
      try {
        // Use profile URL as unique identifier
        const existingAlumni = await Alumni.findOne({ 
          $or: [
            { linkedInUrl: profile.profileUrl },
            { name: profile.name, company: profile.company } // Alternative check
          ]
        });
        
        if (existingAlumni) {
          results.duplicates++;
          continue;
        }
        
        const alumni = new Alumni({
          name: profile.name,
          batch: profile.batch,
          department: profile.education, // Use education as department
          email: profile.email,
          company: profile.company,
          position: profile.position,
          linkedInUrl: profile.profileUrl,
          location: profile.location,
          profiles: ['linkedin']
        });
        
        await alumni.save();
        results.added++;
      } catch (err) {
        console.error('Error saving profile:', err);
        results.errors++;
      }
    }
    
    res.json({
      success: true,
      message: `LinkedIn search and crawl completed successfully. Found ${profileData.length} profiles.`,
      profiles: profileData,
      results
    });
  } catch (error) {
    handleError(res, error, 'Error during LinkedIn search and crawling');
  }
});

// Helper function to extract profile links from search results HTML
function extractProfileLinks(html, maxProfiles) {
  // This is a simplified placeholder implementation
  // In a production environment, use a proper HTML parser like cheerio
  
  // Extract profile URLs using regex (simple example)
  const profileUrlRegex = /https:\/\/www\.linkedin\.com\/in\/[a-zA-Z0-9-]+/g;
  const matches = html.match(profileUrlRegex) || [];
  
  // Return unique profile URLs up to the maximum limit
  return [...new Set(matches)].slice(0, maxProfiles);
}

// Helper function to extract profile data from LinkedIn profile HTML
function extractProfileData(html, profileUrl) {
  // This is a simplified placeholder implementation
  // In a production environment, use a proper HTML parser like cheerio
  
  // Extract basic info using regex (simple example)
  const nameMatch = html.match(/<title>(.*?) \|/);
  const name = nameMatch ? nameMatch[1] : '';
  
  const headlineMatch = html.match(/class="text-body-medium"[^>]*>(.*?)<\/span>/);
  const headline = headlineMatch ? headlineMatch[1] : '';
  
  const locationMatch = html.match(/class="text-body-small inline t-black--light break-words"[^>]*>(.*?)<\/span>/);
  const location = locationMatch ? locationMatch[1] : '';
  
  // Extract other information (simplified)
  const companyMatch = html.match(/company-name"[^>]*>(.*?)<\/span>/);
  const company = companyMatch ? companyMatch[1] : '';
  
  const positionMatch = html.match(/position-title"[^>]*>(.*?)<\/span>/);
  const position = positionMatch ? positionMatch[1] : '';
  
  const educationMatch = html.match(/education-title"[^>]*>(.*?)<\/span>/);
  const education = educationMatch ? educationMatch[1] : '';
  
  const batchMatch = html.match(/education-date"[^>]*>.*?(\d{4})</);
  const batch = batchMatch ? batchMatch[1] : '';
  
  // Return extracted profile data
  return {
    name,
    email: '', // Email is typically not visible on LinkedIn profiles
    headline,
    location,
    company,
    position,
    education,
    batch,
    profileUrl
  };
}

module.exports = router;