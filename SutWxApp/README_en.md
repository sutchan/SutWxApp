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
└── pages/              # Pages directory
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

- v1.0.0: Initial version, basic functions implemented

## License

MIT