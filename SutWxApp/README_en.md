# SUT WeChat Mini Program

This is a WeChat Mini Program frontend project developed based on WordPress, used for displaying and managing content related to SUT (School of Urban Technology), including articles, categories, etc.

## Project Structure

```
SutWxApp/
├── app.js              # Mini Program entry file
├── app.json            # Global configuration file
├── app.wxss            # Global style file
├── images/             # Image resources directory
│   ├── default-avatar.png    # Default avatar image
│   └── tabbar/               # Bottom tabbar icons
├── pages/              # Pages directory
    ├── index/          # Home page
    ├── category/       # Category page
    ├── article/        # Article related pages
    │   └── detail/     # Article detail page
    └── user/           # User related pages
        ├── login/      # Login page
        └── profile/    # User profile page
```

## Functional Modules

### Home Page (index)
- Carousel display
- Search function
- Category navigation
- Popular article recommendations
- Latest article list

### Category Page (category)
- Category list display
- Sub-category filtering
- Article list under categories
- Pull-down refresh and pull-up load more

### Article Detail Page (article/detail)
- Article content display
- Author information display
- Like function
- Favorite function
- Comment function
- Share function
- Related article recommendations

### User Module
- User login (WeChat authorized login)
- User profile management
- My favorites
- My comments
- Message notifications

## Development Environment
- WeChat Developer Tools
- JavaScript
- WXML (WeChat Markup Language)
- WXSS (WeChat Style Sheets)

## API Configuration
The API endpoints need to be configured in the `config.js` file. The default API endpoint is set to the WordPress REST API.

```javascript
// API configuration example
const API_BASE_URL = 'https://example.com/wp-json/sut/v1';
const API_TIMEOUT = 10000; // 10 seconds

module.exports = {
  API_BASE_URL,
  API_TIMEOUT
};
```

## Tech Stack
- WeChat Mini Program Framework
- JavaScript
- WordPress (Backend)
- RESTful API

## Development Dependencies
- WeChat Developer Tools
- ESLint (for code quality)
- Prettier (for code formatting)

## Version
1.0.16

## Last Updated
November 1, 2024

## License
MIT

## Author
Sut

## Repository
https://github.com/sutchan