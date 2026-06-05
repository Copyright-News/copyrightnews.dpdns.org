export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Catch Form Submissions
    if (request.method === 'POST' && url.pathname === '/api/submit') {
      try {
        const data = await request.json();
        const timestamp = Date.now();
        const filename = `submission-${timestamp}.json`;
        const path = `content/submissions/${filename}`;
        
        const githubApiUrl = `https://api.github.com/repos/Copyright-News/copyrightnews.dpdns.org/contents/${path}`;
        
        const jsonContent = JSON.stringify({
          type: data.type, name: data.name, email: data.email,
          title: data.title, message: data.message,
          status: "pending", submitted_at: new Date().toISOString()
        }, null, 2);

        // ✅ V8-SAFE BASE64 ENCODER FOR CLOUDFLARE WORKERS
        const encoder = new TextEncoder();
        const bytes = encoder.encode(jsonContent);
        const base64Content = btoa(String.fromCharCode(...bytes));

        const response = await fetch(githubApiUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${env.GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'CopyrightNews-Form-Worker',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            message: `New Submission: ${data.title}`,
            content: base64Content,
            branch: "master"
          })
        });

        if (response.ok) {
          return new Response(JSON.stringify({ success: true }), { 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
          });
        } else {
          // ✅ RETURN THE EXACT GITHUB ERROR TO THE FRONTEND
          const errorData = await response.text();
          return new Response(JSON.stringify({ success: false, error: `GitHub API ${response.status}: ${errorData}` }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
          });
        }
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
      }
    }
    
    // Fallback to serving static assets
    return env.ASSETS.fetch(request);
  }
};
