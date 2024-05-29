let apiRoot = ''

if (process.env.BUILD_MODE === 'dev') {
  apiRoot = 'http://localhost:8017'
}
if (process.env.BUILD_MODE === 'production') {
  apiRoot = 'https://cassani-api.onrender.com'
}

export const API_ROOT = apiRoot
// export const API_ROOT = 'http://localhost:8017'
