addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const hostname = url.hostname
  
  // Only process subdomains of rentapog.com
  if (!hostname.endsWith('.rentapog.com')) {
    return fetch(request)
  }
  
  // Extract subdomain
  const subdomain = hostname.replace('.rentapog.com', '').toLowerCase()
  
  // Skip system subdomains - let them pass through to Replit
  const systemSubdomains = ['backend', 'backoffice', 'packages', 'api', 'admin', 'sales', 'domain', 'www', 'mail', 'send', '_dmarc']
  if (systemSubdomains.includes(subdomain) || subdomain.includes('_domainkey')) {
    return fetch(request)
  }
  
  // Look up user by subdomain via API
  try {
    const apiResponse = await fetch(`https://rentapog.com/api/affiliate-by-subdomain/${subdomain}`, {
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (apiResponse.ok) {
      const data = await apiResponse.json()
      
      if (data.found && data.referralCode) {
        // Redirect to affiliate link
        const redirectUrl = `https://rentapog.com/?aff=${data.referralCode}`
        return Response.redirect(redirectUrl, 301)
      }
    }
    
    // Subdomain not found - redirect to main site
    return Response.redirect('https://rentapog.com', 301)
    
  } catch (error) {
    // On error, redirect to main site
    console.error('Worker error:', error)
    return Response.redirect('https://rentapog.com', 301)
  }
}
