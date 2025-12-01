﻿/**
 * 鏂囦欢鍚? README_en.md
 * 鐗堟湰鍙? 1.0.0
 * 鏇存柊鏃ユ湡: 2025-11-23
 * 鎻忚堪: README_en 鏂囨。鏂囦欢
 */
# SUT WeChat Mini Program Project

[![GitHub release](https://img.shields.io/github/release/sutchan/SutWxApp.svg)](https://github.com/sutchan/SutWxApp/releases)
[![License](https://img.shields.io/github/license/sutchan/SutWxApp.svg)](https://github.com/sutchan/SutWxApp/blob/master/LICENSE)

**Version: 1.0.9**
*Last Updated: November 7, 2024*

The SUT WeChat Mini Program Project is a complete WordPress + WeChat Mini Program solution, including a WordPress plugin and a WeChat Mini Program frontend, designed to synchronize and display WordPress website content and features in WeChat Mini Program. This project provides rich features such as content management, user management, e-commerce functionality, WeChat payment, message push, and more.

## 2. Project Structure

The SUT WeChat Mini Program project consists of two main components:

- **WordPress Plugin** (`sut-wechat-mini`): Responsible for content synchronization, user authentication, and data interaction
- **Mini Program Frontend** (`SutWxApp`): Provides user interface and interaction experience

## 3. Documentation

Project documentation is stored in the `docs` directory, including:

- **Project Overview**: Project positioning, core features, technical architecture
- **Admin Guide**: Installation, configuration, system management
- **Developer Guide**: Architecture design, API documentation, technical implementation
- **User Guide**: Function usage instructions, FAQ
- **API Documentation**: Complete interface specifications and usage examples
- **Installation Guide**: Detailed environment configuration and installation steps
- **Feature Module Description**: Detailed introduction and usage of each functional module

## Features

### 1. WordPress Plugin Features

- **Content Synchronization**: Synchronize WordPress articles, pages, categories, etc. to the WeChat Mini Program
- **User Management**: Support WeChat Mini Program user login, registration, personal information management, etc.
- **E-commerce Functions**: Integration with WooCommerce, supporting product display, shopping cart, order management, etc.
- **WeChat Payment**: Integration with WeChat Payment, supporting in-Mini Program payments
- **Message Push**: Support multiple message push methods including template messages, subscription messages, customer service messages, etc.
- **Points System**: Built-in points system, supporting check-in, commenting, sharing and other behaviors to earn points
- **Cache Management**: Built-in cache system to improve Mini Program access speed
- **Data Statistics**: Provide user growth, sales and other data statistics functions
- **Multi-language Support**: Support Chinese and other languages

### 2. WeChat Mini Program Frontend Features

- **Home Page**: Carousel display, search function, category navigation, popular article recommendations, latest article list
- **Category Page**: Category list display, sub-category filtering, article list under categories, pull-down refresh and pull-up load more
- **Article Detail Page**: Article content display, author information display, like function, favorite function, comment function, share function, related article recommendations
- **User Module**: User login (WeChat authorized login), user center (user information display), favorite management, address management, check-in function

## Environment Requirements

### WordPress Plugin Requirements

- WordPress 4.7 or higher
- PHP 5.6 or higher (PHP 7.0+ recommended)
- MySQL 5.6 or higher
- WeChat Mini Program account
- WeChat Payment merchant number (for e-commerce functions)
- WooCommerce 3.0 or higher (for e-commerce functions)

### WeChat Mini Program Requirements

- WeChat Developer Tools
- WeChat Mini Program AppID
- Configured server domain name

## Installation and Configuration

### 1. WordPress Plugin Installation

#### Method 1: Direct Upload Installation

1. Download the plugin's ZIP file
2. Log in to the WordPress backend, go to "Plugins" > "Add New"
3. Click "Upload Plugin", select the downloaded ZIP file, click "Install Now"
4. After installation is complete, click "Activate Plugin"

#### Method 2: Using Git Clone

```bash
cd /path/to/wordpress/wp-content/plugins
git clone https://github.com/sutchan/SutWxApp.git sut-wechat-mini
```

Then activate the plugin in the WordPress backend.

### 2. WordPress Plugin Configuration

1. After installing and activating the plugin, a "SUT WeChat Mini Program" menu item will appear in the WordPress backend sidebar
2. Click to enter the "Basic Settings" page, fill in the following necessary information:
   - Mini Program AppID: Obtained from the WeChat Official Platform
   - Mini Program AppSecret: Obtained from the WeChat Official Platform
   - WeChat Payment Merchant ID (MCH_ID): For e-commerce functions, obtained from the WeChat Payment Merchant Platform
   - WeChat Payment API Key: Set in the WeChat Payment Merchant Platform
3. After saving the settings, the plugin will automatically create the required database tables
4. To enable message push function, please configure the corresponding message template IDs

### 3. WeChat Mini Program Configuration

1. Install WeChat Developer Tools
2. Import the SutWxApp project
3. Configure the Mini Program AppID in project.config.json
4. Configure the API base address in app.js:

```javascript
App({
  globalData: {
    apiBaseUrl: 'https://your-wordpress-site.com/wp-json/sut-wechat-mini/v1'
  }
  // ...other configurations
})
```

5. Set up the server domain name in WeChat Developer Tools
6. Compile and run the Mini Program

## API Documentation

The plugin provides rich API interfaces for WeChat Mini Programs to call. The base URL for all API interfaces is: `http://your-site.com/sut-wechat-mini-api/`

### Basic APIs

- `ping`: Check if the API connection is normal
- `login`: User login
- `user/profile`: Get user information

### User-related APIs

- `user/address/list`: Get user address list
- `user/address/add`: Add user address
- `user/address/update`: Update user address
- `user/address/delete`: Delete user address
- `user/favorite/list`: Get user favorite list
- `user/favorite/add`: Add favorite
- `user/favorite/delete`: Cancel favorite
- `user/signin`: User check-in
- `user/signin/history`: Get check-in history

### Content-related APIs

- `content/articles`: Get article list
- `content/article/detail`: Get article details
- `content/article/search`: Search articles
- `content/article/hot`: Get popular articles
- `content/article/latest`: Get latest articles
- `content/categories`: Get category list
- `content/category/articles`: Get articles under a category
- `content/tags`: Get tag list
- `content/tag/articles`: Get articles under a tag
- `content/pages`: Get page list
- `content/page/detail`: Get page details

### E-commerce-related APIs

(Requires installation and activation of WooCommerce)

- `product/list`: Get product list
- `product/detail`: Get product details
- `product/search`: Search products

## Development Notes

1. Ensure that the `sut-wechat-mini` plugin is installed and activated on the WordPress side
2. Ensure that the server domain name has been configured in the WeChat Developer Tools
3. Use the test environment during development, switch to the production environment before release
4. Follow WeChat Mini Program development specifications and design guidelines
5. For custom functions, please refer to the extension interfaces provided by the plugin

## Troubleshooting

### Plugin Activation Failure

If the plugin activation fails, it may be due to a low PHP version or incompatible WordPress version. Please ensure:
- PHP version is not lower than 5.6.0 (7.0+ recommended)
- WordPress version is not lower than 4.7.0

### API Connection Failure

If the Mini Program cannot connect to the API, please check:
- Whether the WordPress website is running normally
- Whether the API base address of the Mini Program is correct
- Whether the server domain name has been configured in WeChat Developer Tools

## Version Update Log

- v1.0.0: Initial version, basic functions implemented

## License

This project is open-source under the MIT License. For details, please see the [LICENSE](https://github.com/sutchan/SutWxApp/blob/master/LICENSE) file.

## Contact Us

If you encounter any problems during use or have any suggestions, please contact us through the following methods:

- GitHub: [https://github.com/sutchan/SutWxApp](https://github.com/sutchan/SutWxApp)
\n