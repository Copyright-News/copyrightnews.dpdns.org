export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Catch Form Submissions
    if (request.method === 'POST' && url.pathname === '/api/submit') {
      try {
        const data = await request.json();
        const timestamp = Date.now();
        const filename = `submission-${timestamp}.json`;
        const path = `content/submissions/${filename}`;
        
        // GitHub API to create file in your repo
        const githubApiUrl = `https://api.github.com/repos/Copyright-News/copyrightnews.dpdns.org/contents/${path}`;
        
        const content = JSON.stringify({
          type: data.type, name: data.name, email: data.email,
          title: data.title, message: data.message,
          status: "pending", submitted_at: new Date().toISOString()
        }, null, 2);

        const response = await fetch(githubApiUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${env.GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'CopyrightNews-Form-Worker'
          },
          body: JSON.stringify({
            message: `New Submission: ${data.title}`,
            content: btoa(unescape(encodeURIComponent(content))) // Base64 encode
          })
        });

        if (response.ok) {
          return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
        } else {
          return new Response(JSON.stringify({ success: false }), { status: 500 });
        }
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
      }
    }
    
    // Fallback to serving static assets
    return env.ASSETS.fetch(request);
  }
};
