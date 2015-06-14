export default Em.Controller.extend({
  emberCli: Em.inject.service('ember-cli'),

  rebuildApp: Em.observer('model.files.@each.content', function() {
    Em.run.debounce(this, this.updateIframe, 333);
  }),

  initializeColumns: Em.observer('model', function() {
    var files = this.get('model.files');

    if(files.objectAt(0)) {
      this.set('col1File', files.objectAt(0));
    }

    if(files.objectAt(1)) {
      this.set('col2File', files.objectAt(1));
    }
  }),

  buildErrors: Em.computed('model.files.@each.buildError', function() {
    var files = this.get('model.files');
    var errors = [];
    files.forEach((file) => {
      if (file.get('buildError')) {errors.push(file.get('buildError'));}
    });
    return errors;
  }),

  updateIframe () {
    var ifrm = document.getElementById('demo');
    if(!ifrm) {return;}

    var parent = ifrm.parentElement;
    parent.removeChild(ifrm);

    ifrm = document.createElement('iframe');
    ifrm.id='demo';
    parent.appendChild(ifrm);
    var compiled = this.get('emberCli').compileGist(this.get('model'));

    // console.log('found if');
    var vendorjs = '<script type="text/javascript" src="assets/vendor.js"></script>';
    var appjs = '<script type="text/javascript">%@</script>'.fmt(compiled);


    // var vendorjs = document.createElement('script');
    // vendorjs.src='assets/vendor.js';
    // vendorjs.type='text/javascript';
    // var appjs = document.createElement('script');
    // appjs.type='text/javascript';
    // appjs.innerHTML=compiled;

    ifrm.src="about:blank";
    ifrm = (ifrm.contentWindow) ? ifrm.contentWindow : (ifrm.contentDocument.document) ? ifrm.contentDocument.document : ifrm.contentDocument;
    ifrm.document.open();
    ifrm.document.write('Hello World!');
    ifrm.document.write(vendorjs);
    ifrm.document.write(appjs);
    // ifrm.document.head.appendChild(vendorjs);
    // ifrm.document.body.appendChild(appjs);
    ifrm.document.close();
  },

  activeEditor: null,
  col1File: null,
  col2File: null,
  col1Active: Em.computed.equal('activeEditor.col','1'),
  col2Active: Em.computed.equal('activeEditor.col','2'),

  actions: {
    focusEditor (editor) {
      this.set('activeEditor', editor);
    },

    deleteGist (gist) {
      gist.destroyRecord();
      this.transitionToRoute('gist.new');
      this.notify.info('Gist %@ was deleted from Github'.fmt(gist.get('id')));
    },

    share () {
      prompt('Ctrl + C ;-)', window.location.href);
    },

    addFile (type) {
      var template = '';
      var filePath = '';
      if(type==='component-hbs') {
        template = '<b class="foo">{{yield}}</b>';
        filePath = 'templates/components/foo-component.hbs';
      }
      if(type==='component-js') {
        template = 'export default Ember.Component.extend({\n});';
        filePath = 'components/foo-component.js';
      }
      else if(type==='controller') {
        template = 'export default Ember.Controller.extend({\n});';
        filePath = 'controllers/foo.js';
      }
      else if(type==='template') {
        template = '<b>Hi!</b>';
        filePath = 'templates/foo.hbs';
      }

      filePath = prompt('File path', filePath);

      if (filePath) {
        if(this.get('model.files').findBy('filePath', filePath)) {
          alert('A file with the name %@ already exists'.fmt(filePath));
          return;
        }

        let file = this.store.createRecord('gistFile', {
          filePath: filePath,
          content: template
        });

        this.get('model.files').pushObject(file);
        this.notify.info('File %@ was added'.fmt(file.get('filePath')));
        this.set('col1File', file);
      }
    },

    renameFile (file) {
      let filePath = prompt('File path', file.get('filePath'));
      if (filePath) {
        if(this.get('model.files').findBy('filePath', filePath)) {
          alert('A file with the name %@ already exists'.fmt(filePath));
          return;
        }

        file.set('filePath', filePath);
        this.notify.info('File %@ was added'.fmt(file.get('filePath')));
      }
    },

    showErrors () {
      this.get('buildErrors').forEach((error) => {
        console.error(error);
      });
      this.notify.info('Errors were dumped to console');
    },

    fork (gist) {
      var newGistData = {
        description: 'Fork of %@'.fmt(gist.get('description'))
      };

      var filesBuffer = [];

      gist.get('files').forEach(file => {
        filesBuffer.pushObject({
          filePath: file.get('filePath'),
          content: file.get('content'),
        });
      });

      this.store.unloadAll('gistFile');

      var newGist = this.store.createRecord('gist', newGistData);
      filesBuffer.forEach(fileData => {
        newGist.get('files').pushObject(this.store.createRecord('gistFile', fileData));
      });

      this.controllerFor('gist').set('fork', newGist);
      this.notify.info('Succesfully created %@'.fmt(newGist.get('description')));
      this.transitionToRoute('gist.new');
    },

    removeFile (file) {
      if(confirm(`Are you sure you want to remove this file?\n\n${file.get('filePath')}`)) {
        file.deleteRecord();
        this.notify.info('File %@ was deleted'.fmt(file.get('filePath')));
        this.set('activeEditor.file',null);
      }
    }
  }
});