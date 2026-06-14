import { Helmet } from 'react-helmet-async'

const BlogPage = () => {
  return (
    <>
      <Helmet>
        <title>Blog - Global Education | Study Abroad Guides & Tips</title>
        <meta name="description" content="Read our latest blog posts about study abroad, university guides, visa tips, and more." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Study Abroad Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Expert insights, guides, and tips for your study abroad journey
            </p>
          </div>

          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Blog coming soon
            </h3>
            <p className="text-gray-600">
              We're working on creating valuable content for your study abroad journey.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default BlogPage








