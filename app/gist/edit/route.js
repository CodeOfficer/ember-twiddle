import GistRoute from "ember-twiddle/routes/gist-base-route";

export default GistRoute.extend({
  model: function(params) {
    return this.store.find('gist', params.id);
  }
});