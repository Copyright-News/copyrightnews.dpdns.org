export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/admin' || path === '/admin/') {
      url.pathname = '/admin/index.html';
    }

    return env.ASSETS.fetch(request);
  }
}
