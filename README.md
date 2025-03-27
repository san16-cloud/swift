# Swift by Lumix Labs
[![smithery badge](https://smithery.ai/badge/@lumix-labs/swift)](https://smithery.ai/server/@lumix-labs/swift)

Ship Legacy Code 5x Faster Without Risky Rewrites

## About

Swift by Lumix Labs helps engineering leaders transform legacy systems from innovation bottlenecks to competitive advantages. Deploy faster, reduce incidents, and modernize incrementally without risky rewrites or expensive consultants.

## Key Features

- Accelerate legacy deployment cycles from weeks to days
- Reduce technical debt costs by up to 40%
- Zero-disruption implementation
- Cut legacy system incidents by 60%

## Documentation

Visit our [GitHub Pages site](https://lumix-labs.github.io/swift/) for complete documentation and guides.

## GitHub Pages Website

This repository includes a GitHub Pages website in the `/docs` directory. The site is automatically published when changes are pushed to the main branch.

### Website Development

To run the website locally:

1. Navigate to the `docs` directory
2. Install Ruby and Bundler if you don't have them
3. Run `bundle install` to install dependencies
4. Run `bundle exec jekyll serve` to start a local server
5. Visit `http://localhost:4000` in your browser

### Making Changes

- Edit the Markdown files in `/docs` to update content
- Modify `_config.yml` to change site-wide settings
- Update CSS in `/docs/assets/css/style.scss`

### Demo Request Feature

The website includes a demo request form that connects to n8n for lead capture and email notifications:

- Form submissions are sent to an n8n workflow via webhook
- Leads are stored in a database and trigger email notifications

To configure the n8n webhook:

1. Set up the n8n workflow following the instructions in the integration doc
2. Update the `N8N_WEBHOOK_URL` variable in `docs/assets/js/form-handler.js`
3. Test the form submission to ensure proper functionality

## License

See the [LICENSE](LICENSE) file for details.
