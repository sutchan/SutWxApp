# SUT WeChat Mini Program

This is a WeChat Mini Program frontend project developed based on WordPress, used for displaying and managing content related to SUT (School of Urban Technology), including articles, categories, etc.

## Project Structure

```
SutWxApp/
鈹溾攢鈹€ app.js              # Mini Program entry file
鈹溾攢鈹€ app.json            # Global configuration file
鈹溾攢鈹€ app.wxss            # Global style file
鈹溾攢鈹€ images/             # Image resources directory
鈹?  鈹溾攢鈹€ default-avatar.png    # Default avatar image
鈹?  鈹斺攢鈹€ tabbar/               # Bottom tabbar icons
鈹斺攢鈹€ pages/              # Pages directory
    鈹溾攢鈹€ index/          # Home page
    鈹溾攢鈹€ category/       # Category page
    鈹溾攢鈹€ article/        # Article related pages
    鈹?  鈹斺攢鈹€ detail/     # Article detail page
    鈹斺攢鈹€ user/           # User related pages
        鈹溾攢鈹€ login/      # Login page
        鈹斺攢鈹€ profile/    # User profile page
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
- User center (user information display)
- Favorite management
- Address management
- Check-in function

## Development Environment Configuration

1. Install WeChat Developer Tools
2. Import the project
3. Configure Mini Program AppID
4. Set up server domain name

## API Configuration

Configure the API base address in `app.js`:

```javascript
App({
  globalData: {
    apiBaseUrl: 'https://your-wordpress-site.com/wp-json/sut-wechat-mini/v1'
  }
  // ...other configurations
})
```

## Notes

1. Ensure that the `sut-wechat-mini` plugin is installed and activated on the WordPress side
2. Ensure that the server domain name has been configured in the WeChat Developer Tools
3. Use the test environment during development, switch to the production environment before release
4. Follow WeChat Mini Program development specifications and design guidelines

## Update Log

- v1.0.3: Updated and improved documentation and functions, released on January 15, 2024
- v1.0.0: Initial version, basic functions implemented

## License

MIT