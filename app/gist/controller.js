import TwiddleResolver from "ember-twiddle/lib/twiddle-resolver";
import File from "ember-twiddle/lib/file";

export default Em.Controller.extend({
  contentObserver: Em.observer('model.files.@each.compiled', function () {
    Em.run.debounce(this, 'setupApplication', 500);
  }.on('init')),

  setupApplication () {
    if(this.currentApp) {
      Em.run(this.currentApp, 'destroy');
    }

    this.currentApp = Em.Application.create({
      name:         "App",
      rootElement:  '#demo-app',
      modulePrefix: 'demo-app',
      Resolver:     TwiddleResolver.extend({files: this.get('model.files')})
    });
  },

  actions: {
    addFile () {
      this.get('model').addFile('');
    },

    removeFile (file) {
      if(confirm(`Are you sure you want to remove this file?\n\n${file.get('name')}`)) {
        this.get('model').removeFile(file);
      }
    }
  }
});