锘? SUT WeChat Mini Program Plugin

[![GitHub release](https://img.shields.io/github/release/sutchan/SutWxApp.svg)](https://github.com/sutchan/SutWxApp/releases)
[![License](https://img.shields.io/github/license/sutchan/SutWxApp.svg)](https://github.com/sutchan/SutWxApp/blob/master/LICENSE)

**Version: 1.0.3**
*Last Updated: January 15, 2024*

The SUT WeChat Mini Program Plugin is a plugin that provides WeChat Mini Program integration for WordPress websites, supporting content display, e-commerce functions, user management, message push, and more. This plugin provides a complete set of API interfaces for WeChat Mini Programs to call.

## Features

- **Content Synchronization**: Synchronize WordPress articles, pages, categories, etc. to the WeChat Mini Program
- **User Management**: Support WeChat Mini Program user login, registration, personal information management, etc.
- **E-commerce Functions**: Integration with WooCommerce, supporting product display, shopping cart, order management, etc.
- **WeChat Payment**: Integration with WeChat Payment, supporting in-Mini Program payments
- **Message Push**: Support multiple message push methods including template messages, subscription messages, customer service messages, etc.
- **Points System**: Built-in points system, supporting缁涙儳鍩? commenting, sharing and other behaviors to earn points
- **Cache Management**: Built-in cache system to improve Mini Program access speed
- **Data Statistics**: Provide user growth, sales and other data statistics functions
- **Multi-language Support**: Support Chinese and other languages

## Environment Requirements

- WordPress 4.7 or higher
- PHP 5.6 or higher
- MySQL 5.6 or higher
- WeChat Mini Program account
- WeChat Payment merchant number (for e-commerce functions)
- WooCommerce 3.0 or higher (for e-commerce functions)

## Installation Methods

### Method 1: Direct Upload Installation

1. Download the plugin's ZIP file
2. Log in to the WordPress backend, go to "Plugins" > "Add New"
3. Click "Upload Plugin", select the downloaded ZIP file, click "Install Now"
4. After installation is complete, click "Activate Plugin"

### Method 2: Using Git Clone

```bash
cd /path/to/wordpress/wp-content/plugins
git clone https://github.com/sutchan/SutWxApp.git sut-wechat-mini
```

Then activate the plugin in the WordPress backend.

## Configuration Instructions

1. After installing and activating the plugin, a "SUT WeChat Mini Program" menu item will appear in the WordPress backend sidebar
2. Click to enter the "Basic Settings" page, fill in the following necessary information:
   - Mini Program AppID: Obtained from the WeChat Official Platform
   - Mini Program AppSecret: Obtained from the WeChat Official Platform
   - WeChat Payment Merchant ID (MCH_ID): For e-commerce functions, obtained from the WeChat Payment Merchant Platform
   - WeChat Payment API Key: Set in the WeChat Payment Merchant Platform
3. After saving the settings, the plugin will automatically create the required database tables
4. To enable message push function, please configure the corresponding message template IDs

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